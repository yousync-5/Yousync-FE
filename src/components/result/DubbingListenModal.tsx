import React, { useEffect, useState, useRef } from 'react';
import audioBufferToWav from 'audiobuffer-to-wav';
import { API_ENDPOINTS } from '@/lib/constants';
import ScriptDisplay from "@/components/dubbing/ScriptDisplay";
import { PlayIcon, PauseIcon } from '@heroicons/react/24/solid';

interface DubbingListenModalProps {
  open: boolean;
  onClose: () => void;
  tokenId: number;
  modalId?: string;
  mergedUrl?: string | null;
  onAudioSeek?: (time: number) => void;
}
interface AudioURL { script_id: number; url: string; }
interface UserAudioResponse { audios: AudioURL[]; }
interface TokenDetailResponse { bgvoice_url: string; scripts: { id: number; start_time: number; end_time: number; }[]; }
interface ScriptInfo { script_id: number; start_time: number; end_time: number; script?: string; }

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const accessToken = localStorage.getItem('access_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
  if (options.headers) {
    const h = options.headers as Record<string, string>;
    for (const k in h) {
      if (typeof h[k] === 'string') headers[k] = h[k];
    }
  }
  let res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    const refreshRes = await fetch(`${API_ENDPOINTS.BASE_URL}/auth/refresh/`, { method: 'POST', headers });
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

async function mixBackgroundAndUserAudiosByScript(
  bgUrl: string,
  userAudios: AudioURL[],
  scripts: ScriptInfo[]
): Promise<Blob> {
  const ctx = new AudioContext();
  const bgAudio = await fetchAndDecodeAudio(bgUrl, ctx);
  const outBuf = ctx.createBuffer(1, bgAudio.length, ctx.sampleRate);
  const out = outBuf.getChannelData(0);
  const bgData = bgAudio.getChannelData(0);
  out.set(bgData);
  for (const script of scripts) {
    const userAudio = userAudios.find(a => a.script_id === script.script_id);
    if (!userAudio) continue;
    const userBuf = await fetchAndDecodeAudio(userAudio.url, ctx);
    const duration = script.end_time - script.start_time;
    const length = Math.floor(ctx.sampleRate * duration);
    const userData = userBuf.getChannelData(0).slice(0, length);
    const startIdx = Math.floor(script.start_time * ctx.sampleRate);
    for (let i = 0; i < length; ++i) {
      out[startIdx + i] = (out[startIdx + i] || 0) * 0.5 + (userData[i] || 0) * 1.0;
    }
  }
  const wav = audioBufferToWav(outBuf);
  return new Blob([wav], { type: "audio/wav" });
}

async function getTokenBackgroundAudioAndScripts(tokenId: number): Promise<{
  bgvoice_url: string | null; scripts: ScriptInfo[];
}> {
  try {
    const accessToken = localStorage.getItem('access_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
    const res = await fetchWithAuth(`${API_ENDPOINTS.BASE_URL}/tokens/${tokenId}`, { method: 'GET', headers });
    if (!res.ok) return { bgvoice_url: null, scripts: [] };
    const data: any = await res.json();
    const scripts = Array.isArray(data.scripts)
      ? data.scripts.map((s: any) => ({
          script_id: s.id,
          start_time: s.start_time,
          end_time: s.end_time,
          script: s.script || '',
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

async function pollAnalysisResult(jobId: string, maxTries = 10, interval = 1500): Promise<string | null> {
  for (let i = 0; i < maxTries; i++) {
    try {
      const res = await fetch(`/api/proxy-audio?url=${encodeURIComponent(`${API_ENDPOINTS.BASE_URL}/tokens/analysis-result/${jobId}`)}`);
      if (res.ok) {
        const data = await res.json();
        const url = data.user_audio_url || data.s3_user_audio_url || data.audio_url || null;
        if (url) return url;
      }
    } catch {}
    await new Promise(res => setTimeout(res, interval));
  }
  return null;
}

const DubbingListenModal: React.FC<DubbingListenModalProps> = ({
  open, onClose, tokenId, modalId, mergedUrl: propMergedUrl, onAudioSeek
}) => {
  const [scriptAudios, setScriptAudios] = useState<AudioURL[]>([]);
  const [backgroundAudio, setBackgroundAudio] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [merging, setMerging] = useState(false);
  const [scriptInfos, setScriptInfos] = useState<ScriptInfo[]>([]);
  const [pendingJobId, setPendingJobId] = useState<string | null>(null);
  const [localMergedUrl, setLocalMergedUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentScriptIndex, setCurrentScriptIndex] = useState(0);
  const [currentVideoTime, setCurrentVideoTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  function handleNewRecording(jobId: string, scriptId: number) {
    setPendingJobId(`${jobId}:${scriptId}`);
  }

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
        setLocalMergedUrl(null);
      }).catch(() => {
        setError('오디오를 불러오는데 실패했습니다.');
      }).finally(() => setLoading(false));
    } else if (!open) {
      setScriptAudios([]); setBackgroundAudio(null);
      setScriptInfos([]);
      setError(null); setLoading(false); setLocalMergedUrl(null);
    }
  }, [open, tokenId]);

  useEffect(() => {
    if (!pendingJobId) return;
    const [jobId] = pendingJobId.split(":");
    let cancelled = false;
    (async () => {
      const url = await pollAnalysisResult(jobId);
      if (!cancelled) {
        const audios = await getUserAudioUrls(tokenId);
        setScriptAudios(audios);
        setLocalMergedUrl(null);
        setPendingJobId(null);
      }
    })();
    return () => { cancelled = true; };
  }, [pendingJobId, tokenId]);

  useEffect(() => {
    setLocalMergedUrl(null);
  }, [scriptAudios]);

  useEffect(() => {
    return () => {
      if (localMergedUrl) URL.revokeObjectURL(localMergedUrl);
    };
  }, [localMergedUrl]);

  useEffect(() => {
    setCurrentScriptIndex(0);
    setCurrentVideoTime(0);
  }, [scriptInfos]);

  // 오디오 위치 조정
  const handleSeek = () => {
    if (audioRef.current && onAudioSeek) {
      const time = audioRef.current.currentTime;
      onAudioSeek(time);
      setCurrentVideoTime(time);
      const idx = scriptInfos.findIndex(s => time >= s.start_time && time <= s.end_time);
      if (idx !== -1) setCurrentScriptIndex(idx);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTimeUpdate = () => setCurrentVideoTime(audio.currentTime);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, [audioRef.current]);

  // 커스텀 버튼 핸들러
  const handlePlay = () => audioRef.current?.play();
  const handlePause = () => audioRef.current?.pause();
  const handleRewind = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

  // 자동 병합
  useEffect(() => {
    if (open && backgroundAudio && scriptAudios.length && scriptInfos.length) {
      mixBackgroundAndUserAudiosByScript(backgroundAudio, scriptAudios, scriptInfos)
        .then(blob => {
          const url = URL.createObjectURL(blob);
          setLocalMergedUrl(url);
        });
    } else {
      setLocalMergedUrl(null);
    }
  }, [open, backgroundAudio, scriptAudios, scriptInfos]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경: 완전 투명 or 흐림효과 없이 */}
      <div
        className="fixed inset-0 bg-transparent"
        onClick={onClose}
      />
      {/* 모달 컨텐츠 */}
      <div
        className="bg-gray-900 rounded-3xl shadow-2xl flex flex-col items-center px-12 py-10"
        style={{
          maxWidth: '1100px',
          width: '92vw',
          minWidth: '340px',
          maxHeight: '92vh',
          margin: '6vh auto',
          border: '2.5px solid #23272a',
        }}
      >
        {modalId && (
          <iframe
            width={880}
            height={495}
            src={`https://www.youtube.com/embed/${modalId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&fs=0&disablekb=1`}
            title="YouTube video"
            allow="autoplay; encrypted-media"
            allowFullScreen
            className="mb-7 rounded-xl border border-gray-800"
            style={{
              boxShadow: '0 0 32px #0009',
              background: '#111',
              maxWidth: '95vw',
              maxHeight: '58vw',
              display: 'block',
            }}
          />
        )}
        {/* 스크립트(자막) - 위 */}
        <div className="w-full flex flex-col items-center">
          <ScriptDisplay
            captions={scriptInfos.map(s => ({
              id: s.script_id,
              script: s.script || '',
              translation: '',
              start_time: s.start_time,
              end_time: s.end_time,
            }))}
            currentScriptIndex={currentScriptIndex}
            onScriptChange={setCurrentScriptIndex}
            currentVideoTime={currentVideoTime}
          />
        </div>

        {/* 오디오 재생바 - 중간 */}
        {(propMergedUrl ?? localMergedUrl) && (
          <audio
            ref={audioRef}
            autoPlay
            controls
            src={(propMergedUrl ?? localMergedUrl) || undefined}
            className="w-full mt-6"
            onSeeked={handleSeek}
            style={{ maxWidth: 700 }}
          />
        )}

        {/* 버튼 컨테이너 - 아래 */}
        <div className="flex flex-row justify-center items-center gap-8 mt-8">
          {/* 처음으로 */}
          <button
            className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg border-2 border-white/20 hover:scale-110 transition"
            onClick={() => { if (audioRef.current) audioRef.current.currentTime = 0; }}
            title="처음으로"
          >
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 5l-7 5 7 5V5zM17 5h-2v10h2V5z" />
            </svg>
          </button>
          {/* 재생 */}
          <button
            className="w-14 h-14 rounded-full bg-gradient-to-r from-green-500 to-lime-500 flex items-center justify-center shadow-lg border-2 border-white/20 hover:scale-110 transition"
            onClick={() => { if (audioRef.current) audioRef.current.play(); }}
            title="재생"
          >
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
              <polygon points="6,4 16,10 6,16" />
            </svg>
          </button>
          {/* 일시정지 */}
          <button
            className="w-14 h-14 rounded-full bg-gradient-to-r from-gray-500 to-gray-700 flex items-center justify-center shadow-lg border-2 border-white/20 hover:scale-110 transition"
            onClick={() => { if (audioRef.current) audioRef.current.pause(); }}
            title="일시정지"
          >
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
              <rect x="5" y="5" width="10" height="10" rx="2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DubbingListenModal;
