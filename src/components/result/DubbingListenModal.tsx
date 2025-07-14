import React from 'react';

interface DubbingListenModalProps {
  open: boolean;
  onClose: () => void;
  scriptAudios: string[]; 
  fullAudio?: string;     
}

const DubbingListenModal: React.FC<DubbingListenModalProps> = ({ open, onClose, scriptAudios, fullAudio }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 1. 배경 흐림 */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      {/* 2. 모달 컨텐츠 */}
      <div className="relative bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-lg z-10 flex flex-col items-center">
        {/* 3. 닫기 버튼: &times; */}
        <button className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl" onClick={onClose}>&times;</button>
        
        <h2 className="text-2xl font-bold mb-6 text-white">더빙본 들어보기</h2>
        {fullAudio && (
          <div className="mb-8 w-full flex flex-col items-center">
            <span className="text-lg text-green-400 font-semibold mb-2">전체 더빙본</span>
            <audio controls src={fullAudio} className="w-full" />
          </div>
        )}
        <div className="w-full">
          <span className="text-base text-gray-300 font-semibold mb-2 block">스크립트별 더빙본</span>
          <ul className="space-y-4">
            {scriptAudios.map((audio, idx) => (
              <li key={idx} className="flex items-center gap-3">
                <span className="text-sm text-gray-400 font-bold w-8">{idx + 1}.</span>
                <audio controls src={audio} className="flex-1" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DubbingListenModal;