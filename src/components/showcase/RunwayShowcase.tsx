import React, { useState } from 'react';
import { useCostumeStore } from '../../store/useCostumeStore';
import { MannequinViewer } from '../mannequin/MannequinViewer';
import { MOCK_COLLECTIONS } from '../../data/mockHeritageData';
import { HeritageCollection, Gender } from '../../types/costume';
import {
  Sparkles,
  ArrowRight,
  Layers,
  Compass,
  Scroll,
  RotateCw,
  Users,
  BookmarkCheck
} from 'lucide-react';

export const RunwayShowcase: React.FC = () => {
  const { loadCollection, setActiveTab, outfit, setGender } = useCostumeStore();
  const [activeCollectionIndex, setActiveCollectionIndex] = useState(0);

  const currentCollection = MOCK_COLLECTIONS[activeCollectionIndex];

  const handleSelectCollection = (index: number) => {
    setActiveCollectionIndex(index);
    const col = MOCK_COLLECTIONS[index];
    loadCollection(col.id);
  };

  const handleTryStylingNow = () => {
    const col = MOCK_COLLECTIONS[activeCollectionIndex];
    loadCollection(col.id);
    setActiveTab('studio');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Hero Marquee - TAB 1: XANH NGỌC DI SẢN */}
      <div className="relative rounded-3xl overflow-hidden bg-[#456B56] text-[#FFFDF8] p-6 sm:p-10 lg:p-12 shadow-xl border border-[#365544]">
        <div className="absolute inset-0 pointer-events-none opacity-25">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="gach-bong-gio-24" patternUnits="userSpaceOnUse" width="24" height="24">
                <rect fill="none" height="24" stroke="#FFFDF8" strokeWidth="0.8" width="24"></rect>
                <path d="M12,1.5 L22.5,12 L12,22.5 L1.5,12 Z" fill="none" stroke="#FFFDF8" strokeWidth="0.8"></path>
                <circle cx="12" cy="12" fill="none" r="4.2" stroke="#FFFDF8" strokeWidth="0.8"></circle>
                <circle cx="12" cy="12" fill="#FFFDF8" r="1.3"></circle>
              </pattern>
            </defs>
            <rect fill="url(#gach-bong-gio-24)" height="100%" width="100%"></rect>
          </svg>
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Text & Curatorial Pitch (6 Cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-[#D8B454] font-serif font-bold block">
                Màn hình 1 · Trang chủ (Virtual Runway Showcase)
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-extrabold tracking-tight text-white leading-tight">
                Việt Cổ Y Phong
              </h1>
              <p className="text-sm sm:text-base font-serif italic text-stone-100/90 leading-relaxed max-w-xl">
                Cố vấn phối đồ và giám định tri thức trang phục 54 dân tộc & cổ phục Việt Nam cùng công nghệ AI thế hệ mới.
              </p>
            </div>

            {/* Active Collection Spotlight Deck */}
            <div className="p-5 rounded-2xl bg-black/15 backdrop-blur-md border border-white/15 space-y-3">
              <div className="flex items-center justify-between text-xs text-[#D8B454]">
                <span className="font-serif uppercase tracking-widest font-semibold">
                  Bộ Sưu Tập Tiêu Biểu · 0{activeCollectionIndex + 1}
                </span>
                <span className="text-stone-200 font-sans">
                  {currentCollection.period_or_ethnic}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                {currentCollection.title}
              </h2>
              <span className="text-xs text-stone-200 block -mt-1 font-serif italic">
                {currentCollection.subtitle}
              </span>

              <p className="text-xs sm:text-sm text-stone-100/90 leading-relaxed font-sans">
                {currentCollection.description}
              </p>
            </div>

            {/* Primary CTAs & Gender Preset Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={handleTryStylingNow}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#D8B454] hover:bg-[#c9a33e] text-stone-900 text-sm font-label-md font-bold transition-all shadow-md cursor-pointer"
              >
                <span>Thử Phối Ngay Set Này</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveTab('lookbook')}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/15 hover:bg-white/25 text-white text-sm font-label-md font-medium transition-colors border border-white/20 cursor-pointer"
              >
                <BookmarkCheck className="w-4 h-4 text-[#D8B454]" />
                <span>Xem Lookbook & Thẻ Sưu Tập</span>
              </button>
            </div>

            {/* Gender Silhouette Fast Selector */}
            <div className="flex items-center gap-3 pt-2 text-xs text-stone-200">
              <span className="shrink-0 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#D8B454]" />
                <span>Vóc dáng ma-nơ-canh:</span>
              </span>
              <div className="flex items-center gap-1.5 p-1 rounded-lg bg-black/20 border border-white/15">
                {(['nam', 'nu', 'nonbinary'] as Gender[]).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                      outfit.gender === g
                        ? 'bg-[#D8B454] text-stone-900 font-bold'
                        : 'text-stone-200 hover:text-white'
                    }`}
                  >
                    {g === 'nam' ? 'Nam' : g === 'nu' ? 'Nữ' : 'Nonbinary'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Center: 3D Turntable Showcase Mannequin (6 Cols) */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-[420px]">
              <MannequinViewer interactive={true} autoRotateDefault={true} compact={false} />
            </div>
          </div>
        </div>
      </div>

      {/* Carousel Bottom Sheet: Featured Heritage Collections */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
              Các Bộ Sưu Tập Di Sản Tiêu Biểu
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Chọn bộ trang phục truyền thống mẫu để nạp lên sàn diễn và tinh chỉnh phối đồ.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MOCK_COLLECTIONS.map((col, idx) => {
            const isSelected = activeCollectionIndex === idx;

            return (
              <div
                key={col.id}
                onClick={() => handleSelectCollection(idx)}
                className={`group relative p-5 rounded-2xl transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white border-2 border-[#2d533f] shadow-md -translate-y-1'
                    : 'bg-white border border-[#e9e8e3] hover:border-[#2d533f]/40 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                    <span className="font-serif italic text-stone-600">{col.period_or_ethnic}</span>
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: col.accent_color }}
                    />
                  </div>

                  <h3 className="font-headline font-bold text-base text-stone-900 group-hover:text-[#2d533f] transition-colors mb-1">
                    {col.title}
                  </h3>
                  <span className="text-xs text-stone-500 block mb-3 line-clamp-1">{col.subtitle}</span>

                  <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed mb-4">
                    {col.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-label-md">
                  <span className={`font-semibold ${isSelected ? 'text-[#2d533f]' : 'text-stone-500'}`}>
                    {isSelected ? 'Đang hiển thị' : 'Xem chi tiết'}
                  </span>
                  <ArrowRight
                    className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-1 ${
                      isSelected ? 'text-[#2d533f]' : 'text-stone-400'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
