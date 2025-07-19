import React from 'react';

interface DubbingListenModalProps {
  open: boolean;
  onClose: () => void;
  tokenId: string;
  modalId?: string;
}

const DubbingListenModal: React.FC<DubbingListenModalProps> = ({ open, onClose, tokenId, modalId }) => {
  if (!open) return null;

  // 버튼 핸들러 (아직은 콘솔만 출력)
  const handlePlay = () => {
    console.log('재생 버튼 클릭');
  };
  const handlePause = () => {
    console.log('정지 버튼 클릭');
  };
  const handleRestart = () => {
    console.log('처음부터 버튼 클릭');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className="relative bg-gray-900 rounded-3xl shadow-2xl z-10 flex flex-col items-center px-12 py-10"
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
        {/* 영상 아래 버튼 UI */}
        <div className="flex flex-row gap-4 mt-4">
          <button
            className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold shadow"
            onClick={handlePlay}
          >
            재생
          </button>
          <button
            className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold shadow"
            onClick={handlePause}
          >
            정지
          </button>
          <button
            className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow"
            onClick={handleRestart}
          >
            처음부터
          </button>
        </div>
      </div>
    </div>
  );
};

export default DubbingListenModal;