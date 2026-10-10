import React from 'react';
import { useCostumeStore } from '../../store/useCostumeStore';

export const Footer: React.FC = () => {
  const { setActiveTab } = useCostumeStore();

  return (
    <footer className="w-full bg-black/30 backdrop-blur-md border-t border-white/10 text-stone-300 text-xs py-8 mt-16 relative z-10">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <p className="font-headline font-bold text-white text-sm">
            Việt Cổ Y Phong AI · AI ARENA 2026
          </p>
          <p className="text-stone-300/80 font-body-sm">
            Tôn vinh họa tiết, hoa văn truyền thống 54 dân tộc và các triều đại Việt Nam.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-stone-200 font-label-md">
          <button
            onClick={() => setActiveTab('showcase')}
            className="hover:text-[#D8B454] transition-colors cursor-pointer"
          >
            Trang chủ
          </button>
          <button
            onClick={() => setActiveTab('studio')}
            className="hover:text-[#D8B454] transition-colors cursor-pointer"
          >
            Phối Đồ
          </button>
          <button
            onClick={() => setActiveTab('archive')}
            className="hover:text-[#D8B454] transition-colors cursor-pointer"
          >
            Kho Di Sản
          </button>
          <button
            onClick={() => setActiveTab('lookbook')}
            className="hover:text-[#D8B454] transition-colors cursor-pointer"
          >
            Lookbook
          </button>
        </div>
      </div>
    </footer>
  );
};
