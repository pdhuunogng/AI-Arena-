import React, { useState } from 'react';
import { useCostumeStore } from '../../store/useCostumeStore';
import { MannequinViewer } from '../mannequin/MannequinViewer';
import { CostumeSlot, CostumeItem } from '../../types/costume';
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
  Star,
  Check,
  Sliders,
  Layers,
  Eye,
  Box
} from 'lucide-react';

export const StylingStudio: React.FC = () => {
  const {
    outfit,
    setSlotItem,
    toggleLockSlot,
    isSlotLocked,
    clearOutfit,
    selectedSlotForWardrobe,
    setSelectedSlotForWardrobe,
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
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'manual' | 'ai'>('ai');
  const [viewMode, setViewMode] = useState<'flatlay' | '3d'>('flatlay');

  // All items in catalog
  const catalog = [...heritageItems, ...customClosetItems];

  // Preset context prompt suggestions
  const PRESET_PROMPTS = [
    {
      title: '🌾 Đám cưới mùa thu',
      prompt: 'Phối cho tôi một bộ đi dự đám cưới bạn mùa thu, tông màu nhã nhặn, chất liệu lụa sa, chuẩn nghi lễ trang trọng'
    },
    {
      title: '⛰️ Hội Gầu Tào Tây Bắc',
      prompt: 'Trang phục thiếu nữ H\'Mông đi trẩy hội mùa xuân, váy lanh xòe vẽ sáp ong và kiềng bạc nguyên bản'
    },
    {
      title: '☀️ Lễ hội Katê tháp Chăm',
      prompt: 'Trang phục nữ Chăm tham dự lễ hội Katê nắng tháp, áo trắng Aw Cam kết hợp thắt lưng dệt thổ cẩm Khaban rực rỡ'
    },
    {
      title: '🍃 Dạo phố giao thoa',
      prompt: 'Phối đồ dạo phố cuối tuần mang hơi thở cổ phong thanh lịch, giao thoa đương đại nhẹ nhàng'
    }
  ];

  // Mechanism 1: Trigger AI outfit completion based on unlocked slots
  const handleCompleteOutfit = async () => {
    try {
      setAiLoading(true);
      setAiError(null);

      const response = await fetch('/api/advisor/complete-outfit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentOutfit: outfit,
          lockedSlots: outfit.locked_slots,
          catalogItems: catalog,
          userGender: outfit.gender,
          occasionPrompt: promptText.trim() || 'Hoàn thiện trang phục hài hòa văn hóa'
        })
      });

      if (!response.ok) {
        throw new Error('Không thể kết nối đến cố vấn AI');
      }

      const data = await response.json();
      setAiAdvisoryResult(data);
      applyAiOutfit(data);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Lỗi khi gọi AI cố vấn');
    } finally {
      setAiLoading(false);
    }
  };

  // Mechanism 2: Free context-based prompt styling
  const handleFreePrompt = async (selectedPrompt?: string) => {
    const textToSend = selectedPrompt || promptText;
    if (!textToSend.trim()) return;

    try {
      setAiLoading(true);
      setAiError(null);
      if (selectedPrompt) setPromptText(selectedPrompt);

      const response = await fetch('/api/advisor/free-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          catalogItems: catalog,
          userGender: outfit.gender
        })
      });

      if (!response.ok) {
        throw new Error('Không thể phân tích ngữ cảnh phối đồ');
      }

      const data = await response.json();
      setAiAdvisoryResult(data);
      applyAiOutfit(data);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Lỗi khi gọi AI phân tích bối cảnh');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveLookbook = () => {
    saveCurrentToLookbook();
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 2500);
  };

  const scoreNum = parseInt(aiAdvisoryResult?.cultural_accuracy_score?.replace('%', '') || '96', 10);

  // Flat-lay items helper
  const topItem = outfit.slots.top;
  const bottomItem = outfit.slots.bottom;
  const footwearItem = outfit.slots.footwear;
  const headItem = outfit.slots.head || outfit.slots.accessories[0];

  return (
    <div className="relative min-h-screen bg-[#fbf9f4] text-[#1a1c1a] font-sans pb-16 selection:bg-[#CE6250]/15 selection:text-[#CE6250]">
      {/* Subtle Vietnamese Heritage Geometric Watermark */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.035] overflow-hidden">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="stitch-heritage-grid" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M50 0 L100 50 L50 100 L0 50 Z" fill="none" stroke="#2d533f" strokeWidth="1" />
              <circle cx="50" cy="50" r="16" fill="none" stroke="#caa749" strokeWidth="0.8" />
              <path d="M0 0 L100 100 M100 0 L0 100" stroke="#2d533f" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#stitch-heritage-grid)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* 1. Header Banner - TAB 2: ĐỎ CHU SA DI SẢN (VERMILION / TERRACOTTA) */}
        <div className="relative rounded-3xl overflow-hidden bg-[#CE6250] text-white p-6 sm:p-8 shadow-md border border-[#B84D3C]">
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="vent-brick-24" width="24" height="24" patternUnits="userSpaceOnUse">
                  <path d="M12 0 L24 12 L12 24 L0 12 Z" fill="none" stroke="#FFFFFF" strokeOpacity="0.3" strokeWidth="0.8"></path>
                  <circle cx="12" cy="12" fill="#FFFFFF" fillOpacity="0.3" r="1.5"></circle>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#vent-brick-24)"></rect>
            </svg>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#FFDAD4] font-mono">
                  STYLING STUDIO · DI SẢN CỐ ĐÔ
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-label-sm bg-black/20 text-[#FFFDF8] border border-white/20 font-semibold">
                  ✓ Chuẩn Mực Cố Đô · {scoreNum}% Chuẩn
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
                Bảng Phối Đồ Cổ Phong
              </h1>
              <p className="text-xs sm:text-sm text-stone-100 font-sans mt-0.5 max-w-xl">
                Phối kết ngũ thân, áo tấc cùng trang phục 54 dân tộc đương đại dưới sự trợ vấn của AI
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* View Mode Toggle (Flat-lay vs 3D) */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-black/20 border border-white/20 text-xs font-label-md">
                <button
                  onClick={() => setViewMode('flatlay')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'flatlay'
                      ? 'bg-white text-[#CE6250] font-bold shadow-xs'
                      : 'text-stone-100 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Flat-lay 2x2</span>
                </button>
                <button
                  onClick={() => setViewMode('3d')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === '3d'
                      ? 'bg-white text-[#CE6250] font-bold shadow-xs'
                      : 'text-stone-100 hover:text-white'
                  }`}
                >
                  <Box className="w-3.5 h-3.5" />
                  <span>Ma-nơ-canh 3D</span>
                </button>
              </div>

              {/* Gender Quick Toggle */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-black/20 border border-white/20 text-xs font-label-md">
                {(['nam', 'nu', 'nonbinary'] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                      outfit.gender === g
                        ? 'bg-[#D8B454] text-stone-900 font-bold'
                        : 'text-stone-100 hover:text-white'
                    }`}
                  >
                    {g === 'nam' ? 'Nam' : g === 'nu' ? 'Nữ' : 'Nonbinary'}
                  </button>
                ))}
              </div>

              {/* Action buttons */}
              <button
                onClick={clearOutfit}
                className="px-3.5 py-2 text-xs font-label-md text-white bg-white/15 hover:bg-white/25 rounded-xl transition-colors cursor-pointer border border-white/25 font-semibold"
              >
                + Làm mới
              </button>
              <button
                onClick={handleSaveLookbook}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-label-md font-bold text-stone-900 bg-[#D8B454] hover:bg-[#c9a33e] rounded-xl transition-all shadow-xs cursor-pointer"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{saveSuccessMsg ? 'Đã lưu!' : 'Lưu Lookbook'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. Pill Switcher Tabs & Heritage Constraint Badge */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-3 rounded-2xl bg-white border border-[#e9e8e3] shadow-xs">
          {/* Segmented Pill Tabs */}
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
                  ? 'bg-[#2d533f] text-white font-bold shadow-xs'
                  : 'text-[#414942] hover:text-[#2d533f]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#caa749]" />
              <span>AI hỗ trợ ✨</span>
            </button>
          </div>

          {/* Heritage Constraint Status Strip */}
          <div className="flex items-center gap-2.5 text-xs text-[#414942] px-3.5 py-2 rounded-xl bg-[#f5f4ef] border border-[#e9e8e3]">
            <ShieldCheck className="w-4 h-4 text-[#2d533f] shrink-0" />
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-label-md font-bold text-[#1a1c1a] uppercase text-[11px]">
                Chuẩn Mực Cố Đô:
              </span>
              <span className="text-[#2d533f] font-medium font-body-sm">
                Ràng buộc văn hóa: <strong className="text-[#1a1c1a]">Đang bật</strong> ✦ {outfit.slots.top?.ethnic_group || 'Kinh (Thời Nguyễn)'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-label-sm bg-[#2d533f] text-white font-bold">
                {aiAdvisoryResult?.cultural_accuracy_score || '96% Chuẩn'}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Main Body Grid: Showcase on Left (5 cols), Console / AI Advisor on Right (7 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Flat-lay 2x2 Grid OR 3D Mannequin */}
          <div className="lg:col-span-5 space-y-4">
            
            {viewMode === '3d' ? (
              /* 3D Mannequin Viewer */
              <div className="space-y-3">
                <MannequinViewer interactive={true} autoRotateDefault={false} />
                <div className="p-3 bg-white rounded-2xl border border-[#e9e8e3] text-center text-xs font-label-sm text-[#414942]">
                  Dáng ma-nơ-canh: <strong className="text-[#2d533f] capitalize">{outfit.gender}</strong> · Kéo chuột để xoay 360°
                </div>
              </div>
            ) : (
              /* Flat-lay Outfit Grid ("Bảng Phối Đồ Flat-lay") */
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#2d533f]" />
                    <h2 className="font-headline font-bold text-base sm:text-lg text-[#1a1c1a]">
                      Bảng Phối Đồ Flat-lay
                    </h2>
                  </div>
                  <span className="text-[11px] font-label-sm text-[#755b00] bg-[#caa749]/15 px-2.5 py-0.5 rounded-full border border-[#caa749]/30">
                    4 vị trí trang phục
                  </span>
                </div>

                {/* 2x2 Grid of modular outfit slots */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  
                  {/* Slot 1 (Top / Áo) */}
                  <div className="bg-white rounded-2xl border border-[#e9e8e3] p-3 hover:border-[#2d533f]/40 hover:shadow-xs transition-all flex flex-col justify-between group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-[#2d533f]/15 text-[#2d533f] flex items-center justify-center text-[10px] font-bold">1</span>
                        <span className="text-xs font-label-md font-bold uppercase tracking-wider text-[#2d533f]">Áo</span>
                      </div>
                      <button
                        onClick={() => toggleLockSlot('top')}
                        className={`p-1 rounded-md transition-colors ${isSlotLocked('top') ? 'text-[#2d533f] bg-[#2d533f]/10' : 'text-[#717971] hover:text-[#2d533f]'}`}
                        title={isSlotLocked('top') ? 'Đang khóa slot này' : 'Khóa slot này'}
                      >
                        {isSlotLocked('top') ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="relative w-full h-36 bg-[#f5f4ef] rounded-xl overflow-hidden mb-2.5 border border-[#e9e8e3]/80 flex items-center justify-center">
                      {topItem && topItem.image_url && topItem.image_url.trim() !== '' ? (
                        <img
                          src={topItem.image_url}
                          alt={topItem.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : topItem ? (
                        <div className="flex flex-col items-center justify-center p-3 text-center">
                          <span
                            className="w-8 h-8 rounded-full mb-1.5 border border-black/15 shadow-2xs block"
                            style={{ backgroundColor: topItem.color_hex || '#2d533f' }}
                          />
                          <span className="text-[11px] font-semibold text-[#1a1c1a] truncate max-w-[120px]">
                            {topItem.name}
                          </span>
                        </div>
                      ) : (
                        <div className="text-xs text-[#717971] italic font-body-sm">Chưa có áo</div>
                      )}
                      {topItem && (
                        <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-label-sm rounded-md">
                          {topItem.ethnic_group}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-headline font-bold text-xs text-[#1a1c1a] truncate">
                        {topItem ? topItem.name : 'Áo Giao Lĩnh'}
                      </h3>
                      <p className="text-[11px] text-[#414942] font-body-sm mb-2.5 truncate">
                        {topItem ? topItem.material : 'Lụa tơ tằm dệt thủ công'}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setActiveSubTab('manual');
                            setSelectedSlotForWardrobe(selectedSlotForWardrobe === 'top' ? null : 'top');
                          }}
                          className="flex-1 py-1.5 text-xs font-label-md font-semibold text-white bg-[#2d533f] hover:bg-[#456b56] rounded-xl transition-colors text-center shadow-2xs"
                        >
                          [Đổi món]
                        </button>
                        {topItem && (
                          <button
                            onClick={() => setSelectedItemForDetail(topItem)}
                            className="p-1.5 text-[#2d533f] bg-[#f5f4ef] hover:bg-[#efeee9] rounded-xl border border-[#e9e8e3] text-xs"
                            title="Ý nghĩa"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Slot 2 (Bottom / Quần - Váy) */}
                  <div className="bg-white rounded-2xl border border-[#e9e8e3] p-3 hover:border-[#2d533f]/40 hover:shadow-xs transition-all flex flex-col justify-between group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-[#2d533f]/15 text-[#2d533f] flex items-center justify-center text-[10px] font-bold">2</span>
                        <span className="text-xs font-label-md font-bold uppercase tracking-wider text-[#2d533f]">Quần / Váy</span>
                      </div>
                      <button
                        onClick={() => toggleLockSlot('bottom')}
                        className={`p-1 rounded-md transition-colors ${isSlotLocked('bottom') ? 'text-[#2d533f] bg-[#2d533f]/10' : 'text-[#717971] hover:text-[#2d533f]'}`}
                        title={isSlotLocked('bottom') ? 'Đang khóa slot này' : 'Khóa slot này'}
                      >
                        {isSlotLocked('bottom') ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="relative w-full h-36 bg-[#f5f4ef] rounded-xl overflow-hidden mb-2.5 border border-[#e9e8e3]/80 flex items-center justify-center">
                      {bottomItem && bottomItem.image_url && bottomItem.image_url.trim() !== '' ? (
                        <img
                          src={bottomItem.image_url}
                          alt={bottomItem.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : bottomItem ? (
                        <div className="flex flex-col items-center justify-center p-3 text-center">
                          <span
                            className="w-8 h-8 rounded-full mb-1.5 border border-black/15 shadow-2xs block"
                            style={{ backgroundColor: bottomItem.color_hex || '#2d533f' }}
                          />
                          <span className="text-[11px] font-semibold text-[#1a1c1a] truncate max-w-[120px]">
                            {bottomItem.name}
                          </span>
                        </div>
                      ) : (
                        <div className="text-xs text-[#717971] italic font-body-sm">Chưa có quần/váy</div>
                      )}
                      {bottomItem && (
                        <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-label-sm rounded-md">
                          {bottomItem.ethnic_group}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-headline font-bold text-xs text-[#1a1c1a] truncate">
                        {bottomItem ? bottomItem.name : 'Quần Lụa Hà Đông'}
                      </h3>
                      <p className="text-[11px] text-[#414942] font-body-sm mb-2.5 truncate">
                        {bottomItem ? bottomItem.material : 'Lụa trắng dệt trơn'}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setActiveSubTab('manual');
                            setSelectedSlotForWardrobe(selectedSlotForWardrobe === 'bottom' ? null : 'bottom');
                          }}
                          className="flex-1 py-1.5 text-xs font-label-md font-semibold text-white bg-[#2d533f] hover:bg-[#456b56] rounded-xl transition-colors text-center shadow-2xs"
                        >
                          [Đổi món]
                        </button>
                        {bottomItem && (
                          <button
                            onClick={() => setSelectedItemForDetail(bottomItem)}
                            className="p-1.5 text-[#2d533f] bg-[#f5f4ef] hover:bg-[#efeee9] rounded-xl border border-[#e9e8e3] text-xs"
                            title="Ý nghĩa"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Slot 3 (Footwear / Hài - Giày) */}
                  <div className="bg-white rounded-2xl border border-[#e9e8e3] p-3 hover:border-[#2d533f]/40 hover:shadow-xs transition-all flex flex-col justify-between group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-[#2d533f]/15 text-[#2d533f] flex items-center justify-center text-[10px] font-bold">3</span>
                        <span className="text-xs font-label-md font-bold uppercase tracking-wider text-[#2d533f]">Giày / Hài</span>
                      </div>
                      <button
                        onClick={() => toggleLockSlot('footwear')}
                        className={`p-1 rounded-md transition-colors ${isSlotLocked('footwear') ? 'text-[#2d533f] bg-[#2d533f]/10' : 'text-[#717971] hover:text-[#2d533f]'}`}
                        title={isSlotLocked('footwear') ? 'Đang khóa slot này' : 'Khóa slot này'}
                      >
                        {isSlotLocked('footwear') ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="relative w-full h-36 bg-[#f5f4ef] rounded-xl overflow-hidden mb-2.5 border border-[#e9e8e3]/80 flex items-center justify-center">
                      {footwearItem && footwearItem.image_url && footwearItem.image_url.trim() !== '' ? (
                        <img
                          src={footwearItem.image_url}
                          alt={footwearItem.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : footwearItem ? (
                        <div className="flex flex-col items-center justify-center p-3 text-center">
                          <span
                            className="w-8 h-8 rounded-full mb-1.5 border border-black/15 shadow-2xs block"
                            style={{ backgroundColor: footwearItem.color_hex || '#2d533f' }}
                          />
                          <span className="text-[11px] font-semibold text-[#1a1c1a] truncate max-w-[120px]">
                            {footwearItem.name}
                          </span>
                        </div>
                      ) : (
                        <div className="text-xs text-[#717971] italic font-body-sm">Chưa có hài</div>
                      )}
                      {footwearItem && (
                        <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-label-sm rounded-md">
                          {footwearItem.ethnic_group}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-headline font-bold text-xs text-[#1a1c1a] truncate">
                        {footwearItem ? footwearItem.name : 'Hài Cong Thêu Vân Mây'}
                      </h3>
                      <p className="text-[11px] text-[#414942] font-body-sm mb-2.5 truncate">
                        {footwearItem ? footwearItem.material : 'Nhung đen · Chỉ kim tuyến'}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setActiveSubTab('manual');
                            setSelectedSlotForWardrobe(selectedSlotForWardrobe === 'footwear' ? null : 'footwear');
                          }}
                          className="flex-1 py-1.5 text-xs font-label-md font-semibold text-white bg-[#2d533f] hover:bg-[#456b56] rounded-xl transition-colors text-center shadow-2xs"
                        >
                          [Đổi món]
                        </button>
                        {footwearItem && (
                          <button
                            onClick={() => setSelectedItemForDetail(footwearItem)}
                            className="p-1.5 text-[#2d533f] bg-[#f5f4ef] hover:bg-[#efeee9] rounded-xl border border-[#e9e8e3] text-xs"
                            title="Ý nghĩa"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Slot 4 (Head/Accessory / Khăn - Mũ / Phụ Kiện) */}
                  <div className="bg-white rounded-2xl border border-[#e9e8e3] p-3 hover:border-[#2d533f]/40 hover:shadow-xs transition-all flex flex-col justify-between group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-[#2d533f]/15 text-[#2d533f] flex items-center justify-center text-[10px] font-bold">4</span>
                        <span className="text-xs font-label-md font-bold uppercase tracking-wider text-[#2d533f]">Khăn & Phụ Kiện</span>
                      </div>
                      <button
                        onClick={() => toggleLockSlot('head')}
                        className={`p-1 rounded-md transition-colors ${isSlotLocked('head') ? 'text-[#2d533f] bg-[#2d533f]/10' : 'text-[#717971] hover:text-[#2d533f]'}`}
                        title={isSlotLocked('head') ? 'Đang khóa slot này' : 'Khóa slot này'}
                      >
                        {isSlotLocked('head') ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="relative w-full h-36 bg-[#f5f4ef] rounded-xl overflow-hidden mb-2.5 border border-[#e9e8e3]/80 flex items-center justify-center">
                      {headItem && headItem.image_url && headItem.image_url.trim() !== '' ? (
                        <img
                          src={headItem.image_url}
                          alt={headItem.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : headItem ? (
                        <div className="flex flex-col items-center justify-center p-3 text-center">
                          <span
                            className="w-8 h-8 rounded-full mb-1.5 border border-black/15 shadow-2xs block"
                            style={{ backgroundColor: headItem.color_hex || '#2d533f' }}
                          />
                          <span className="text-[11px] font-semibold text-[#1a1c1a] truncate max-w-[120px]">
                            {headItem.name}
                          </span>
                        </div>
                      ) : (
                        <div className="text-xs text-[#717971] italic font-body-sm">Chưa có khăn/phụ kiện</div>
                      )}
                      {headItem && (
                        <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-label-sm rounded-md">
                          {headItem.ethnic_group}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-headline font-bold text-xs text-[#1a1c1a] truncate">
                        {headItem ? headItem.name : 'Khăn Vấn & Kiềng Bạc'}
                      </h3>
                      <p className="text-[11px] text-[#414942] font-body-sm mb-2.5 truncate">
                        {headItem ? headItem.material : 'Bạc chạm lộng & Lụa sa'}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setActiveSubTab('manual');
                            setSelectedSlotForWardrobe(selectedSlotForWardrobe === 'head' ? null : 'head');
                          }}
                          className="flex-1 py-1.5 text-xs font-label-md font-semibold text-white bg-[#2d533f] hover:bg-[#456b56] rounded-xl transition-colors text-center shadow-2xs"
                        >
                          [Đổi món]
                        </button>
                        {headItem && (
                          <button
                            onClick={() => setSelectedItemForDetail(headItem)}
                            className="p-1.5 text-[#2d533f] bg-[#f5f4ef] hover:bg-[#efeee9] rounded-xl border border-[#e9e8e3] text-xs"
                            title="Ý nghĩa"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Quick Item Selection Drawer when [Đổi món] is clicked */}
            {selectedSlotForWardrobe && (
              <div className="p-4 rounded-2xl bg-white border border-[#e9e8e3] shadow-xs space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-[#efeee9]">
                  <span className="font-headline font-bold text-[#2d533f] text-sm">
                    Kho Di Sản: Chọn món thay thế cho vị trí [{selectedSlotForWardrobe.toUpperCase()}]
                  </span>
                  <button
                    onClick={() => setSelectedSlotForWardrobe(null)}
                    className="text-[#717971] hover:text-[#1a1c1a] text-xs font-label-md cursor-pointer"
                  >
                    Đóng [✕]
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-1">
                  {catalog
                    .filter((i) => i.slot === selectedSlotForWardrobe || (selectedSlotForWardrobe === 'head' && i.slot === 'accessories'))
                    .map((catItem) => {
                      const isEquipped =
                        selectedSlotForWardrobe === 'accessories'
                          ? outfit.slots.accessories.some((a) => a.id === catItem.id)
                          : outfit.slots[selectedSlotForWardrobe]?.id === catItem.id;

                      return (
                        <div
                          key={catItem.id}
                          onClick={() => {
                            setSlotItem(catItem.slot, catItem);
                            setSelectedSlotForWardrobe(null);
                          }}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                            isEquipped
                              ? 'bg-[#2d533f]/10 border-[#2d533f] text-[#2d533f] font-semibold'
                              : 'bg-[#f5f4ef] border-[#e9e8e3] hover:bg-[#efeee9] text-[#1a1c1a]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <span
                              className="w-3 h-3 rounded-full shrink-0 border border-black/10 shadow-2xs"
                              style={{ backgroundColor: catItem.color_hex }}
                            />
                            <div className="truncate">
                              <span className="font-bold block truncate">{catItem.name}</span>
                              <span className="text-[10px] text-[#717971] font-body-sm">{catItem.material}</span>
                            </div>
                          </div>
                          <span className="text-[10px] text-[#755b00] shrink-0 font-label-sm font-semibold ml-2">
                            {catItem.ethnic_group}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

          </div>

          {/* Right Column: AI Cultural Advisor Console (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* AI Advisor Card */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#e9e8e3] shadow-xs space-y-5">
              
              <div className="flex items-center justify-between pb-3 border-b border-[#efeee9]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#caa749]/20 text-[#755b00] flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-[#755b00]" />
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-base sm:text-lg text-[#1a1c1a]">
                      Ngữ Cảnh & Bản Sắc Phối Đồ
                    </h3>
                    <p className="text-xs text-[#414942] font-body-sm">
                      Giám định di sản đa triều đại & 54 dân tộc Việt Nam
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleCompleteOutfit}
                  disabled={isAiLoading}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2d533f] text-white text-xs font-label-md font-semibold hover:bg-[#456b56] transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <Wand2 className={`w-3.5 h-3.5 text-[#caa749] ${isAiLoading ? 'animate-spin' : ''}`} />
                  <span>AI Hoàn Thiện Set</span>
                </button>
              </div>

              {/* Preset Context Chips */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-label-sm text-[#717971] uppercase tracking-wider block">
                  Gợi ý bối cảnh thường nhật & lễ hội:
                </span>
                <div className="flex flex-wrap gap-2">
                  {PRESET_PROMPTS.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleFreePrompt(p.prompt)}
                      className="px-3 py-1.5 rounded-xl text-xs font-label-sm bg-[#f5f4ef] hover:bg-[#e9e8e3] text-[#1a1c1a] border border-[#e9e8e3] transition-colors cursor-pointer text-left"
                    >
                      {p.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Free Text Prompt Box */}
              <div className="space-y-2">
                <div className="relative">
                  <textarea
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    placeholder="Nhập yêu cầu: sự kiện, thời tiết, triều đại, chất liệu mong muốn hoặc cảm hứng văn hóa..."
                    rows={3}
                    className="w-full p-3.5 pr-28 rounded-2xl bg-[#fbf9f4] border border-[#e9e8e3] text-sm text-[#1a1c1a] placeholder:text-[#717971] focus:outline-hidden focus:border-[#2d533f] focus:ring-1 focus:ring-[#2d533f] transition-all resize-none font-body-sm"
                  />
                  <button
                    onClick={() => handleFreePrompt()}
                    disabled={isAiLoading || !promptText.trim()}
                    className="absolute bottom-3 right-3 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2d533f] text-white text-xs font-label-md font-semibold hover:bg-[#456b56] transition-all shadow-xs disabled:opacity-40 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Cố Vấn AI ✨</span>
                  </button>
                </div>
                
                <div className="flex items-center justify-between text-[11px] text-[#717971] font-body-sm">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2d533f]" />
                    Cam kết không phối chéo sắc tộc trái quy chuẩn
                  </span>
                  <span>Độ tin cậy: Tuyệt đối chống bịa đặt</span>
                </div>
              </div>

              {/* AI Loading State */}
              {isAiLoading && (
                <div className="p-6 rounded-2xl bg-[#f5f4ef] border border-[#e9e8e3] text-center space-y-2.5">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#2d533f] mx-auto" />
                  <p className="font-headline font-bold text-sm text-[#1a1c1a]">
                    Đang tra cứu thư tịch & giám định tương thích văn hóa...
                  </p>
                  <p className="text-xs text-[#414942] font-body-sm">
                    Kiểm tra Hard Constraints (chống phối chéo dân tộc, loại trừ đồ tế tự thế tục).
                  </p>
                </div>
              )}

              {/* AI Error Alert */}
              {aiError && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{aiError}</span>
                </div>
              )}

              {/* AI Advisory Result Card */}
              {aiAdvisoryResult && !isAiLoading && (
                <div className="pt-4 border-t border-[#efeee9] space-y-4 animate-in fade-in duration-200">
                  {/* Outfit Title & Accuracy Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#f5f4ef] border border-[#e9e8e3]">
                    <div>
                      <h4 className="font-headline font-bold text-lg text-[#1a1c1a]">
                        {aiAdvisoryResult.outfit_name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-[#414942] mt-0.5 font-body-sm">
                        <span className="font-semibold text-[#1a1c1a]">{aiAdvisoryResult.ethnic_group}</span>
                        <span>·</span>
                        <span className="px-2 py-0.5 rounded-full bg-white text-[#755b00] border border-[#e9e8e3] font-label-sm font-semibold">
                          {aiAdvisoryResult.style_type}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto bg-white px-3 py-1.5 rounded-xl border border-[#e9e8e3]">
                      <div className="text-right">
                        <span className="text-[10px] text-[#717971] uppercase tracking-wider block font-label-sm">
                          Độ Chuẩn Xác
                        </span>
                        <span className="font-headline font-extrabold text-base text-[#2d533f]">
                          {aiAdvisoryResult.cultural_accuracy_score}
                        </span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-[#2d533f]/15 text-[#2d533f]">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Warning Flags if any */}
                  {aiAdvisoryResult.warning_flags && aiAdvisoryResult.warning_flags.length > 0 && (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1 text-xs text-amber-900 font-body-sm">
                      <div className="font-bold flex items-center gap-2 text-amber-800">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>Lưu Ý Quy Cách Văn Hóa:</span>
                      </div>
                      {aiAdvisoryResult.warning_flags.map((warn, i) => (
                        <p key={i} className="pl-6 text-amber-800">
                          • {warn}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Overall Comment */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-label-md font-bold uppercase tracking-wider text-[#2d533f] block">
                      Nhận Xét Giám Định Tổng Thể:
                    </span>
                    <p className="text-xs sm:text-sm font-body-sm italic text-[#1a1c1a] leading-relaxed bg-[#fbf9f4] p-3.5 rounded-xl border border-[#e9e8e3]">
                      "{aiAdvisoryResult.overall_comment}"
                    </p>
                  </div>

                  {/* Cultural Notes Breakdown */}
                  <div className="space-y-2">
                    <span className="text-xs font-label-md font-bold uppercase tracking-wider text-[#2d533f] block">
                      Giám Định Hoa Văn & Tri Thức Chi Tiết:
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-body-sm">
                      {aiAdvisoryResult.slots.head && (
                        <div className="p-3 rounded-xl bg-[#f5f4ef] border border-[#e9e8e3] space-y-0.5">
                          <span className="font-bold text-[#1a1c1a] block">
                            Khăn/Mũ: {aiAdvisoryResult.slots.head.item_name}
                          </span>
                          <p className="text-[#414942] leading-relaxed line-clamp-3">
                            {aiAdvisoryResult.slots.head.cultural_notes}
                          </p>
                        </div>
                      )}

                      {aiAdvisoryResult.slots.top && (
                        <div className="p-3 rounded-xl bg-[#f5f4ef] border border-[#e9e8e3] space-y-0.5">
                          <span className="font-bold text-[#1a1c1a] block">
                            Áo: {aiAdvisoryResult.slots.top.item_name}
                          </span>
                          <p className="text-[#414942] leading-relaxed line-clamp-3">
                            {aiAdvisoryResult.slots.top.cultural_notes}
                          </p>
                        </div>
                      )}

                      {aiAdvisoryResult.slots.bottom && (
                        <div className="p-3 rounded-xl bg-[#f5f4ef] border border-[#e9e8e3] space-y-0.5">
                          <span className="font-bold text-[#1a1c1a] block">
                            Quần/Váy: {aiAdvisoryResult.slots.bottom.item_name}
                          </span>
                          <p className="text-[#414942] leading-relaxed line-clamp-3">
                            {aiAdvisoryResult.slots.bottom.cultural_notes}
                          </p>
                        </div>
                      )}

                      {aiAdvisoryResult.slots.footwear && (
                        <div className="p-3 rounded-xl bg-[#f5f4ef] border border-[#e9e8e3] space-y-0.5">
                          <span className="font-bold text-[#1a1c1a] block">
                            Hài/Giày: {aiAdvisoryResult.slots.footwear.item_name}
                          </span>
                          <p className="text-[#414942] leading-relaxed line-clamp-3">
                            {aiAdvisoryResult.slots.footwear.cultural_notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-[#efeee9] flex items-center justify-between gap-3">
                    <button
                      onClick={() => applyAiOutfit(aiAdvisoryResult)}
                      className="px-4 py-2.5 rounded-xl bg-[#2d533f] text-white text-xs font-label-md font-semibold hover:bg-[#456b56] transition-colors shadow-xs cursor-pointer flex items-center gap-2"
                    >
                      <Check className="w-3.5 h-3.5 text-[#caa749]" />
                      <span>Mặc set này lên ma-nơ-canh</span>
                    </button>
                    <button
                      onClick={handleSaveLookbook}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#a03f30] text-white text-xs font-label-md font-semibold hover:bg-[#863326] transition-colors shadow-xs cursor-pointer"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>Lưu vào Lookbook</span>
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
