import React from 'react';
import { useCostumeStore } from '../../store/useCostumeStore';

export const Footer: React.FC = () => {
  const { setActiveTab } = useCostumeStore();

  return (
    <footer className="w-full bg-[#efeee9] border-t border-[#e9e8e3] text-[#414942] text-xs py-8 mt-16">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <p className="font-headline font-bold text-[#1a1c1a] text-sm">
            Việt Cổ Y Phong AI · AI ARENA 2026
          </p>
          <p className="text-[#717971] font-body-sm">
            Dự án bảo tồn và số hóa di sản trang phục 54 dân tộc & Cổ phục Việt Nam.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[#414942] font-label-md">
          <button
            onClick={() => setActiveTab('showcase')}
            className="hover:text-[#2d533f] transition-colors cursor-pointer"
          >
            Trang chủ
          </button>
          <button
            onClick={() => setActiveTab('studio')}
            className="hover:text-[#2d533f] transition-colors cursor-pointer"
          >
            Phối Đồ
          </button>
          <button
            onClick={() => setActiveTab('archive')}
            className="hover:text-[#2d533f] transition-colors cursor-pointer"
          >
            Kho Di Sản
          </button>
          <button
            onClick={() => setActiveTab('lookbook')}
            className="hover:text-[#2d533f] transition-colors cursor-pointer"
          >
            Sổ Tay & Hồ Sơ
          </button>
        </div>
      </div>
    </footer>
  );
};
