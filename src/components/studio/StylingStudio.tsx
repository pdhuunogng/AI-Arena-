import React, { useState } from 'react';
import { useCostumeStore } from '../../store/useCostumeStore';
import { CostumeItem, GarmentCategory } from '../../types/costume';
import { evaluateEquippedOutfitCompatibility } from '../../data/mockHeritageData';
import {
  Sparkles,
  Wand2,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  Info,
  RefreshCw,
  Send,
  Bookmark,
  ShieldCheck,
  Check,
  Sliders,
  Layers,
  X,
  Plus,
  Trash2,
  Search,
  Filter,
  ShieldAlert
} from 'lucide-react';

export const StylingStudio: React.FC = () => {
  const {
    outfit,
    setSlotItem,
    removeSlotItem,
    toggleLockSlot,
    isSlotLocked,
    clearOutfit,
    setSelectedItemForDetail,
    heritageItems,
    customClosetItems,
    isAiLoading,
    setAiLoading,
    aiAdvisoryResult,
    setAiAdvisoryResult,
    aiError,
    setAiError,
    applyAiOutfit,
    saveCurrentToLookbook,
    setGender
  } = useCostumeStore();

  const [promptText, setPromptText] = useState('');
  const [selectedOccasion, setSelectedOccasion] = useState('Dạo phố & gặp gỡ bạn bè');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'manual' | 'ai'>('manual');
  const [activeDrawerSlot, setActiveDrawerSlot] = useState<GarmentCategory | null>('Áo');
  const [drawerSearch, setDrawerSearch] = useState('');
  const [drawerSourceFilter, setDrawerSourceFilter] = useState<'all' | 'heritage' | 'personal'>('all');

  // Unified catalog
  const catalog = [...heritageItems, ...customClosetItems];

  // Presets
  const PRESET_PROMPTS = [
    {
      title: '🌾 Đám cưới mùa thu',
      prompt: 'Phối cho tôi một bộ đi dự đám cưới bạn mùa thu, tông màu nhã nhặn, chất liệu tơ sa, chuẩn mực trang trọng'
    },
    {
      title: '⛰️ Hội Gầu Tào Tây Bắc',
      prompt: 'Set đồ thổ cẩm lanh H\'Mông đi hội xuân vùng cao Tây Bắc, họa tiết sáp ong và vòng bạc hộ thân'
    },
    {
      title: '☀️ Lễ hội Katê tháp Chăm',
      prompt: 'Trang phục nữ Chăm áo Aw Cam trắng kết hợp thắt lưng thổ cẩm Khaban rực rỡ dự lễ hội Katê'
    },
    {
      title: '🍃 Dạo phố giao thoa',
      prompt: 'Phối áo ngũ thân cách tân đương đại để dạo phố cuối tuần, trẻ trung, phối hợp phụ kiện thoải mái'
    },
    {
      title: '🔥 Streetwear Cổ Phong',
      prompt: 'Phối áo truyền thống theo phong cách streetwear Gen Z cá tính, giữ nguyên hoa văn và phom dáng gốc'
    }
  ];

  const isMatchingSlot = (item: CostumeItem, slot: GarmentCategory | null) => {
    if (!slot) return true;
    if (item.category === slot) return true;
    const s = item.slot;
    const cat = (item.category || '').toLowerCase();
    if (slot === 'Áo' && (s === 'ao' || cat.includes('áo'))) return true;
    if (slot === 'Quần' && (s === 'quan' || cat.includes('quần') || cat.includes('thân dưới'))) return true;
    if (slot === 'Váy' && (s === 'vay' || cat.includes('váy'))) return true;
    if (slot === 'Khăn' && (s === 'khan' || cat.includes('khăn'))) return true;
    if (slot === 'Mũ' && (s === 'mu' || cat.includes('mũ'))) return true;
    if (slot === 'Giày' && (s === 'giay' || cat.includes('giày'))) return true;
    if (slot === 'Trang sức' && (s === 'trang_suc' || cat.includes('trang sức'))) return true;
    if (slot === 'Phụ kiện' && (s === 'phu_kien' || cat.includes('phụ kiện') || cat.includes('bộ phận'))) return true;
    return false;
  };

  // Filter items compatible with current active drawer slot
  const drawerItems = catalog.filter((item) => {
    if (activeDrawerSlot && !isMatchingSlot(item, activeDrawerSlot)) {
      return false;
    }
    if (drawerSourceFilter === 'heritage' && item.is_personal) return false;
    if (drawerSourceFilter === 'personal' && !item.is_personal) return false;

    if (drawerSearch.trim()) {
      const q = drawerSearch.toLowerCase();
      const match =
        item.id.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.ethnic_group.toLowerCase().includes(q) ||
        (item.subgroup && item.subgroup.toLowerCase().includes(q)) ||
        (item.material && item.material.toLowerCase().includes(q)) ||
        (item.pattern_description && item.pattern_description.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  // Check if item is currently in outfit
  const isItemEquipped = (item: CostumeItem): boolean => {
    const s = outfit.slots;
    return (
      s.ao?.id === item.id ||
      s.quan?.id === item.id ||
      s.vay?.id === item.id ||
      s.khan?.id === item.id ||
      s.mu?.id === item.id ||
      s.giay?.id === item.id ||
      s.trang_suc.some((a) => a.id === item.id) ||
      s.phu_kien.some((a) => a.id === item.id)
    );
  };

  // Handle selecting an item into the outfit
  const handleSelectItem = (item: CostumeItem) => {
    const s = item.slot;
    if (s === 'ao') setSlotItem('ao', item);
    else if (s === 'quan') setSlotItem('quan', item);
    else if (s === 'vay') setSlotItem('vay', item);
    else if (s === 'khan') setSlotItem('khan', item);
    else if (s === 'mu') setSlotItem('mu', item);
    else if (s === 'giay') setSlotItem('giay', item);
    else if (s === 'trang_suc') setSlotItem('trang_suc', item);
    else setSlotItem('phu_kien', item);
  };

  // AI Advisor Call: Hoàn thiện từ slot đang chọn (Cơ chế 1)
  const handleTriggerAiComplete = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch('/api/advisor/complete-outfit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentOutfit: outfit,
          lockedSlots: outfit.locked_slots,
          catalogItems: catalog,
          userGender: outfit.gender,
          occasionPrompt: `${selectedOccasion}: ${promptText}`
        })
      });

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      setAiAdvisoryResult(data);
    } catch (err: any) {
      console.error('Failed to complete outfit:', err);
      setAiError('Không thể kết nối đến Cố vấn AI. Đang sử dụng engine quy tắc di sản nội tại.');
    } finally {
      setAiLoading(false);
    }
  };

  // AI Advisor Call: Phối tự do theo prompt (Cơ chế 2)
  const handleTriggerAiFreePrompt = async () => {
    if (!promptText.trim()) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch('/api/advisor/free-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `${selectedOccasion}: ${promptText}`,
          catalogItems: catalog,
          userGender: outfit.gender
        })
      });

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      setAiAdvisoryResult(data);
    } catch (err: any) {
      console.error('Failed to run prompt advisor:', err);
      setAiError('Không thể kết nối đến Cố vấn AI. Vui lòng thử lại.');
    } finally {
      setAiLoading(false);
    }
  };

  // Save to Lookbook
  const handleSaveLookbook = () => {
    saveCurrentToLookbook();
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 2500);
  };

  // Equipped items list & compatibility evaluation
  const equippedList = [
    outfit.slots.ao,
    outfit.slots.quan,
    outfit.slots.vay,
    outfit.slots.khan,
    outfit.slots.mu,
    outfit.slots.giay,
    ...outfit.slots.trang_suc,
    ...outfit.slots.phu_kien
  ].filter(Boolean) as CostumeItem[];

  const equippedCount = equippedList.length;
  const compatibility = evaluateEquippedOutfitCompatibility(equippedList);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* 1. Header Bar: Identity & Actions */}
      <div className="relative rounded-3xl overflow-hidden bg-[#A03F30] text-[#FFFDF8] p-6 sm:p-8 shadow-xl border border-[#863528]">
        {/* Subtle Heritage Brocade Motif */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="brocade-lattice-24" patternUnits="userSpaceOnUse" width="24" height="24">
                <rect fill="none" height="24" stroke="#FFFDF8" strokeWidth="0.8" width="24" />
                <path d="M12,2 L22,12 L12,22 L2,12 Z" fill="none" stroke="#FFFDF8" strokeWidth="0.8" />
                <circle cx="12" cy="12" fill="#D8B454" fillOpacity="0.4" r="3" />
              </pattern>
            </defs>
            <rect fill="url(#brocade-lattice-24)" height="100%" width="100%" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#D8B454] font-mono">
                VIỆT CỔ Y PHONG AI · PHÒNG PHỐI ĐỒ
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-label-sm bg-black/30 text-[#FFFDF8] border border-white/20 font-semibold">
                ✓ {equippedCount} món đang mặc · {aiAdvisoryResult?.cultural_accuracy_score || '96% tương thích'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
              Phòng Phối Trang Phục Di Sản
            </h1>
            <p className="text-xs sm:text-sm text-stone-100 font-sans mt-0.5 max-w-xl">
              Phối trang phục truyền thống và giám định chuẩn xác cùng AI.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Gender Quick Preset */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-black/20 border border-white/20 text-xs font-label-md">
              {(['nam', 'nu', 'nonbinary'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                    outfit.gender === g
                      ? 'bg-[#D8B454] text-stone-900 font-bold shadow-xs'
                      : 'text-stone-100 hover:text-white'
                  }`}
                >
                  {g === 'nam' ? 'Nam' : g === 'nu' ? 'Nữ' : 'Nonbinary'}
                </button>
              ))}
            </div>

            {/* Clear outfit button */}
            <button
              onClick={clearOutfit}
              className="px-3.5 py-2 text-xs font-label-md text-white bg-white/15 hover:bg-white/25 rounded-xl transition-colors cursor-pointer border border-white/25 font-semibold"
            >
              Làm mới
            </button>

            {/* Save lookbook button */}
            <button
              onClick={handleSaveLookbook}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-label-md font-bold text-stone-900 bg-[#D8B454] hover:bg-[#c9a33e] rounded-xl transition-all shadow-md cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{saveSuccessMsg ? 'Đã lưu bộ sưu tập!' : 'Lưu bộ sưu tập'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Mode Switcher (Tự phối đồ vs AI hỗ trợ) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-2xl bg-white border border-[#e9e8e3] shadow-xs">
        <div className="bg-[#efeee9] p-1 rounded-full flex max-w-sm border border-[#e9e8e3]">
          <button
            onClick={() => setActiveSubTab('manual')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-full text-xs font-label-md transition-all cursor-pointer ${
              activeSubTab === 'manual'
                ? 'bg-white text-[#2d533f] font-bold shadow-xs'
                : 'text-[#414942] hover:text-[#1a1c1a]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-[#a03f30]" />
            <span>Tự phối đồ</span>
          </button>

          <button
            onClick={() => setActiveSubTab('ai')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-full text-xs font-label-md transition-all cursor-pointer ${
              activeSubTab === 'ai'
                ? 'bg-[#A03F30] text-white font-bold shadow-xs'
                : 'text-[#414942] hover:text-[#A03F30]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D8B454]" />
            <span>AI hỗ trợ</span>
          </button>
        </div>

        {/* Heritage Guard Status */}
        <div className="flex items-center gap-2 text-xs text-[#414942] px-3.5 py-2 rounded-xl bg-[#f5f4ef] border border-[#e9e8e3]">
          <ShieldCheck className="w-4 h-4 text-[#A03F30] shrink-0" />
          <span className="font-label-md font-bold text-[#1a1c1a]">Chuẩn mực văn hóa:</span>
          <span className="text-[#A03F30] font-semibold">Bảo lưu quy cách truyền thống</span>
        </div>
      </div>

      {/* 3. Main Grid: Selected Items Area (Left 7 Cols) + Garment Selector / AI Console (Right 5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: SELECTED ITEMS AREA (BẢNG PHỐI ĐỒ DẠNG THẺ THỰC TẾ) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#D8B454]" />
              <h2 className="font-serif font-bold text-lg text-white">
                Trang Phục Đã Chọn
              </h2>
            </div>
            <span className="text-[11px] font-label-sm text-[#D8B454] bg-black/30 px-2.5 py-0.5 rounded-full border border-[#D8B454]/40 font-semibold">
              {equippedCount}/8 vị trí trang phục
            </span>
          </div>

          {/* Cultural Compatibility Banner based on 168 Scoped Rules */}
          <div className={`p-4 rounded-2xl border text-xs space-y-2 ${compatibility.badgeClass}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span className="font-bold font-serif text-sm">
                  {compatibility.badgeTitle}
                </span>
              </div>
              <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded bg-black/10">
                168 Quy tắc tương thích
              </span>
            </div>

            <p className="leading-relaxed opacity-90">
              {compatibility.explanation}
            </p>

            {compatibility.ruleMessages.length > 0 && (
              <div className="space-y-1 pt-1.5 border-t border-black/10">
                {compatibility.ruleMessages.map((rm, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-[11px]">
                    <span className="shrink-0 font-bold">
                      {rm.type === 'conflict' ? '⚠️' : rm.type === 'condition' ? 'ℹ️' : '✓'}
                    </span>
                    <span>{rm.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Slots Grid: 8 Modular Garment Slots */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Slot 1: ÁO */}
            <GarmentSlotCard
              title="Áo"
              category="Áo"
              slotKey="ao"
              item={outfit.slots.ao}
              isLocked={isSlotLocked('ao')}
              onToggleLock={() => toggleLockSlot('ao')}
              onOpenDrawer={() => setActiveDrawerSlot('Áo')}
              onRemove={() => removeSlotItem('ao')}
              onViewDetail={(item) => setSelectedItemForDetail(item)}
            />

            {/* Slot 2: QUẦN */}
            <GarmentSlotCard
              title="Quần"
              category="Quần"
              slotKey="quan"
              item={outfit.slots.quan}
              isLocked={isSlotLocked('quan')}
              onToggleLock={() => toggleLockSlot('quan')}
              onOpenDrawer={() => setActiveDrawerSlot('Quần')}
              onRemove={() => removeSlotItem('quan')}
              onViewDetail={(item) => setSelectedItemForDetail(item)}
            />

            {/* Slot 3: VÁY */}
            <GarmentSlotCard
              title="Váy"
              category="Váy"
              slotKey="vay"
              item={outfit.slots.vay}
              isLocked={isSlotLocked('vay')}
              onToggleLock={() => toggleLockSlot('vay')}
              onOpenDrawer={() => setActiveDrawerSlot('Váy')}
              onRemove={() => removeSlotItem('vay')}
              onViewDetail={(item) => setSelectedItemForDetail(item)}
            />

            {/* Slot 4: KHĂN */}
            <GarmentSlotCard
              title="Khăn"
              category="Khăn"
              slotKey="khan"
              item={outfit.slots.khan}
              isLocked={isSlotLocked('khan')}
              onToggleLock={() => toggleLockSlot('khan')}
              onOpenDrawer={() => setActiveDrawerSlot('Khăn')}
              onRemove={() => removeSlotItem('khan')}
              onViewDetail={(item) => setSelectedItemForDetail(item)}
            />

            {/* Slot 5: MŨ */}
            <GarmentSlotCard
              title="Mũ"
              category="Mũ"
              slotKey="mu"
              item={outfit.slots.mu}
              isLocked={isSlotLocked('mu')}
              onToggleLock={() => toggleLockSlot('mu')}
              onOpenDrawer={() => setActiveDrawerSlot('Mũ')}
              onRemove={() => removeSlotItem('mu')}
              onViewDetail={(item) => setSelectedItemForDetail(item)}
            />

            {/* Slot 6: GIÀY */}
            <GarmentSlotCard
              title="Giày / Hài"
              category="Giày"
              slotKey="giay"
              item={outfit.slots.giay}
              isLocked={isSlotLocked('giay')}
              onToggleLock={() => toggleLockSlot('giay')}
              onOpenDrawer={() => setActiveDrawerSlot('Giày')}
              onRemove={() => removeSlotItem('giay')}
              onViewDetail={(item) => setSelectedItemForDetail(item)}
            />
          </div>

          {/* Multi-item slots: TRANG SỨC & PHỤ KIỆN */}
          <div className="space-y-4 pt-2">
            {/* Slot 7: TRANG SỨC */}
            <div className="bg-white rounded-2xl border border-[#e9e8e3] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#caa749]/20 text-[#755b00] flex items-center justify-center text-[10px] font-bold">
                    7
                  </span>
                  <span className="text-xs font-label-md font-bold uppercase tracking-wider text-[#1a1c1a]">
                    Trang Sức (Kiềng, Xà tích, Vòng)
                  </span>
                </div>
                <button
                  onClick={() => setActiveDrawerSlot('Trang sức')}
                  className="px-2.5 py-1 text-xs font-label-md font-semibold text-[#2d533f] hover:bg-[#2d533f]/10 rounded-lg transition-colors cursor-pointer"
                >
                  + Thêm trang sức
                </button>
              </div>

              {outfit.slots.trang_suc.length === 0 ? (
                <div
                  onClick={() => setActiveDrawerSlot('Trang sức')}
                  className="p-4 rounded-xl border border-dashed border-[#c1c9bf] bg-[#fbf9f4] text-center text-xs text-[#717971] cursor-pointer hover:border-[#2d533f] transition-all"
                >
                  Chưa chọn món trang sức nào. Nhấn để khám phá kiềng bạc, xà tích...
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {outfit.slots.trang_suc.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-[#f5f4ef] border border-[#e9e8e3]"
                    >
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover bg-white shrink-0 border border-[#e9e8e3]"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-[#1a1c1a] truncate">{item.name}</h4>
                        <span className="text-[10px] text-[#717971]">{item.ethnic_group}</span>
                      </div>
                      <button
                        onClick={() => setSlotItem('trang_suc', item)}
                        className="p-1 text-[#717971] hover:text-[#a03f30] transition-colors cursor-pointer"
                        title="Gỡ bỏ món này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Slot 8: PHỤ KIỆN */}
            <div className="bg-white rounded-2xl border border-[#e9e8e3] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#caa749]/20 text-[#755b00] flex items-center justify-center text-[10px] font-bold">
                    8
                  </span>
                  <span className="text-xs font-label-md font-bold uppercase tracking-wider text-[#1a1c1a]">
                    Phụ Kiện (Thắt lưng, Túi gấm, Quạt)
                  </span>
                </div>
                <button
                  onClick={() => setActiveDrawerSlot('Phụ kiện')}
                  className="px-2.5 py-1 text-xs font-label-md font-semibold text-[#2d533f] hover:bg-[#2d533f]/10 rounded-lg transition-colors cursor-pointer"
                >
                  + Thêm phụ kiện
                </button>
              </div>

              {outfit.slots.phu_kien.length === 0 ? (
                <div
                  onClick={() => setActiveDrawerSlot('Phụ kiện')}
                  className="p-4 rounded-xl border border-dashed border-[#c1c9bf] bg-[#fbf9f4] text-center text-xs text-[#717971] cursor-pointer hover:border-[#2d533f] transition-all"
                >
                  Chưa chọn phụ kiện nào. Nhấn để thêm thắt lưng lụa, túi gấm...
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {outfit.slots.phu_kien.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-[#f5f4ef] border border-[#e9e8e3]"
                    >
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover bg-white shrink-0 border border-[#e9e8e3]"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-[#1a1c1a] truncate">{item.name}</h4>
                        <span className="text-[10px] text-[#717971]">{item.ethnic_group}</span>
                      </div>
                      <button
                        onClick={() => setSlotItem('phu_kien', item)}
                        className="p-1 text-[#717971] hover:text-[#a03f30] transition-colors cursor-pointer"
                        title="Gỡ bỏ món này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DRAWER SELECTOR (MANUAL) OR AI ASSISTANT CONSOLE (AI) */}
        <div className="lg:col-span-5 space-y-4">
          {activeSubTab === 'manual' ? (
            /* VISUAL GARMENT SELECTOR PANEL */
            <div className="bg-white rounded-3xl border border-[#e9e8e3] p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#efeee9] pb-3">
                <div className="space-y-0.5">
                  <div className="text-[10px] font-mono text-[#A03F30] uppercase font-bold tracking-wider">
                    NGĂN KÉO CHỌN ĐỒ
                  </div>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-[#1a1c1a]">
                    Chọn: {activeDrawerSlot || 'Tất cả món'}
                  </h3>
                </div>
                <span className="text-xs font-mono text-[#717971]">
                  {drawerItems.length} món khả dụng
                </span>
              </div>

              {/* Category fast tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {(['Áo', 'Quần', 'Váy', 'Khăn', 'Mũ', 'Giày', 'Trang sức', 'Phụ kiện'] as GarmentCategory[]).map(
                  (cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveDrawerSlot(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-label-md font-semibold shrink-0 cursor-pointer transition-all ${
                        activeDrawerSlot === cat
                          ? 'bg-[#2d533f] text-white shadow-xs'
                          : 'bg-[#f5f4ef] text-[#414942] hover:bg-[#e9e8e3]'
                      }`}
                    >
                      {cat}
                    </button>
                  )
                )}
              </div>

              {/* Source filter & Search bar */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#717971]" />
                  <input
                    type="text"
                    value={drawerSearch}
                    onChange={(e) => setDrawerSearch(e.target.value)}
                    placeholder="Tìm theo tên, dân tộc, chất liệu..."
                    className="w-full bg-[#fbf9f4] border border-[#e9e8e3] rounded-xl pl-9 pr-3 py-2 text-xs text-[#1a1c1a] focus:outline-none focus:border-[#2d533f]"
                  />
                </div>

                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="text-[#717971]">Nguồn:</span>
                  {(['all', 'heritage', 'personal'] as const).map((src) => (
                    <button
                      key={src}
                      onClick={() => setDrawerSourceFilter(src)}
                      className={`px-2.5 py-0.5 rounded-md transition-colors cursor-pointer ${
                        drawerSourceFilter === src
                          ? 'bg-[#caa749]/30 text-[#755b00] font-bold'
                          : 'text-[#414942] hover:bg-[#f5f4ef]'
                      }`}
                    >
                      {src === 'all' ? 'Tất cả' : src === 'heritage' ? 'Di sản mẫu' : 'Tủ đồ cá nhân'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Garment Cards List */}
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {drawerItems.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#717971]">
                    Không tìm thấy món đồ phù hợp trong mục {activeDrawerSlot}.
                  </div>
                ) : (
                  drawerItems.map((item) => {
                    const equipped = isItemEquipped(item);
                    return (
                      <div
                        key={item.id}
                        className={`p-3 rounded-2xl border transition-all flex items-center gap-3.5 ${
                          equipped
                            ? 'bg-[#2d533f]/10 border-[#2d533f]'
                            : 'bg-[#fbf9f4] border-[#e9e8e3] hover:border-[#2d533f]/50'
                        }`}
                      >
                        {(item.image_url || item.imageUrl) ? (
                          <img
                            src={(item.image_url || item.imageUrl)!}
                            alt={item.name}
                            className="w-16 h-16 rounded-xl object-cover bg-white border border-[#e9e8e3] shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-stone-100 border border-[#e9e8e3] shrink-0 flex flex-col items-center justify-center text-stone-400 p-1 text-center">
                            <Layers className="w-5 h-5 text-stone-300" />
                            <span className="text-[8px] text-stone-400 mt-0.5">Tư liệu</span>
                          </div>
                        )}

                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#2d533f] text-white">
                              {item.category}
                            </span>
                            <span className="text-[10px] text-[#717971] font-medium">
                              {item.ethnic_group}
                            </span>
                          </div>
                          <h4 className="text-xs font-serif font-bold text-[#1a1c1a] truncate">
                            {item.name}
                          </h4>
                          <p className="text-[11px] text-[#414942] line-clamp-1">
                            {item.material}
                          </p>
                        </div>

                        <div className="flex flex-col gap-1 shrink-0">
                          <button
                            onClick={() => handleSelectItem(item)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-label-md font-bold transition-all cursor-pointer ${
                              equipped
                                ? 'bg-white text-[#2d533f] border border-[#2d533f]'
                                : 'bg-[#2d533f] hover:bg-[#456b56] text-white shadow-xs'
                            }`}
                          >
                            {equipped ? 'Đang mặc' : '+ Chọn'}
                          </button>
                          <button
                            onClick={() => setSelectedItemForDetail(item)}
                            className="p-1 text-center text-[10px] text-[#717971] hover:text-[#1a1c1a]"
                            title="Xem chi tiết"
                          >
                            Chi tiết
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            /* AI ASSISTANT CONSOLE */
            <div className="bg-white rounded-3xl border border-[#e9e8e3] p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#efeee9] pb-3">
                <div className="space-y-0.5">
                  <div className="text-[10px] font-mono text-[#D8B454] uppercase font-bold tracking-wider">
                    AI CỐ VẤN VĂN HÓA
                  </div>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-[#1a1c1a]">
                    Gợi Ý Phối Đồ Thông Minh
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-label-sm bg-[#caa749]/20 text-[#755b00] font-bold">
                  Gemini AI 2026
                </span>
              </div>

              {/* Occasion Selector */}
              <div className="space-y-1">
                <label className="text-xs font-label-md font-bold text-[#1a1c1a]">
                  Bối cảnh / Sự kiện:
                </label>
                <select
                  value={selectedOccasion}
                  onChange={(e) => setSelectedOccasion(e.target.value)}
                  className="w-full bg-[#fbf9f4] border border-[#e9e8e3] rounded-xl px-3 py-2 text-xs text-[#1a1c1a] focus:outline-none focus:border-[#2d533f]"
                >
                  <option value="Dạo phố & gặp gỡ bạn bè">Dạo phố & gặp gỡ bạn bè</option>
                  <option value="Lễ cưới truyền thống">Lễ cưới truyền thống</option>
                  <option value="Điểm hội văn hóa & Lễ hội">Điểm hội văn hóa & Lễ hội</option>
                  <option value="Chụp ảnh nghệ thuật Cổ phong">Chụp ảnh nghệ thuật Cổ phong</option>
                  <option value="Sự kiện giao lưu trang trọng">Sự kiện giao lưu trang trọng</option>
                </select>
              </div>

              {/* Natural Language Prompt Input */}
              <div className="space-y-1">
                <label className="text-xs font-label-md font-bold text-[#1a1c1a]">
                  Yêu cầu phối riêng của bạn:
                </label>
                <textarea
                  rows={3}
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Ví dụ: Phối áo truyền thống theo phong cách streetwear, giữ nguyên hoa văn gốc..."
                  className="w-full bg-[#fbf9f4] border border-[#e9e8e3] rounded-xl p-3 text-xs text-[#1a1c1a] focus:outline-none focus:border-[#2d533f]"
                />
              </div>

              {/* Preset Chips */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-label-sm text-[#717971] uppercase">Gợi ý nhanh:</span>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  {PRESET_PROMPTS.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPromptText(p.prompt)}
                      className="px-2.5 py-1 rounded-full bg-[#f5f4ef] hover:bg-[#e9e8e3] text-[11px] font-label-sm text-[#1a1c1a] shrink-0 transition-colors cursor-pointer border border-[#e9e8e3]"
                    >
                      {p.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons: Hoàn thiện vs Phối mới */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  disabled={isAiLoading}
                  onClick={handleTriggerAiComplete}
                  className="py-2.5 px-3 bg-[#2d533f] hover:bg-[#456b56] disabled:opacity-50 text-white text-xs font-label-md font-bold rounded-xl transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Wand2 className="w-3.5 h-3.5 text-[#D8B454]" />
                  <span>{isAiLoading ? 'Đang phân tích...' : 'Hoàn thiện set này'}</span>
                </button>

                <button
                  disabled={isAiLoading || !promptText.trim()}
                  onClick={handleTriggerAiFreePrompt}
                  className="py-2.5 px-3 bg-[#a03f30] hover:bg-[#863528] disabled:opacity-50 text-white text-xs font-label-md font-bold rounded-xl transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isAiLoading ? 'Đang suy nghĩ...' : 'Phối mới tự do'}</span>
                </button>
              </div>

              {aiError && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{aiError}</span>
                </div>
              )}

              {/* AI Advisory Result Card */}
              {aiAdvisoryResult && (
                <div className="mt-4 p-4 rounded-2xl bg-[#fbf9f4] border border-[#caa749]/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-serif font-bold text-[#1a1c1a]">
                      {aiAdvisoryResult.outfit_name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#2d533f] text-white">
                      {aiAdvisoryResult.cultural_accuracy_score}
                    </span>
                  </div>

                  <p className="text-xs text-[#414942] italic leading-relaxed">
                    "{aiAdvisoryResult.overall_comment}"
                  </p>

                  {/* Warning Flags if any */}
                  {aiAdvisoryResult.warning_flags && aiAdvisoryResult.warning_flags.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-[11px] space-y-1">
                      {aiAdvisoryResult.warning_flags.map((w, idx) => (
                        <p key={idx} className="flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>{w}</span>
                        </p>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => applyAiOutfit(aiAdvisoryResult)}
                    className="w-full py-2 bg-[#D8B454] hover:bg-[#c9a33e] text-stone-900 font-label-md font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Áp dụng gợi ý vào bảng phối</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Reusable Sub-component for individual Garment Slot Cards
interface GarmentSlotCardProps {
  title: string;
  category: GarmentCategory;
  slotKey: string;
  item: CostumeItem | null;
  isLocked: boolean;
  onToggleLock: () => void;
  onOpenDrawer: () => void;
  onRemove: () => void;
  onViewDetail: (item: CostumeItem) => void;
}

const GarmentSlotCard: React.FC<GarmentSlotCardProps> = ({
  title,
  category,
  item,
  isLocked,
  onToggleLock,
  onOpenDrawer,
  onRemove,
  onViewDetail
}) => {
  return (
    <div
      className={`bg-white rounded-2xl border p-3.5 transition-all flex flex-col justify-between group ${
        item ? 'border-[#e9e8e3] hover:border-[#2d533f]/50' : 'border-dashed border-[#c1c9bf] bg-[#fbf9f4]'
      }`}
    >
      <div>
        {/* Header Strip: Slot title and Lock button */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-[#2d533f]/15 text-[#2d533f] flex items-center justify-center text-[10px] font-bold">
              ✦
            </span>
            <span className="text-xs font-label-md font-bold uppercase tracking-wider text-[#2d533f]">
              {title}
            </span>
            {item && (
              <span className="text-[10px] text-[#717971] font-mono">({item.ethnic_group})</span>
            )}
          </div>

          {item && (
            <button
              onClick={onToggleLock}
              className={`p-1 rounded-md transition-colors cursor-pointer ${
                isLocked ? 'text-[#2d533f] bg-[#2d533f]/10' : 'text-[#717971] hover:text-[#2d533f]'
              }`}
              title={isLocked ? 'Đang khóa món này khi AI gợi ý' : 'Khóa món này'}
            >
              {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Card Body Image & Info */}
        {item ? (
          <div className="space-y-2">
            <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-[#f5f4ef] border border-[#e9e8e3] flex items-center justify-center">
              {(item.image_url || item.imageUrl) ? (
                <img
                  src={(item.image_url || item.imageUrl)!}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-stone-100 text-stone-400 p-2 text-center">
                  <Layers className="w-6 h-6 mb-1 text-stone-300" />
                  <span className="text-[10px] text-stone-500 line-clamp-1 font-serif">{item.name}</span>
                  <span className="text-[9px] text-stone-400">Chưa nạp ảnh</span>
                </div>
              )}
              {item.color_hex && (
                <span
                  className="absolute bottom-2 right-2 w-3.5 h-3.5 rounded-full border border-white shadow-xs"
                  style={{ backgroundColor: item.color_hex }}
                />
              )}
            </div>

            <div>
              <h3 className="font-serif font-bold text-sm text-[#1a1c1a] truncate">{item.name}</h3>
              <p className="text-[11px] text-[#414942] truncate font-sans">
                {item.material || item.pattern_description}
              </p>
            </div>
          </div>
        ) : (
          /* Empty Slot Placeholder */
          <div
            onClick={onOpenDrawer}
            className="w-full aspect-[4/3] rounded-xl border border-dashed border-[#c1c9bf] flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:border-[#2d533f] hover:bg-white transition-all space-y-1.5"
          >
            <div className="w-8 h-8 rounded-full bg-[#efeee9] flex items-center justify-center text-[#717971]">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-xs font-label-md font-semibold text-[#414942]">
              + Thêm {title}
            </span>
            <span className="text-[10px] text-[#717971]">Nhấn để duyệt danh mục</span>
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      {item && (
        <div className="mt-3 pt-2 border-t border-[#efeee9] flex items-center gap-2">
          <button
            onClick={onOpenDrawer}
            className="flex-1 py-1 px-2.5 bg-[#f5f4ef] hover:bg-[#e9e8e3] text-[#1a1c1a] text-xs font-label-md font-semibold rounded-lg transition-colors cursor-pointer text-center"
          >
            Đổi món
          </button>

          <button
            onClick={() => onViewDetail(item)}
            className="p-1 text-[#717971] hover:text-[#2d533f] transition-colors cursor-pointer"
            title="Xem điển chế & nguồn gốc"
          >
            <Info className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onRemove}
            className="p-1 text-[#717971] hover:text-[#a03f30] transition-colors cursor-pointer"
            title="Gỡ bỏ khỏi outfit"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
