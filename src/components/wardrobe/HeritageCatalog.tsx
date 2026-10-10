import React, { useState, useRef } from 'react';
import { useCostumeStore } from '../../store/useCostumeStore';
import { CostumeItem, CostumeSlot } from '../../types/costume';
import {
  Search,
  Filter,
  Sparkles,
  Upload,
  CheckCircle2,
  Info,
  Layers,
  Image as ImageIcon,
  RotateCcw,
  Plus,
  Eye,
  Scissors
} from 'lucide-react';

export const HeritageCatalog: React.FC = () => {
  const {
    heritageItems,
    customClosetItems,
    addCustomItem,
    outfit,
    setSlotItem,
    selectedSlotForWardrobe,
    setSelectedSlotForWardrobe,
    setSelectedItemForDetail,
    filters,
    setFilter,
    resetFilters,
    setActiveTab
  } = useCostumeStore();

  const [activeCatalogTab, setActiveCatalogTab] = useState<'archive' | 'custom'>('archive');

  // Custom upload state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState<CostumeSlot>('top');
  const [itemDescription, setItemDescription] = useState('');
  const [isClassifying, setIsClassifying] = useState(false);
  const [classifiedData, setClassifiedData] = useState<any | null>(null);
  const [isCutoutApplied, setIsCutoutApplied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter items
  const allArchiveItems = [...heritageItems, ...customClosetItems];

  const filteredItems = allArchiveItems.filter((item) => {
    // Selected slot drawer filter from mannequin click
    if (selectedSlotForWardrobe && selectedSlotForWardrobe !== 'accessories' && item.slot !== selectedSlotForWardrobe) {
      return false;
    }

    if (filters.slot !== 'all' && item.slot !== filters.slot) return false;
    if (filters.ethnicGroup !== 'all' && item.ethnic_group !== filters.ethnicGroup) return false;
    if (filters.region !== 'all' && !item.period_or_region.includes(filters.region)) return false;
    if (filters.ritualLevel !== 'all' && item.ritual_level !== filters.ritualLevel) return false;

    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const match =
        item.name.toLowerCase().includes(q) ||
        item.ethnic_group.toLowerCase().includes(q) ||
        item.material.toLowerCase().includes(q) ||
        item.pattern_description.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  const handleEquip = (item: CostumeItem) => {
    setSlotItem(item.slot, item);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string);
      setIsCutoutApplied(false);
      setClassifiedData(null);
    };
    reader.readAsDataURL(file);
  };

  const handleClassifyAI = async () => {
    if (!uploadedImage && !itemDescription) return;

    try {
      setIsClassifying(true);
      const res = await fetch('/api/advisor/classify-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: itemDescription || itemName || 'Trang phục hoa văn dệt',
          itemCategory,
          base64Image: uploadedImage
        })
      });

      const data = await res.json();
      setClassifiedData(data);
      if (data.predicted_slot) {
        setItemCategory(data.predicted_slot);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsClassifying(false);
    }
  };

  const handleSaveCustomItem = () => {
    if (!itemName.trim()) return;

    const newItem: CostumeItem = {
      id: `custom-${Date.now()}`,
      name: itemName,
      slot: itemCategory,
      ethnic_group: classifiedData?.predicted_ethnic_group || 'Kinh',
      period_or_region: 'Kho Cá Nhân · Đương Đại',
      ritual_level: 'daily',
      cross_cultural_flag: classifiedData?.cross_cultural_recommended ?? true,
      color_hex: '#2C3E50',
      material: classifiedData?.material || 'Vải tự do',
      pattern_description: itemDescription || 'Hoa văn trang trí cá nhân',
      cultural_significance:
        classifiedData?.cultural_compatibility || 'Món đồ cá nhân sẵn sàng phối cùng cổ phục truyền thống.',
      source_verification: 'Tải lên bởi người dùng AI ARENA 2026',
      image_url: uploadedImage || 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80'
    };

    addCustomItem(newItem);
    // Equip immediately
    setSlotItem(newItem.slot, newItem);

    // Reset form
    setItemName('');
    setItemDescription('');
    setUploadedImage(null);
    setClassifiedData(null);
    setActiveCatalogTab('archive');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Banner - TAB 3: XANH LAM CHÀM THỦY BA (ROYAL INDIGO) */}
      <div className="relative rounded-3xl overflow-hidden bg-[#1E3B5C] text-[#FFFDF8] p-6 sm:p-8 shadow-md border border-[#142940] mb-6">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="indigo-lattice" width="28" height="28" patternUnits="userSpaceOnUse">
                <rect width="28" height="28" fill="none" stroke="#FFFDF8" strokeWidth="0.8" strokeOpacity="0.25"></rect>
                <circle cx="14" cy="14" r="5" fill="none" stroke="#FFFDF8" strokeWidth="0.8" strokeOpacity="0.25"></circle>
                <path d="M0 14 H28 M14 0 V28" stroke="#FFFDF8" strokeWidth="0.5" strokeOpacity="0.25"></path>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#indigo-lattice)"></rect>
          </svg>
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#A2C7E5] font-mono">
              MÀN HÌNH 3 · KHO TÀNG BÁCH PHỤC
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
              Tủ Đồ & Kho Di Sản 54 Dân Tộc
            </h1>
            <p className="text-xs sm:text-sm text-stone-200 font-sans mt-0.5">
              Bách khoa toàn thư cổ phục, chất liệu dệt thổ cẩm và kho đồ cá nhân bóc tách AI
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-black/25 backdrop-blur-md rounded-2xl border border-white/15">
            <button
              onClick={() => setActiveCatalogTab('archive')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                activeCatalogTab === 'archive'
                  ? 'bg-white text-[#1E3B5C] shadow-sm font-bold'
                  : 'text-stone-200 hover:text-white'
              }`}
            >
              Kho Di Sản ({allArchiveItems.length})
            </button>
            <button
              onClick={() => setActiveCatalogTab('custom')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                activeCatalogTab === 'custom'
                  ? 'bg-[#D8B454] text-stone-900 shadow-sm font-bold'
                  : 'text-stone-200 hover:text-white'
              }`}
            >
              + Kho Cá Nhân (Bóc Tách AI)
            </button>
          </div>
        </div>
      </div>

      {activeCatalogTab === 'archive' ? (
        /* --- TAB 1: KHO CỔ PHỤC & 54 DÂN TỘC --- */
        <div className="space-y-6">
          {/* Slot Drawer Banner if triggered from mannequin */}
          {selectedSlotForWardrobe && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-between text-xs text-amber-900">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  Đang lọc trang phục cho bộ phận: <strong>{selectedSlotForWardrobe.toUpperCase()}</strong>
                </span>
              </div>
              <button
                onClick={() => setSelectedSlotForWardrobe(null)}
                className="font-medium underline hover:text-amber-950 cursor-pointer"
              >
                Hiện tất cả bộ phận
              </button>
            </div>
          )}

          {/* Multi-criteria Filter Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Search */}
              <div className="relative lg:col-span-2">
                <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                <input
                  type="text"
                  value={filters.searchQuery}
                  onChange={(e) => setFilter('searchQuery', e.target.value)}
                  placeholder="Tìm theo tên áo, hoa văn, chất liệu..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-[#1E3B5C]/20 focus:border-[#1E3B5C]"
                />
              </div>

              {/* Ethnic group */}
              <div>
                <select
                  value={filters.ethnicGroup}
                  onChange={(e) => setFilter('ethnicGroup', e.target.value)}
                  className="w-full p-2 text-xs rounded-xl bg-stone-50 border border-stone-200 text-stone-800 focus:outline-hidden"
                >
                  <option value="all">Tất cả dân tộc</option>
                  <option value="Kinh">Dân tộc Kinh (Cổ phục)</option>
                  <option value="H'Mông">Dân tộc H'Mông</option>
                  <option value="Chăm">Dân tộc Chăm</option>
                  <option value="Dao">Dân tộc Dao Đỏ</option>
                </select>
              </div>

              {/* Slot */}
              <div>
                <select
                  value={filters.slot}
                  onChange={(e) => setFilter('slot', e.target.value)}
                  className="w-full p-2 text-xs rounded-xl bg-stone-50 border border-stone-200 text-stone-800 focus:outline-hidden"
                >
                  <option value="all">Tất cả bộ phận</option>
                  <option value="head">Khăn / Mũ</option>
                  <option value="top">Áo</option>
                  <option value="bottom">Quần / Váy</option>
                  <option value="footwear">Hài / Guốc</option>
                  <option value="accessories">Phụ kiện & Trang sức</option>
                </select>
              </div>

              {/* Ritual level */}
              <div>
                <select
                  value={filters.ritualLevel}
                  onChange={(e) => setFilter('ritualLevel', e.target.value)}
                  className="w-full p-2 text-xs rounded-xl bg-stone-50 border border-stone-200 text-stone-800 focus:outline-hidden"
                >
                  <option value="all">Mức độ nghi lễ</option>
                  <option value="daily">Thường phục</option>
                  <option value="festive">Lễ phục / Lễ hội</option>
                  <option value="sacred_ritual">Tế tự thiêng liêng</option>
                </select>
              </div>
            </div>

            {/* Active filter counter & reset */}
            <div className="flex items-center justify-between text-xs text-stone-500 pt-1 border-t border-stone-100">
              <span>
                Tìm thấy <strong>{filteredItems.length}</strong> hiện vật trang phục
              </span>
              <button
                onClick={resetFilters}
                className="text-stone-500 hover:text-stone-900 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Đặt lại bộ lọc</span>
              </button>
            </div>
          </div>

          {/* Grid of Heritage Items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((item) => {
              const isEquipped =
                item.slot === 'accessories'
                  ? outfit.slots.accessories.some((a) => a.id === item.id)
                  : outfit.slots[item.slot]?.id === item.id;

              return (
                <div
                  key={item.id}
                  className="group relative flex flex-col justify-between p-5 rounded-2xl bg-white border border-stone-200 hover:border-stone-300 hover:shadow-md transition-all duration-200"
                >
                  <div>
                    {/* Top Meta info */}
                    <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                      <span className="font-serif italic">{item.ethnic_group}</span>
                      <span className="text-[11px] uppercase tracking-wider">{item.slot}</span>
                    </div>

                    {/* Item Name */}
                    <h3 className="font-headline font-bold text-base text-stone-900 group-hover:text-[#1E3B5C] transition-colors line-clamp-1 mb-2">
                      {item.name}
                    </h3>

                    {/* Visual Color Swatch & Material */}
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="w-5 h-5 rounded-full border border-stone-300 shrink-0 shadow-2xs"
                        style={{ backgroundColor: item.color_hex }}
                      />
                      <span className="text-xs text-stone-600 truncate">{item.material}</span>
                    </div>

                    {/* Pattern snippet */}
                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-4">
                      {item.pattern_description}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedItemForDetail(item)}
                      className="flex items-center gap-1 text-xs text-stone-600 hover:text-stone-900 font-medium transition-colors cursor-pointer"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>Chi tiết di sản</span>
                    </button>

                    <button
                      onClick={() => handleEquip(item)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                        isEquipped
                          ? 'bg-[#1E3B5C] text-white'
                          : 'bg-stone-100 hover:bg-[#1E3B5C] hover:text-white text-stone-800'
                      }`}
                    >
                      {isEquipped ? 'Đang mặc' : 'Mặc lên'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* --- TAB 2: KHO CÁ NHÂN & AI BÓC TÁCH GIÁM ĐỊNH --- */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form (7 Cols) */}
          <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-5">
            <div>
              <h2 className="font-serif font-bold text-lg text-stone-900">
                Tải Lên Món Đồ Cá Nhân & Dự Đoán Phom Dáng AI
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Tải ảnh áo dài, khăn, phụ kiện của bạn để AI phân loại phom dáng và đề xuất phong cách cổ phong tương thích.
              </p>
            </div>

            {/* Upload Drag & Drop Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-stone-300 hover:border-stone-400 p-8 rounded-2xl text-center bg-stone-50/60 cursor-pointer transition-colors space-y-3"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Upload className="w-8 h-8 text-stone-400 mx-auto" />
              <div className="text-xs text-stone-600">
                <span className="font-semibold text-stone-900">Nhấp để chọn ảnh</span> hoặc kéo thả vào đây
              </div>
              <span className="text-[11px] text-stone-400 block">Hỗ trợ JPG, PNG, WEBP</span>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-stone-700 block mb-1">Tên món đồ</label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="Ví dụ: Áo lụa tơ tằm thêu tay"
                  className="w-full p-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-stone-700 block mb-1">Phân loại bộ phận</label>
                <select
                  value={itemCategory}
                  onChange={(e) => setItemCategory(e.target.value as CostumeSlot)}
                  className="w-full p-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200 text-stone-800"
                >
                  <option value="top">Áo (Top)</option>
                  <option value="head">Khăn / Mũ (Head)</option>
                  <option value="bottom">Quần / Váy (Bottom)</option>
                  <option value="footwear">Hài / Guốc (Footwear)</option>
                  <option value="accessories">Phụ kiện (Accessories)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-stone-700 block mb-1">Mô tả chi tiết / Hoa văn</label>
              <textarea
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
                placeholder="Mô tả chất liệu, hoa văn hoặc nguồn gốc (ví dụ: Áo lụa đỏ họa tiết mây ngũ sắc mua tại Hội An)..."
                rows={3}
                className="w-full p-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleClassifyAI}
                disabled={isClassifying || (!uploadedImage && !itemDescription)}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium rounded-xl bg-stone-900 text-white hover:bg-stone-800 disabled:opacity-50 transition-all cursor-pointer"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isClassifying ? 'animate-spin' : ''}`} />
                <span>{isClassifying ? 'Đang giám định...' : 'AI Giám Định & Dự Đoán'}</span>
              </button>

              <button
                onClick={handleSaveCustomItem}
                disabled={!itemName.trim()}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium rounded-xl bg-[#1E3B5C] text-white hover:bg-[#142940] disabled:opacity-50 transition-all cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Lưu & Mặc Lên Ma-nơ-canh</span>
              </button>
            </div>
          </div>

          {/* Right Preview & AI Cutout Simulation (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-4">
              <h3 className="font-serif font-bold text-sm text-stone-800">
                Mô Phỏng Bóc Tách Nền & Giám Định
              </h3>

              {uploadedImage && uploadedImage.trim() !== '' ? (
                <div className="relative aspect-square rounded-xl overflow-hidden bg-stone-100 flex items-center justify-center border border-stone-200">
                  <img
                    src={uploadedImage}
                    alt="Uploaded item"
                    className={`max-h-full max-w-full object-contain transition-all ${
                      isCutoutApplied ? 'filter drop-shadow-2xl scale-95' : ''
                    }`}
                  />
                  <button
                    onClick={() => setIsCutoutApplied(!isCutoutApplied)}
                    className="absolute bottom-3 right-3 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-md text-white text-[11px] hover:bg-black transition-colors cursor-pointer"
                  >
                    <Scissors className="w-3 h-3" />
                    <span>{isCutoutApplied ? 'Bản gốc' : 'Mô phỏng Bóc nền'}</span>
                  </button>
                </div>
              ) : (
                <div className="aspect-square rounded-xl bg-stone-50 border border-stone-200 flex flex-col items-center justify-center text-stone-400 text-xs p-6 text-center">
                  <ImageIcon className="w-10 h-10 mb-2 stroke-1" />
                  <span>Chưa tải ảnh món đồ cá nhân</span>
                </div>
              )}

              {/* AI Prediction Result Box */}
              {classifiedData && (
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
                  <div className="font-serif font-semibold text-stone-900 flex items-center justify-between">
                    <span>Kết Quả Giám Định AI</span>
                    <span className="text-emerald-700 font-sans font-medium text-[11px]">
                      Khả năng tương thích cao
                    </span>
                  </div>
                  <div className="text-stone-600 space-y-1">
                    <p>
                      • Dân tộc / Triều đại gợi ý: <strong>{classifiedData.predicted_ethnic_group}</strong>
                    </p>
                    <p>
                      • Phom dáng dự đoán: <strong>{classifiedData.silhouette}</strong>
                    </p>
                    <p>
                      • Gợi ý kết hợp: <em>{classifiedData.cultural_compatibility}</em>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
