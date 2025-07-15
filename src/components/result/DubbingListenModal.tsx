import React, { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '@/lib/constants';

interface DubbingListenModalProps {
  open: boolean;
  onClose: () => void;
  tokenId: number;        // 토큰 ID (숫자)
  modalId?: string;       // 모달 ID (문자열) - YouTube ID (현재 미사용)
}

// 백엔드 응답 구조에 맞는 타입 정의
interface AudioURL {
  script_id: number;
  url: string;
}

interface UserAudioResponse {
  audios: AudioURL[];
}

interface TokenDetailResponse {
  bgvoice_url: string;
  // 다른 필드들...
}

// 배경음 가져오기 함수
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

// 사용자 오디오 URL 가져오기 함수
async function getUserAudioUrls(tokenId: number): Promise<AudioURL[]> {
  try {
    // modalId는 현재 백엔드에서 처리하지 않으므로 제거
    const url = `${API_ENDPOINTS.BASE_URL}/tokens/${tokenId}/user-audios`;
    
    console.log('API 호출 URL:', url);
    
    // JWT Bearer 토큰 방식으로 수정
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
    console.log('API 응답:', data);
    
    // 백엔드 응답 구조에 맞게 처리
    return data.audios || [];
  } catch (error) {
    console.error('API 호출 에러:', error);
    return [];
  }
}

// S3에 파일이 저장될 때까지 user-audios를 polling
async function waitForUserAudio(tokenId: number, maxTries = 10, interval = 1000): Promise<AudioURL[]> {
  for (let i = 0; i < maxTries; i++) {
    const audios = await getUserAudioUrls(tokenId);
    if (audios.length > 0) {
      return audios;
    }
    // 아직 없으면 대기 후 재시도
    await new Promise(res => setTimeout(res, interval));
  }
  // 끝까지 못 찾으면 빈 배열 반환
  return [];
}

const DubbingListenModal: React.FC<DubbingListenModalProps> = ({
  open, 
  onClose, 
  tokenId, 
  modalId  // 현재 미사용이지만 호환성을 위해 유지
}) => {
  const [scriptAudios, setScriptAudios] = useState<AudioURL[]>([]);
  const [backgroundAudio, setBackgroundAudio] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && tokenId) {
      setLoading(true);
      setError(null);

      waitForUserAudio(tokenId, 10, 1000)
        .then((audios) => {
          setScriptAudios(audios);
        })
        .catch((err) => {
          setError('오디오를 불러오는데 실패했습니다.');
        })
        .finally(() => setLoading(false));
    }
  }, [open, tokenId]);

  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 흐림 */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      {/* 모달 컨텐츠 */}
      <div className="relative bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-lg z-10 flex flex-col items-center">
        {/* 닫기 버튼 */}
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