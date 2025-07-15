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

async function getTokenBackgroundAudioAndScripts(tokenId: number): Promise<{
  bgvoice_url: string | null;
  scripts: ScriptInfo[];
}> {
  try {
    const accessToken = localStorage.getItem('access_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
    const res = await fetch(`${API_ENDPOINTS.BASE_URL}/tokens/${tokenId}`, { method: 'GET', headers });
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
    const res = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json', ...headers } });
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

// ✔️ "전체 사용자 오디오 이어붙이고, 배경음과 합성"으로 변경
async function mixBackgroundAndUserAudios(
  bgUrl: string, userAudios: AudioURL[]
): Promise<Blob> {
  const ctx = new AudioContext();
  const bgAudio = await fetchAndDecodeAudio(bgUrl, ctx);
  const userBuffers: AudioBuffer[] = [];
  for (const userAudio of userAudios) {
    const buf = await fetchAndDecodeAudio(userAudio.url, ctx);
    userBuffers.push(buf);
  }
  // 사용자 전체 이어붙이기
  const totalLength = userBuffers.reduce((sum, buf) => sum + buf.length, 0);
  const userMerged = ctx.createBuffer(1, totalLength, ctx.sampleRate);
  let offset = 0;
  for (const buf of userBuffers) {
    userMerged.getChannelData(0).set(buf.getChannelData(0), offset);
    offset += buf.length;
  }
  // 배경음/사용자 중 더 짧은 길이에 맞춰 믹스
  const outLength = Math.min(bgAudio.length, userMerged.length);
  const outBuf = ctx.createBuffer(1, outLength, ctx.sampleRate);
  const bgData = bgAudio.getChannelData(0);
  const userData = userMerged.getChannelData(0);
  const out = outBuf.getChannelData(0);
  for (let i = 0; i < outLength; ++i)
    out[i] = (bgData[i] || 0) * 0.5 + (userData[i] || 0) * 1.0;
  const wav = audioBufferToWav(outBuf);
  return new Blob([wav], { type: "audio/wav" });
}

interface ScriptInfo {
  script_id: number;
  start_time: number;
  end_time: number;
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

  useEffect(() => {
    if (open && tokenId) {
      setLoading(true); setError(null);
      Promise.all([
        waitForUserAudio(tokenId, 10, 1000),
        getTokenBackgroundAudioAndScripts(tokenId)
      ]).then(([audios, { bgvoice_url }]) => {
        setScriptAudios(audios);
        setBackgroundAudio(bgvoice_url);
        setMergedUrl(null);
        console.log("backgroundAudio:", bgvoice_url);
        console.log("scriptAudios:", audios);
      }).catch(() => {
        setError('오디오를 불러오는데 실패했습니다.');
      }).finally(() => setLoading(false));
    } else if (!open) {
      setScriptAudios([]); setBackgroundAudio(null);
      setError(null); setLoading(false); setMergedUrl(null);
    }
  }, [open, tokenId]);

  const handleMergeAll = async () => {
    if (!backgroundAudio || !scriptAudios.length) {
      alert("병합할 데이터가 부족합니다."); return;
    }
    setMerging(true);
    try {
      const blob = await mixBackgroundAndUserAudios(backgroundAudio, scriptAudios);
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
