import React, { useEffect, useState } from 'react';

interface DubbingListenModalProps {
  open: boolean;
  onClose: () => void;
  tokenId: number;        // 토큰 ID (숫자)
  modalId?: string;       // 모달 ID (문자열) - YouTube ID
  fullAudio?: string;     // 전체 더빙본 S3 URL
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://3.37.123.51";

// API 호출 함수
async function getUserAudioUrls(tokenId: number, modalId?: string): Promise<string[]> {
  try {
    // modalId가 있으면 쿼리 파라미터로 추가
    const url = modalId 
      ? `${API_BASE_URL}/tokens/${tokenId}/user-audios?modalId=${modalId}`
      : `${API_BASE_URL}/tokens/${tokenId}/user-audios`;
    
    console.log('API 호출 URL:', url);
    
    const res = await fetch(url, {
      credentials: "include",
    });
    
    if (!res.ok) {
      console.error('API 호출 실패:', res.status, res.statusText);
      return [];
    }
    
    const data = await res.json();
    console.log('API 응답:', data);
    
    // 응답 데이터 처리
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.user_audios)) return data.user_audios;
    if (data.audios && Array.isArray(data.audios)) return data.audios;
    
    return [];
  } catch (error) {
    console.error('API 호출 에러:', error);
    return [];
  }
}

const DubbingListenModal: React.FC<DubbingListenModalProps> = ({
  open, 
  onClose, 
  tokenId, 
  modalId, 
  fullAudio
}) => {
  const [scriptAudios, setScriptAudios] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && tokenId) {
      setLoading(true);
      setError(null);
      
      getUserAudioUrls(tokenId, modalId)
        .then((urls) => {
          console.log('받은 오디오 URL들:', urls);
          setScriptAudios(urls);
        })
        .catch((err) => {
          console.error('오디오 로딩 실패:', err);
          setError('오디오를 불러오는데 실패했습니다.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open, tokenId, modalId]);

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
        
        {/* 전체 더빙본 */}
        {fullAudio && (
          <div className="mb-8 w-full flex flex-col items-center">
            <span className="text-lg text-green-400 font-semibold mb-2">전체 더빙본</span>
            <audio controls src={fullAudio} className="w-full" />
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
                <li key={idx} className="flex items-center gap-3">
                  <span className="text-sm text-gray-400 font-bold w-8">{idx + 1}.</span>
                  <audio controls src={audio} className="flex-1" />
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