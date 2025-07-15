import React, { useEffect, useState } from 'react';
import audioBufferToWav from 'audiobuffer-to-wav';
import { API_ENDPOINTS } from '@/lib/constants';

interface DubbingListenModalProps {
  open: boolean;
  onClose: () => void;
  tokenId: number;
  modalId?: string;
}
interface AudioURL { script_id: number; url: string; }
interface UserAudioResponse { audios: AudioURL[]; }

interface TokenDetailResponse {
  bgvoice_url: string;
  scripts: {
    id: number;
    start_time: number;
    end_time: number;
  }[];
}

// 401 발생 시 /auth/refresh/로 토큰 갱신 후 재시도하는 fetch 래퍼
async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  let accessToken = localStorage.getItem('access_token');
  const headers: Record<string, string> = {
    ...(options.headers || {}),
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
  let res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    // 토큰 갱신 시도
    const refreshRes = await fetch(`${API_ENDPOINTS.BASE_URL}/auth/refresh/`, {
      method: 'POST',
      headers,
    });
    if (refreshRes.ok) {
      const data = await refreshRes.json();
      const newToken = data.access_token || data.token;
      if (newToken) {
        localStorage.setItem('access_token', newToken);
        headers.Authorization = `Bearer ${newToken}`;
        res = await fetch(url, { ...options, headers });
      }
    } else {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
      throw new Error('토큰 갱신 실패, 다시 로그인 필요');
    }
  }
  return res;
}

// ✔️ 스크립트별 시간 정보로 배경음+사용자음 믹스 (배경음 전체 길이 유지, 구간별 overlay)
async function mixBackgroundAndUserAudiosByScript(
  bgUrl: string,
  userAudios: AudioURL[],
  scripts: ScriptInfo[]
): Promise<Blob> {
  const ctx = new AudioContext();
  const bgAudio = await fetchAndDecodeAudio(bgUrl, ctx);

  // 1. output 버퍼를 배경음 전체 길이로 생성
  const outBuf = ctx.createBuffer(1, bgAudio.length, ctx.sampleRate);
  const out = outBuf.getChannelData(0);
  const bgData = bgAudio.getChannelData(0);

  // 2. 일단 배경음을 복사
  out.set(bgData);

  // 3. 각 스크립트 구간에 유저 오디오 overlay
  for (const script of scripts) {
    const userAudio = userAudios.find(a => a.script_id === script.script_id);
    if (!userAudio) continue;
    const userBuf = await fetchAndDecodeAudio(userAudio.url, ctx);
    const duration = script.end_time - script.start_time;
    const length = Math.floor(ctx.sampleRate * duration);
    const userData = userBuf.getChannelData(0).slice(0, length);

    const startIdx = Math.floor(script.start_time * ctx.sampleRate);
    for (let i = 0; i < length; ++i) {
      // 배경음 + 유저음성 overlay (볼륨 가중치 조정 가능)
      out[startIdx + i] = (out[startIdx + i] || 0) * 0.5 + (userData[i] || 0) * 1.0;
    }
  }

  const wav = audioBufferToWav(outBuf);
  return new Blob([wav], { type: "audio/wav" });
}

async function getTokenBackgroundAudioAndScripts(tokenId: number): Promise<{
  bgvoice_url: string | null;
  scripts: ScriptInfo[];
}> {
  try {
    const accessToken = localStorage.getItem('access_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
    const res = await fetchWithAuth(`${API_ENDPOINTS.BASE_URL}/tokens/${tokenId}`, { method: 'GET', headers });
    if (!res.ok) return { bgvoice_url: null, scripts: [] };
    const data: TokenDetailResponse = await res.json();
    const scripts = Array.isArray(data.scripts)
      ? data.scripts.map(s => ({
          script_id: s.id,
          start_time: s.start_time,
          end_time: s.end_time,
        }))
      : [];
    return { bgvoice_url: data.bgvoice_url ?? null, scripts };
  } catch {
    return { bgvoice_url: null, scripts: [] };
  }
}

async function getUserAudioUrls(tokenId: number): Promise<AudioURL[]> {
  try {
    const url = `${API_ENDPOINTS.BASE_URL}/tokens/${tokenId}/user-audios`;
    const accessToken = localStorage.getItem('access_token');
    const headers: Record<string, string> = {};
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
    const res = await fetchWithAuth(url, { method: 'GET', headers: { 'Content-Type': 'application/json', ...headers } });
    if (!res.ok) return [];
    const data: UserAudioResponse = await res.json();
    return data.audios || [];
  } catch { return []; }
}

async function waitForUserAudio(tokenId: number, maxTries = 10, interval = 1000): Promise<AudioURL[]> {
  for (let i = 0; i < maxTries; i++) {
    const audios = await getUserAudioUrls(tokenId);
    if (audios.length > 0) return audios;
    await new Promise(res => setTimeout(res, interval));
  }
  return [];
}

async function fetchAndDecodeAudio(url: string, ctx: AudioContext) {
  const proxyUrl = `/api/proxy-audio?url=${encodeURIComponent(url)}`;
  const res = await fetch(proxyUrl);
  if (!res.ok) throw new Error("오디오 로딩 실패");
  const arrayBuffer = await res.arrayBuffer();
  return await ctx.decodeAudioData(arrayBuffer);
}

interface ScriptInfo {
  script_id: number;
  start_time: number;
  end_time: number;
}

// 분석 결과 polling 함수 (job_id로 S3 URL 받아오기)
async function pollAnalysisResult(jobId: string, maxTries = 10, interval = 1500): Promise<string | null> {
  for (let i = 0; i < maxTries; i++) {
    try {
      const res = await fetch(`/api/proxy-audio?url=${encodeURIComponent(`${API_ENDPOINTS.BASE_URL}/tokens/analysis-result/${jobId}`)}`);
      if (res.ok) {
        const data = await res.json();
        // presigned URL 필드명에 맞게 수정
        const url = data.user_audio_url || data.s3_user_audio_url || data.audio_url || null;
        if (url) return url;
      }
    } catch {}
    await new Promise(res => setTimeout(res, interval));
  }
  return null;
}

const DubbingListenModal: React.FC<DubbingListenModalProps> = ({
  open, onClose, tokenId, modalId
}) => {
  const [scriptAudios, setScriptAudios] = useState<AudioURL[]>([]);
  const [backgroundAudio, setBackgroundAudio] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mergedUrl, setMergedUrl] = useState<string | null>(null);
  const [merging, setMerging] = useState(false);
  const [scriptInfos, setScriptInfos] = useState<ScriptInfo[]>([]);
  const [pendingJobId, setPendingJobId] = useState<string | null>(null);

  // 외부에서 호출 (예: 부모에서 ref로)
  function handleNewRecording(jobId: string, scriptId: number) {
    setPendingJobId(`${jobId}:${scriptId}`);
  }

  // 모달 오픈 시 항상 최신 fetch
  useEffect(() => {
    if (open && tokenId) {
      setLoading(true); setError(null);
      Promise.all([
        waitForUserAudio(tokenId, 10, 1000),
        getTokenBackgroundAudioAndScripts(tokenId)
      ]).then(([audios, { bgvoice_url, scripts }]) => {
        setScriptAudios(audios);
        setBackgroundAudio(bgvoice_url);
        setScriptInfos(scripts);
        setMergedUrl(null);
        // 디버깅용
        console.log("backgroundAudio:", bgvoice_url);
        console.log("scriptAudios:", audios);
        console.log("scriptInfos:", scripts);
      }).catch(() => {
        setError('오디오를 불러오는데 실패했습니다.');
      }).finally(() => setLoading(false));
    } else if (!open) {
      setScriptAudios([]); setBackgroundAudio(null);
      setScriptInfos([]);
      setError(null); setLoading(false); setMergedUrl(null);
    }
  }, [open, tokenId]);

  // handleNewRecording이 호출되면 분석 polling 후 전체 오디오 목록 최신화!
  useEffect(() => {
    if (!pendingJobId) return;
    const [jobId] = pendingJobId.split(":");
    let cancelled = false;
    (async () => {
      const url = await pollAnalysisResult(jobId);
      if (!cancelled) {
        const audios = await getUserAudioUrls(tokenId);
        setScriptAudios(audios); // 항상 전체 fetch로 최신화
        setMergedUrl(null); // 병합 음성 초기화
        setPendingJobId(null);
      }
    })();
    return () => { cancelled = true; };
  }, [pendingJobId, tokenId]);

  // 유저 오디오 바뀌면 병합 오디오 초기화
  useEffect(() => {
    setMergedUrl(null);
  }, [scriptAudios]);

  useEffect(() => {
    return () => {
      if (mergedUrl) URL.revokeObjectURL(mergedUrl);
    };
  }, [mergedUrl]);

  const handleMergeAll = async () => {
    if (!backgroundAudio || !scriptAudios.length || !scriptInfos.length) {
      alert("병합할 데이터가 부족합니다."); return;
    }
    setMerging(true);
    try {
      const blob = await mixBackgroundAndUserAudiosByScript(backgroundAudio, scriptAudios, scriptInfos);
      const url = URL.createObjectURL(blob);
      setMergedUrl(url);
    } catch (e) {
      alert("병합 실패: " + (e as any).message);
    } finally {
      setMerging(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-lg z-10 flex flex-col items-center">
        <button className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl" onClick={onClose}>
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6 text-white">더빙본 들어보기</h2>

        {/* 배경음 */}
        {backgroundAudio && (
          <div className="mb-8 w-full flex flex-col items-center">
            <span className="text-lg text-green-400 font-semibold mb-2">배경음</span>
            <audio controls src={backgroundAudio} className="w-full" />
          </div>
        )}

        {/* 내가 녹음한 더빙본 */}
        <div className="w-full">
          <span className="text-base text-gray-300 font-semibold mb-2 block">
            내가 녹음한 더빙본
            {modalId && <span className="text-xs text-gray-500 ml-2">(Modal ID: {modalId})</span>}
          </span>
          {loading ? (
            <div className="text-gray-400 text-center py-4">
              <div className="animate-spin w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full mx-auto mb-2"></div>
              로딩중...
            </div>
          ) : error ? (
            <div className="text-red-400 text-center py-4">{error}</div>
          ) : scriptAudios.length > 0 ? (
            <ul className="space-y-4">
              {scriptAudios.map((audio, idx) => (
                <li key={audio.script_id} className="flex items-center gap-3">
                  <span className="text-sm text-gray-400 font-bold w-8">{idx + 1}.</span>
                  <audio controls src={audio.url} className="flex-1" />
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-400 text-center py-4">사용자 더빙 음성 없음</div>
          )}
        </div>

        {/* 병합 오디오 플레이어 */}
        <div className="mt-8 w-full flex flex-col items-center">
          <button
            onClick={handleMergeAll}
            disabled={merging || loading || !scriptAudios.length}
            className="bg-green-600 px-4 py-2 rounded-lg font-bold"
          >
            {merging ? "병합 중..." : "전체 병합 음성 듣기"}
          </button>
          {mergedUrl && (
            <audio controls src={mergedUrl} className="w-full mt-4" />
          )}
        </div>
      </div>
    </div>
  );
};

export default DubbingListenModal;
