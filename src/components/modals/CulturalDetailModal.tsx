import React from 'react';
import { useCostumeStore } from '../../store/useCostumeStore';
import { CostumeItem } from '../../types/costume';
import {
  X,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  Sparkles,
  Scroll,
  Tag,
  ShieldCheck
} from 'lucide-react';

export const CulturalDetailModal: React.FC = () => {
  const {
    selectedItemForDetail,
    setSelectedItemForDetail,
    setSlotItem,
    outfit,
    toggleLockSlot,
    isSlotLocked
  } = useCostumeStore();

  if (!selectedItemForDetail) return null;

  const item = selectedItemForDetail;
  const isEquipped =
    item.slot === 'accessories'
      ? outfit.slots.accessories.some((a) => a.id === item.id)
      : outfit.slots[item.slot]?.id === item.id;
  const isLocked = isSlotLocked(item.slot);

  const handleEquipToggle = () => {
    if (isEquipped) {
      if (item.slot === 'accessories') {
        setSlotItem('accessories', item); // toggles accessory in store
      } else {
        setSlotItem(item.slot, null);
      }
    } else {
      setSlotItem(item.slot, item);
    }
  };

  const getRitualLabel = (level: string) => {
    switch (level) {
      case 'daily':
        return { label: 'Thường phục hàng ngày', color: 'text-stone-700 bg-stone-100' };
      case 'festive':
        return { label: 'Lễ phục / Lễ hội truyền thống', color: 'text-amber-800 bg-amber-50' };
      case 'sacred_ritual':
        return { label: 'Y phục Tế tự / Tín ngưỡng thiêng liêng', color: 'text-red-800 bg-red-50' };
      default:
        return { label: 'Trang phục truyền thống', color: 'text-stone-700 bg-stone-100' };
    }
  };

  const ritualInfo = getRitualLabel(item.ritual_level);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#FCFAF6] border border-stone-300/80 shadow-2xl p-6 sm:p-8 text-stone-900 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setSelectedItemForDetail(null)}
          className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-800 hover:bg-stone-200/60 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Ribbon: Archival Category */}
        <div className="flex items-center gap-2 text-xs tracking-widest uppercase font-serif text-stone-500 mb-2">
          <span>Hồ Sơ Giám Định Di Sản</span>
          <span aria-hidden="true">·</span>
          <span>{item.ethnic_group}</span>
          <span aria-hidden="true">·</span>
          <span>{item.period_or_region}</span>
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-stone-900 leading-tight mb-4">
          {item.name}
        </h2>

        {/* Metadata Badges without Pill Clutter */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600 pb-4 border-b border-stone-200">
          <div className="flex items-center gap-1.5">
            <span
              className="w-3.5 h-3.5 rounded-full border border-stone-300 shadow-xs"
              style={{ backgroundColor: item.color_hex }}
            />
            <span className="font-mono text-stone-700">{item.color_hex}</span>
          </div>

          <span aria-hidden="true">·</span>

          <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${ritualInfo.color}`}>
            {ritualInfo.label}
          </span>

          <span aria-hidden="true">·</span>

          <span>
            {item.cross_cultural_flag ? (
              <span className="text-emerald-700 font-medium">Cho phép phối giao thoa</span>
            ) : (
              <span className="text-stone-500">Quy chuẩn nguyên bản</span>
            )}
          </span>
        </div>

        {/* Content Section Grid */}
        <div className="mt-5 space-y-5 text-sm">
          {/* 1. Họa tiết & Hoa văn */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-500 font-label-sm">
              <Scroll className="w-3.5 h-3.5 text-[#2d533f]" />
              <span>Họa Tiết & Hoa Văn</span>
            </div>
            <p className="text-stone-800 leading-relaxed font-body-sm bg-stone-50/80 p-3.5 rounded-xl border border-stone-200/60 text-xs">
              {item.pattern_description || 'Chưa có thông tin xác minh'}
            </p>
          </div>

          {/* 2. Ý nghĩa Văn hóa & Vũ trụ quan */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-500 font-label-sm">
              <BookOpen className="w-3.5 h-3.5 text-[#2d533f]" />
              <span>Ý Nghĩa Văn Hóa & Triết Lý Di Sản</span>
            </div>
            <p className="text-stone-800 leading-relaxed font-headline text-[15px] pl-3 border-l-2 border-[#2d533f]/60">
              {item.cultural_significance || 'Chưa có thông tin xác minh'}
            </p>
          </div>

          {/* 3. Chất liệu & Kỹ nghệ chế tác */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="bg-white p-3 rounded-xl border border-stone-200">
              <span className="text-xs text-stone-500 block mb-1">Chất liệu chế tác</span>
              <span className="font-medium text-stone-800 text-xs sm:text-sm">{item.material}</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-stone-200">
              <span className="text-xs text-stone-500 block mb-1">Phân loại bộ phận</span>
              <span className="font-medium text-stone-800 text-xs sm:text-sm uppercase tracking-wider">
                {item.slot}
              </span>
            </div>
          </div>

          {/* 4. Nguồn tài liệu khảo cứu (Cultural Confidence) */}
          <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-semibold text-amber-900 block mb-0.5">Tư liệu khảo cứu xác thực:</span>
              <span className="text-amber-800 italic">
                {item.source_verification || 'Chưa có thông tin xác minh'}
              </span>
            </div>
          </div>

          {/* Warning Flag if Sacred Ritual */}
          {item.ritual_level === 'sacred_ritual' && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
              <div className="text-xs text-red-800">
                <span className="font-semibold block mb-0.5">Ràng buộc Hard Constraint:</span>
                Trang phục mang ý nghĩa tín ngưỡng/nghi lễ thiêng liêng. Hệ thống nghiêm cấm tự ý phối
                cho bối cảnh thường nhật, dạo phố hoặc chụp ảnh thông thường.
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-7 pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {isEquipped && (
              <button
                onClick={() => toggleLockSlot(item.slot)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isLocked
                    ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                <span>{isLocked ? 'Đang khóa trên ma-nơ-canh' : 'Khóa món này khi AI phối'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedItemForDetail(null)}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
            >
              Đóng
            </button>
            <button
              onClick={handleEquipToggle}
              className={`px-5 py-2 text-xs font-label-md font-semibold rounded-lg transition-all shadow-xs cursor-pointer ${
                isEquipped
                  ? 'bg-stone-200 text-stone-800 hover:bg-stone-300'
                  : 'bg-[#2d533f] text-white hover:bg-[#456b56]'
              }`}
            >
              {isEquipped ? 'Tháo khỏi ma-nơ-canh' : 'Mặc lên ma-nơ-canh'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
