import React from 'react';
import { useCostumeStore } from '../../store/useCostumeStore';
import { CostumeItem } from '../../types/costume';
import { NORMALIZED_REVIEW_FLAGS, NORMALIZED_SOURCES } from '../../data/mockHeritageData';
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
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
  Layers,
  FolderOpen,
  Info
} from 'lucide-react';

export const CulturalDetailModal: React.FC = () => {
  const {
    selectedItemForDetail,
    setSelectedItemForDetail,
    setSlotItem,
    outfit,
    toggleLockSlot,
    isSlotLocked,
    heritageItems
  } = useCostumeStore();

  if (!selectedItemForDetail) return null;

  const item = selectedItemForDetail;
  const isEquipped =
    item.slot === 'trang_suc'
      ? outfit.slots.trang_suc.some((a) => a.id === item.id)
      : item.slot === 'phu_kien'
      ? outfit.slots.phu_kien.some((a) => a.id === item.id)
      : (outfit.slots[item.slot] as CostumeItem | null | undefined)?.id === item.id;
  const isLocked = isSlotLocked(item.slot);

  const handleEquipToggle = () => {
    if (isEquipped) {
      if (item.slot === 'trang_suc') {
        const remaining = outfit.slots.trang_suc.filter((a) => a.id !== item.id);
        setSlotItem('trang_suc', null);
      } else if (item.slot === 'phu_kien') {
        const remaining = outfit.slots.phu_kien.filter((a) => a.id !== item.id);
        setSlotItem('phu_kien', null);
      } else {
        setSlotItem(item.slot, null);
      }
    } else {
      setSlotItem(item.slot, item);
    }
  };

  // Find relevant review flags mentioning this item
  const relevantFlags = NORMALIZED_REVIEW_FLAGS.filter(
    (f) =>
      f.topic.toLowerCase().includes(item.name.toLowerCase()) ||
      (item.cultural_group && f.topic.toLowerCase().includes(item.cultural_group.toLowerCase())) ||
      f.issue.toLowerCase().includes(item.id.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#FCFAF6] border border-stone-300 shadow-2xl p-6 sm:p-8 text-stone-900 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setSelectedItemForDetail(null)}
          className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-800 hover:bg-stone-200/60 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Archival Category Ribbon */}
        <div className="flex flex-wrap items-center gap-2 text-xs tracking-wider uppercase font-mono text-[#717971] mb-2">
          <span className="font-semibold text-[#A03F30]">HỒ SƠ DI SẢN CHUẨN HÓA V2</span>
          <span>·</span>
          <span>{item.id}</span>
          <span>·</span>
          <span className="font-bold text-[#2D533F]">{item.ethnic_group || item.culturalGroup}</span>
          {item.subgroup && (
            <>
              <span>·</span>
              <span className="text-amber-800">{item.subgroup}</span>
            </>
          )}
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 leading-tight mb-3">
          {item.name}
        </h2>

        {/* Metadata Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs pb-4 border-b border-stone-200">
          <span className="px-2.5 py-1 rounded-full font-bold bg-[#2D533F] text-white">
            {item.category} (Slot: {item.slot})
          </span>

          {item.color_hex && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 text-stone-800 font-mono text-[11px]">
              <span
                className="w-3 h-3 rounded-full border border-stone-300"
                style={{ backgroundColor: item.color_hex }}
              />
              <span>{item.color_hex}</span>
            </div>
          )}

          {item.cross_cultural_flag ? (
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200 text-[11px]">
              Cho phép phối giao thoa
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 font-semibold border border-stone-200 text-[11px]">
              Theo quy chuẩn bộ tham chiếu
            </span>
          )}

          {item.is_structural_part && (
            <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 font-semibold text-[11px]">
              Bộ phận cấu trúc
            </span>
          )}
        </div>

        {/* Content Body */}
        <div className="mt-5 space-y-5 text-sm">
          {/* Verification Status Banner */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs space-y-1">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Tình trạng thẩm định & nguồn tư liệu:</span>
            </div>
            <p className="text-amber-800 leading-relaxed">
              {item.verificationStatus || item.verification_status || 'Chưa có thông tin xác minh độc lập'}
            </p>
            {item.cultural_information_note && (
              <p className="text-amber-900/80 italic mt-1">
                Lưu ý: {item.cultural_information_note}
              </p>
            )}
          </div>

          {/* 1. Đặc điểm thị giác & Hoa văn */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2D533F]">
              <Scroll className="w-3.5 h-3.5" />
              <span>Đặc Điểm Thị Giác & Hoa Văn</span>
            </div>
            <p className="text-stone-800 leading-relaxed bg-[#FAF8F5] p-3.5 rounded-2xl border border-stone-200/80 text-xs">
              {item.visual_features || item.pattern_description || 'Không có mô tả hoa văn đặc thù.'}
            </p>
          </div>

          {/* 2. Ý nghĩa văn hóa & bối cảnh */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2D533F]">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Bối Cảnh Lịch Sử & Mô Tả Văn Hóa</span>
            </div>
            <p className="text-stone-800 leading-relaxed text-xs sm:text-sm pl-3 border-l-2 border-[#2D533F]">
              {item.cultural_significance || item.culturalContext || 'Chưa có thông tin ghi nhận.'}
            </p>
          </div>

          {/* 3. Chất liệu & Bối cảnh sử dụng */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white p-3.5 rounded-2xl border border-stone-200">
              <span className="text-[11px] font-bold text-stone-500 uppercase block mb-1">Chất liệu chế tác</span>
              <span className="text-xs text-stone-800 font-medium">
                {item.materials || item.material || 'Theo tư liệu phục dựng'}
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-stone-200">
              <span className="text-[11px] font-bold text-stone-500 uppercase block mb-1">Bối cảnh sử dụng</span>
              <span className="text-xs text-stone-800 font-medium">
                {item.usage || 'Đời thường hoặc nghi lễ theo tư liệu'}
              </span>
            </div>
          </div>

          {/* 4. Thành viên trong các Bộ tham chiếu (Outfit Memberships) */}
          {item.outfit_memberships && item.outfit_memberships.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1a1c1a]">
                <FolderOpen className="w-3.5 h-3.5 text-[#2D533F]" />
                <span>Liên kết Bộ Tham Chiếu ({item.outfit_memberships.length} bộ):</span>
              </div>

              <div className="space-y-2">
                {item.outfit_memberships.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-white border border-stone-200 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-stone-900">{m.outfit_name}</span>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#2D533F]/10 text-[#2D533F] font-bold">
                        {m.role}
                      </span>
                    </div>
                    {m.condition && (
                      <p className="text-[11px] text-stone-600 italic">
                        Điều kiện: {m.condition}
                      </p>
                    )}
                    {m.evidence_note && (
                      <p className="text-[10px] text-stone-500">
                        Chứng cứ: {m.evidence_note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Quan hệ phối đồ (Pairing & Compatibility) */}
          {item.pairing && (
            <div className="p-3.5 rounded-2xl bg-[#f5f4ef] border border-stone-200 text-xs space-y-2">
              <span className="font-bold text-stone-800 block uppercase tracking-wider text-[11px]">
                Quy tắc tương thích & Phối đồ có phạm vi:
              </span>
              <div className="space-y-1 text-[11px] text-stone-700">
                {item.pairing.conditional_item_ids && item.pairing.conditional_item_ids.length > 0 && (
                  <p>
                    <span className="font-semibold text-amber-900">Phối có điều kiện: </span>
                    {item.pairing.conditional_item_ids.join(', ')}
                  </p>
                )}
                {item.pairing.candidate_item_ids && item.pairing.candidate_item_ids.length > 0 && (
                  <p>
                    <span className="font-semibold text-blue-900">Ứng viên cần xác nhận: </span>
                    {item.pairing.candidate_item_ids.join(', ')}
                  </p>
                )}
                {item.pairing.alternative_item_ids && item.pairing.alternative_item_ids.length > 0 && (
                  <p>
                    <span className="font-semibold text-red-900">Phương án thay thế (không mặc đồng thời): </span>
                    {item.pairing.alternative_item_ids.join(', ')}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* 6. Review Flags Warning (if any) */}
          {relevantFlags.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900 block">
                Cờ Thẩm Định Học Thuật Liên Quan:
              </span>
              {relevantFlags.map((flag) => (
                <div
                  key={flag.id}
                  className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-950 font-serif">{flag.topic}</span>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-bold">
                      {flag.id} · {flag.status}
                    </span>
                  </div>
                  <p className="text-amber-900 text-[11px]">{flag.issue}</p>
                  <p className="text-emerald-900 text-[11px] font-medium">Hành động: {flag.action}</p>
                </div>
              ))}
            </div>
          )}

          {/* 7. Nguồn khảo cứu & Liên kết tư liệu */}
          {item.source_urls && item.source_urls.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200/80 text-xs space-y-1.5">
              <span className="font-bold text-blue-950 block">Nguồn tài liệu khảo cứu trực tiếp:</span>
              <div className="space-y-1">
                {item.source_urls.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-blue-700 hover:underline text-[11px]"
                  >
                    <ExternalLink className="w-3 h-3 shrink-0" />
                    <span className="truncate">{url}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Ghi chú thêm */}
          {item.notes && (
            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-600">
              <span className="font-bold text-stone-700 block mb-0.5">Ghi chú bổ sung:</span>
              <p>{item.notes}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-7 pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {isEquipped && (
              <button
                onClick={() => toggleLockSlot(item.slot)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  isLocked
                    ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                <span>{isLocked ? 'Đang khóa trong Studio' : 'Khóa món này khi AI phối'}</span>
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
              className={`px-5 py-2.5 text-xs font-label-md font-bold rounded-xl transition-all shadow-xs cursor-pointer ${
                isEquipped
                  ? 'bg-stone-200 text-stone-800 hover:bg-stone-300'
                  : 'bg-[#2D533F] text-white hover:bg-[#456b56]'
              }`}
            >
              {isEquipped ? 'Bỏ khỏi bảng phối' : 'Thêm vào bảng phối Studio'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
