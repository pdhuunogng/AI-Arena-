import React from 'react';
import { useCostumeStore } from '../../store/useCostumeStore';
import { CostumeSlot } from '../../types/costume';

interface ClothesMockupViewerProps {
  interactive?: boolean;
  onSelectSlot?: (slot: CostumeSlot) => void;
}

export const ClothesMockupViewer: React.FC<ClothesMockupViewerProps> = ({
  interactive = true,
  onSelectSlot
}) => {
  const { outfit, setSelectedItemForDetail } = useCostumeStore();
  const { top, bottom, head, footwear, accessories } = outfit.slots;

  const handleSlotClick = (slot: CostumeSlot) => {
    if (!interactive) return;
    const item = outfit.slots[slot];
    if (item) {
      setSelectedItemForDetail(Array.isArray(item) ? item[0] : item);
    } else if (onSelectSlot) {
      onSelectSlot(slot);
    }
  };

  return (
    <div className="w-full bg-[#1F3E2F] border border-[#D8B454]/30 rounded-3xl p-5 text-white space-y-4 shadow-md">
      {/* Header strip */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <span className="text-xs font-bold text-[#E5D2A5] tracking-wider uppercase font-label-sm">
          MÔ HÌNH PHỤC DỰNG
        </span>
        <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-[#162E22] border border-[#D8B454]/30 text-[#D8B454]">
          {outfit.gender === 'nam' ? 'Nam' : outfit.gender === 'nu' ? 'Nữ' : 'Nonbinary'}
        </span>
      </div>

      {/* 2 Main Spotlight Mockup Cards (Áo chính + Phụ kiện/Khăn) */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* Card 1: Áo chính */}
        <div
          onClick={() => handleSlotClick('top')}
          className="bg-[#244232] rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center text-center border border-[#305540] hover:border-[#D8B454]/60 transition-all cursor-pointer relative group"
        >
          {top && top.image_url && top.image_url.trim() !== '' ? (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden mb-2.5 border border-[#D8B454]/40 shadow-xs">
              <img src={top.image_url || undefined} alt={top.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            </div>
          ) : (
            <div
              className="w-14 h-14 rounded-2xl border border-[#D8B454]/50 flex items-center justify-center shadow-xs text-xs font-bold mb-2.5"
              style={{ backgroundColor: top?.color_hex || '#a03f30' }}
            >
              Áo
            </div>
          )}
          <span className="text-white font-bold text-xs sm:text-sm line-clamp-1 group-hover:text-[#E5D2A5] transition-colors">
            {top ? top.name : 'Áo Tấc Lụa Tơ'}
          </span>
          <span className="text-[11px] text-[#D8B454] mt-0.5 font-body-sm truncate max-w-[130px]">
            {top ? top.material : 'Áo chính'}
          </span>
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#D8B454]" />
        </div>

        {/* Card 2: Khăn Vấn & Phụ kiện */}
        <div
          onClick={() => handleSlotClick('head')}
          className="bg-[#244232] rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center text-center border border-[#305540] hover:border-[#D8B454]/60 transition-all cursor-pointer relative group"
        >
          {head && head.image_url && head.image_url.trim() !== '' ? (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden mb-2.5 border border-[#D8B454]/40 shadow-xs">
              <img src={head.image_url || undefined} alt={head.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            </div>
          ) : (
            <div
              className="w-14 h-14 rounded-2xl border border-[#D8B454]/50 flex items-center justify-center shadow-xs text-xs font-bold mb-2.5"
              style={{ backgroundColor: head?.color_hex || '#F9CA24', color: '#1a1c1a' }}
            >
              Khăn
            </div>
          )}
          <span className="text-white font-bold text-xs sm:text-sm line-clamp-1 group-hover:text-[#E5D2A5] transition-colors">
            {head ? head.name : (accessories[0] ? accessories[0].name : 'Khăn Vấn & Quạt')}
          </span>
          <span className="text-[11px] text-[#D8B454] mt-0.5 font-body-sm truncate max-w-[130px]">
            {head ? head.material : 'Phụ kiện'}
          </span>
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#D8B454]" />
        </div>
      </div>

      {/* Secondary Row: Quần/Váy + Hài/Giày */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div
          onClick={() => handleSlotClick('bottom')}
          className="bg-[#1C3628] rounded-xl p-3 flex items-center gap-2.5 border border-[#2D503C] hover:border-[#D8B454]/40 transition-all cursor-pointer"
        >
          <div
            className="w-8 h-8 rounded-lg shrink-0 border border-white/20 shadow-xs flex items-center justify-center text-[10px] font-bold"
            style={{ backgroundColor: bottom?.color_hex || '#F7F5F0', color: bottom?.color_hex === '#FFFFFF' || bottom?.color_hex === '#F7F5F0' ? '#1a1c1a' : '#FFFFFF' }}
          >
            Quần
          </div>
          <div className="truncate">
            <span className="text-xs font-semibold block truncate text-stone-100">
              {bottom ? bottom.name : 'Quần Bạch Sa'}
            </span>
            <span className="text-[10px] text-stone-400 font-body-sm">Thân dưới</span>
          </div>
        </div>

        <div
          onClick={() => handleSlotClick('footwear')}
          className="bg-[#1C3628] rounded-xl p-3 flex items-center gap-2.5 border border-[#2D503C] hover:border-[#D8B454]/40 transition-all cursor-pointer"
        >
          <div
            className="w-8 h-8 rounded-lg shrink-0 border border-white/20 shadow-xs flex items-center justify-center text-[10px] font-bold"
            style={{ backgroundColor: footwear?.color_hex || '#4A3728', color: '#FFFFFF' }}
          >
            Hài
          </div>
          <div className="truncate">
            <span className="text-xs font-semibold block truncate text-stone-100">
              {footwear ? footwear.name : 'Guốc Mộc Gỗ'}
            </span>
            <span className="text-[10px] text-stone-400 font-body-sm">Hài / Guốc</span>
          </div>
        </div>
      </div>
    </div>
  );
};
