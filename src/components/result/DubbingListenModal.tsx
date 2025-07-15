import React, { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '@/lib/constants';

interface DubbingListenModalProps {
  open: boolean;
  onClose: () => void;
  tokenId: number;
  modalId?: string;
}

interface AudioURL {
  script_id: number;
  url: string;
}

interface UserAudioResponse {
  audios: AudioURL[];
}

interface TokenDetailResponse {
  bgvoice_url: string;
}

// 배경음 가져오기 함수 (그대로)
async function getTokenBackgroundAudio(tokenId: number): Promise<string | null> {
  try {
    const accessToken = localStorage.getItem('access_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
    const res = await fetch(`${API_ENDPOINTS.BASE_URL}/tokens/${tokenId}`, {
      method: 'GET',
      headers
    });
    if (!res.ok) {
      console.error('배경음 API 호출 실패:', res.status, res.statusText);
      return null;
    }
    const data: TokenDetailResponse = await res.json();
    return data.bgvoice_url || null;
  } catch (error) {
    console.error('배경음 가져오기 실패:', error);
    return null;
  }
}

async function getUserAudioUrls(tokenId: number): Promise<AudioURL[]> {
  try {
    const url = `${API_ENDPOINTS.BASE_URL}/tokens/${tokenId}/user-audios`;
    const accessToken = localStorage.getItem('access_token');
    const headers: Record<string, string> = {};
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    });
    if (!res.ok) {
      console.error('API 호출 실패:', res.status, res.statusText);
      return [];
    }
    const data: UserAudioResponse = await res.json();
    return data.audios || [];
  } catch (error) {
    console.error('API 호출 에러:', error);
    return [];
  }
}

async function waitForUserAudio(tokenId: number, maxTries = 10, interval = 1000): Promise<AudioURL[]> {
  for (let i = 0; i < maxTries; i++) {
    const audios = await getUserAudioUrls(tokenId);
    if (audios.length > 0) {
      return audios;
    }
    await new Promise(res => setTimeout(res, interval));
  }
  return [];
}

const DubbingListenModal: React.FC<DubbingListenModalProps> = ({
  open,
  onClose,
  tokenId,
  modalId
}) => {
  const [scriptAudios, setScriptAudios] = useState<AudioURL[]>([]);
  const [backgroundAudio, setBackgroundAudio] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && tokenId) {
      setLoading(true);
      setError(null);

      // (1) 더빙본, (2) 배경음 동시에 fetch
      Promise.all([
        waitForUserAudio(tokenId, 10, 1000),
        getTokenBackgroundAudio(tokenId)
      ])
        .then(([audios, bgUrl]) => {
          setScriptAudios(audios);
          setBackgroundAudio(bgUrl);
        })
        .catch(() => {
          setError('오디오를 불러오는데 실패했습니다.');
        })
        .finally(() => setLoading(false));
    } else if (!open) {
      // 모달 닫힐 때 클린업 (옵션)
      setScriptAudios([]);
      setBackgroundAudio(null);
      setError(null);
      setLoading(false);
    }
  }, [open, tokenId]);

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
      </div>
    </div>
  );
};

export default DubbingListenModal;
