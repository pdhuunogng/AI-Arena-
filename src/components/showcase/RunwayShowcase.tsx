import React, { useState } from 'react';
import { useCostumeStore } from '../../store/useCostumeStore';
import { MOCK_COLLECTIONS, MOCK_HERITAGE_ITEMS } from '../../data/mockHeritageData';
import { CostumeItem } from '../../types/costume';
import {
  Sparkles,
  ArrowRight,
  Layers,
  Scroll,
  BookmarkCheck,
  ChevronRight,
  Info,
  Wand2,
  Tag
} from 'lucide-react';

export const RunwayShowcase: React.FC = () => {
  const {
    loadCollection,
    setActiveTab,
    setSlotItem,
    setSelectedItemForDetail
  } = useCostumeStore();

  const [activeCollectionIndex, setActiveCollectionIndex] = useState(0);

  const currentCollection = MOCK_COLLECTIONS[activeCollectionIndex] || MOCK_COLLECTIONS[0];

  // Resolve collection sample items
  const collectionTop = currentCollection ? MOCK_HERITAGE_ITEMS.find((i) => i.id === currentCollection.sample_outfit.top_id) : null;
  const collectionBottom = currentCollection ? MOCK_HERITAGE_ITEMS.find((i) => i.id === currentCollection.sample_outfit.bottom_id) : null;
  const collectionHead = currentCollection ? MOCK_HERITAGE_ITEMS.find((i) => i.id === currentCollection.sample_outfit.head_id) : null;
  const collectionFoot = currentCollection ? MOCK_HERITAGE_ITEMS.find((i) => i.id === currentCollection.sample_outfit.footwear_id) : null;

  // Standout individual garments for Visual Discovery
  const featuredGarments: CostumeItem[] = [
    MOCK_HERITAGE_ITEMS.find((i) => i.id === 'item-ao-nhat-binh'),
    MOCK_HERITAGE_ITEMS.find((i) => i.id === 'item-ao-ngu-than'),
    MOCK_HERITAGE_ITEMS.find((i) => i.id === 'item-ao-tu-than'),
    MOCK_HERITAGE_ITEMS.find((i) => i.id === 'item-ao-com-thai-trang'),
    MOCK_HERITAGE_ITEMS.find((i) => i.id === 'item-ao-dai-dao-do'),
    MOCK_HERITAGE_ITEMS.find((i) => i.id === 'item-ao-nu-cham'),
    MOCK_HERITAGE_ITEMS.find((i) => i.id === 'item-ao-ba-ba'),
    MOCK_HERITAGE_ITEMS.find((i) => i.id === 'item-ao-ede')
  ].filter(Boolean) as CostumeItem[];

  const handleSelectCollection = (index: number) => {
    setActiveCollectionIndex(index);
  };

  const handleTryStylingNow = () => {
    loadCollection(currentCollection.id);
    setActiveTab('studio');
  };

  const handleQuickStyleItem = (item: CostumeItem) => {
    if (item.category === 'Áo') setSlotItem('ao', item);
    else if (item.category === 'Quần') setSlotItem('quan', item);
    else if (item.category === 'Váy') setSlotItem('vay', item);
    else if (item.category === 'Khăn') setSlotItem('khan', item);
    else if (item.category === 'Mũ') setSlotItem('mu', item);
    else if (item.category === 'Giày') setSlotItem('giay', item);
    else if (item.category === 'Trang sức') setSlotItem('trang_suc', item);
    else setSlotItem('phu_kien', item);

    setActiveTab('studio');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12">
      {/* 1. HERO SPOTLIGHT BANNER: VIỆT PHỤC REMIX */}
      <div className="relative rounded-3xl overflow-hidden bg-[#456B56] text-[#FFFDF8] p-6 sm:p-10 lg:p-12 shadow-2xl border border-[#365544]">
        {/* Subtle 24px Gạch Bông Gió Motif Background */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="gach-bong-gio-24" patternUnits="userSpaceOnUse" width="24" height="24">
                <rect fill="none" height="24" stroke="#FFFDF8" strokeWidth="0.8" width="24" />
                <path d="M12,1.5 L22.5,12 L12,22.5 L1.5,12 Z" fill="none" stroke="#FFFDF8" strokeWidth="0.8" />
                <circle cx="12" cy="12" fill="none" r="4.2" stroke="#FFFDF8" strokeWidth="0.8" />
                <circle cx="12" cy="12" fill="#FFFDF8" r="1.3" />
              </pattern>
            </defs>
            <rect fill="url(#gach-bong-gio-24)" height="100%" width="100%" />
          </svg>
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Text & Editorial Pitch (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/25 border border-white/20 text-[#D8B454] text-xs font-mono font-bold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>VIỆT PHỤC REMIX · GEN Z HERITAGE</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-extrabold tracking-tight text-white leading-tight">
                Tôn Vinh Di Sản, <br />
                <span className="italic font-light text-[#D8B454]">Phối Sắc Đương Đại</span>
              </h1>
              <p className="text-sm sm:text-base font-serif italic text-stone-100/90 leading-relaxed max-w-xl">
                Cố vấn phối trang phục truyền thống 54 dân tộc và cổ phục Việt Nam cùng công nghệ AI giám định tri thức văn hóa có trách nhiệm.
              </p>
            </div>

            {/* Active Collection Spotlight Deck */}
            <div className="p-5 rounded-2xl bg-black/20 backdrop-blur-md border border-white/15 space-y-3">
              <div className="flex items-center justify-between text-xs text-[#D8B454]">
                <span className="font-serif uppercase tracking-widest font-semibold flex items-center gap-1.5">
                  <Scroll className="w-3.5 h-3.5" />
                  <span>Bộ Sưu Tập Tiêu Biểu · 0{activeCollectionIndex + 1}</span>
                </span>
                <span className="text-stone-200 font-sans px-2.5 py-0.5 rounded-full bg-white/10 text-[11px]">
                  {currentCollection.period_or_ethnic}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                {currentCollection.title}
              </h2>
              <span className="text-xs text-[#FFDAD4] block -mt-1 font-serif italic">
                {currentCollection.subtitle}
              </span>

              <p className="text-xs sm:text-sm text-stone-100/90 leading-relaxed font-sans">
                {currentCollection.description}
              </p>
            </div>

            {/* Primary CTAs: Thử phối ngay & Khám phá Tủ đồ */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-1">
              <button
                onClick={handleTryStylingNow}
                className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#D8B454] hover:bg-[#c9a33e] text-stone-900 text-sm font-label-md font-bold transition-all shadow-lg hover:shadow-xl cursor-pointer"
              >
                <span>Thử Phối Ngay Set Này</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveTab('archive')}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-sm font-label-md font-semibold transition-colors border border-white/20 cursor-pointer"
              >
                <Layers className="w-4 h-4 text-[#D8B454]" />
                <span>Khám Phá Tủ Đồ Di Sản</span>
              </button>
            </div>

            {/* Quick Collection Switcher Pills */}
            <div className="pt-2 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-stone-300 shrink-0 font-mono text-[11px]">Tuyển tập:</span>
              {MOCK_COLLECTIONS.map((c, idx) => (
                <button
                  key={c.id}
                  onClick={() => handleSelectCollection(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all shrink-0 cursor-pointer ${
                    activeCollectionIndex === idx
                      ? 'bg-[#D8B454] text-stone-900 font-bold shadow-xs'
                      : 'bg-black/20 text-stone-200 hover:text-white hover:bg-black/30'
                  }`}
                >
                  {c.title}
                </button>
              ))}
            </div>
          </div>

          {/* Right Visual Garment Composition (5 Cols) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/20 shadow-2xl space-y-4">
              <div className="flex items-center justify-between text-xs text-stone-200">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#D8B454]">
                  ✦ Bản Phối Trang Phục
                </span>
                <span className="text-[11px] font-sans">
                  {currentCollection.period_or_ethnic}
                </span>
              </div>

              {/* Main Featured Garment Image (Top / Áo) */}
              {collectionTop && (
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-stone-900/40 border border-white/20 shadow-md group">
                  <img
                    src={collectionTop.image_url}
                    alt={collectionTop.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#A03F30] text-white">
                      {collectionTop.category}
                    </span>
                    <h3 className="font-serif font-bold text-base mt-1 truncate">
                      {collectionTop.name}
                    </h3>
                  </div>
                </div>
              )}

              {/* Complementary Garments Thumbnails (Váy/Quần, Khăn/Mũ, Hài) */}
              <div className="grid grid-cols-3 gap-2.5">
                {[collectionBottom, collectionHead, collectionFoot].filter(Boolean).map((item) => (
                  <div
                    key={item!.id}
                    onClick={() => setSelectedItemForDetail(item!)}
                    className="relative rounded-xl overflow-hidden aspect-square bg-stone-900/30 border border-white/15 cursor-pointer group hover:border-[#D8B454] transition-all"
                  >
                    <img
                      src={item!.image_url}
                      alt={item!.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <span className="absolute bottom-1.5 inset-x-1.5 text-[10px] font-medium text-white truncate text-center">
                      {item!.category}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleTryStylingNow}
                className="w-full py-2.5 text-center text-xs font-label-md font-bold text-stone-900 bg-[#D8B454] hover:bg-[#c9a33e] rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
              >
                <span>Mở trong Studio Phối Đồ</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. VISUAL DISCOVERY — MÓN ĐỒ TIÊU BIỂU TUYỂN CHỌN */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#e9e8e3] pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#A03F30] font-bold tracking-wider">
              <span>TRANG PHỤC & PHỤ KIỆN</span>
              <span>✦</span>
              <span>TUYỂN CHỌN ĐẶC SẮC</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1a1c1a] mt-1">
              Khám Phá Chi Tiết Y Phục
            </h2>
            <p className="text-xs sm:text-sm text-[#414942] font-sans mt-0.5">
              Từng món đồ được chuẩn hóa để bạn tự do thử nghiệm phối ghép theo phong cách cá nhân
            </p>
          </div>

          <button
            onClick={() => setActiveTab('archive')}
            className="flex items-center gap-1.5 text-xs font-label-md font-bold text-[#2d533f] hover:text-[#456b56] cursor-pointer"
          >
            <span>Xem toàn bộ 54 dân tộc & triều đại</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Garment Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredGarments.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-[#e9e8e3] overflow-hidden hover:border-[#2d533f]/40 hover:shadow-xl transition-all flex flex-col group"
            >
              {/* Garment Image Area */}
              <div className="relative aspect-[4/3] bg-[#f5f4ef] overflow-hidden p-3 flex items-center justify-center">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
                />

                {/* Cultural badges */}
                <div className="absolute top-5 left-5 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-label-sm font-bold bg-[#2d533f] text-white shadow-sm">
                    {item.category}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-label-sm bg-black/60 text-white backdrop-blur-xs font-semibold">
                    {item.ethnic_group}
                  </span>
                </div>

                {item.color_hex && (
                  <span
                    className="absolute top-5 right-5 w-4 h-4 rounded-full border-2 border-white shadow-xs"
                    style={{ backgroundColor: item.color_hex }}
                    title={`Màu: ${item.color_hex}`}
                  />
                )}
              </div>

              {/* Garment Information */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-[#717971]">
                    <span className="truncate">{item.period_or_region}</span>
                    <span className="font-mono text-[#D8B454] font-semibold shrink-0">
                      {item.cross_cultural_flag ? 'Giao thoa' : 'Nguyên bản'}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-serif font-bold text-[#1a1c1a] group-hover:text-[#2d533f] transition-colors leading-snug">
                    {item.name}
                  </h3>

                  <p className="text-xs text-[#414942] line-clamp-2 leading-relaxed font-sans">
                    {item.pattern_description || item.cultural_significance}
                  </p>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-2 border-t border-[#efeee9] flex items-center gap-2">
                  <button
                    onClick={() => handleQuickStyleItem(item)}
                    className="flex-1 py-2 px-3 bg-[#2d533f] hover:bg-[#456b56] text-white text-xs font-label-md font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Wand2 className="w-3.5 h-3.5 text-[#D8B454]" />
                    <span>+ Phối vào Studio</span>
                  </button>

                  <button
                    onClick={() => setSelectedItemForDetail(item)}
                    className="py-2 px-3 bg-[#f5f4ef] hover:bg-[#e9e8e3] text-[#1a1c1a] text-xs font-label-md font-semibold rounded-xl transition-colors cursor-pointer border border-[#e9e8e3]"
                    title="Xem chi tiết nguồn khảo cứu"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. EDITORIAL MANIFESTO STRIP */}
      <div className="rounded-3xl bg-[#efeee9] border border-[#e3e2dc] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1 max-w-2xl">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#A03F30] font-bold">
            TRI THỨC & TÔN TRỌNG NGUỒN CỘI
          </span>
          <h3 className="text-lg sm:text-xl font-serif font-bold text-[#1a1c1a]">
            Trang phục không chỉ là xiêm áo, mà là ký ức sống của tổ tiên
          </h3>
          <p className="text-xs sm:text-sm text-[#414942] leading-relaxed">
            VIỆT PHỤC REMIX cam kết bảo lưu tính nguyên bản của đồ tế tự thiêng liêng, đồng thời mở ra không gian phối ghép sáng tạo chuẩn mực cho thế hệ trẻ.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('lookbook')}
          className="shrink-0 px-5 py-3 rounded-xl bg-white hover:bg-stone-50 border border-[#c1c9bf] text-[#1a1c1a] text-xs font-label-md font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-2"
        >
          <BookmarkCheck className="w-4 h-4 text-[#A03F30]" />
          <span>Xem Lookbook & Thẻ Sưu Tập</span>
        </button>
      </div>
    </div>
  );
};
