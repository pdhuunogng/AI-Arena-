import React, { useState, useRef } from 'react';
import { useCostumeStore } from '../../store/useCostumeStore';
import { useAuthStore } from '../../store/useAuthStore';
import { CostumeItem, GarmentCategory } from '../../types/costume';
import { MOCK_COLLECTIONS } from '../../data/mockHeritageData';
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
  Trash2,
  Wand2,
  AlertTriangle,
  FolderOpen,
  CloudCheck,
  HardDrive,
  ArrowRight
} from 'lucide-react';

export const HeritageCatalog: React.FC = () => {
  const {
    heritageItems,
    customClosetItems,
    addPersonalGarment,
    deletePersonalGarmentItem,
    setSlotItem,
    setSelectedItemForDetail,
    loadCollection,
    setActiveTab,
    isClosetLoading
  } = useCostumeStore();

  const { user } = useAuthStore();

  // Main 3 Tabs requested: Items | Outfits | Collection + Personal Closet
  const [mainTab, setMainTab] = useState<'items' | 'outfits' | 'collections' | 'closet'>('items');

  // Items tab category filter (Áo, Quần, Váy, Khăn, Mũ, Giày, Trang sức, Phụ kiện)
  const [selectedCategory, setSelectedCategory] = useState<GarmentCategory | 'all'>('all');
  const [selectedEthnic, setSelectedEthnic] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Personal Upload Form State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadName, setUploadName] = useState('');
  const [uploadCategory, setUploadCategory] = useState<GarmentCategory>('Áo');
  const [uploadColorHex, setUploadColorHex] = useState('#456B56');
  const [uploadEthnicGroup, setUploadEthnicGroup] = useState('Chưa xác minh');
  const [uploadMaterial, setUploadMaterial] = useState('');
  const [uploadNotes, setUploadNotes] = useState('');
  const [isClassifying, setIsClassifying] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<any | null>(null);
  const [uploadStatus, setUploadStatus] = useState<{
    loading: boolean;
    error?: string;
    success?: string;
    isCloudSynced?: boolean;
  }>({ loading: false });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Available categories
  const CATEGORIES: GarmentCategory[] = [
    'Áo',
    'Quần',
    'Váy',
    'Khăn',
    'Mũ',
    'Giày',
    'Trang sức',
    'Phụ kiện'
  ];

  // Distinct ethnic groups
  const ETHNIC_GROUPS = Array.from(new Set(heritageItems.map((i) => i.ethnic_group)));

  // Filter curated heritage items
  const filteredHeritageItems = heritageItems.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (selectedEthnic !== 'all' && item.ethnic_group !== selectedEthnic) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        item.name.toLowerCase().includes(q) ||
        item.ethnic_group.toLowerCase().includes(q) ||
        item.material.toLowerCase().includes(q) ||
        item.pattern_description.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Handle adding an individual garment into the outfit builder
  const handleEquipItem = (item: CostumeItem) => {
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

  // Handle selecting local image file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type & size
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!validMimes.includes(file.type)) {
      setUploadStatus({
        loading: false,
        error: 'Chỉ hỗ trợ tệp ảnh PNG, JPG hoặc WEBP.'
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadStatus({
        loading: false,
        error: `Tệp quá lớn (${(file.size / (1024 * 1024)).toFixed(1)}MB). Giới hạn tối đa là 5MB.`
      });
      return;
    }

    setUploadFile(file);
    setUploadStatus({ loading: false });

    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      setUploadPreview(b64);
      // Auto-populate default name from filename
      if (!uploadName) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setUploadName(cleanName);
      }
    };
    reader.readAsDataURL(file);
  };

  // AI Classification with actual image
  const handleAiClassifyImage = async () => {
    if (!uploadPreview) return;
    setIsClassifying(true);
    setUploadStatus({ loading: false });

    try {
      const res = await fetch('/api/advisor/classify-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: `${uploadName} ${uploadNotes}`,
          itemCategory: uploadCategory,
          base64Image: uploadPreview
        })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAiSuggestion(data);

      // Pre-fill user confirmation fields
      if (data.predicted_category) setUploadCategory(data.predicted_category);
      if (data.color_hex) setUploadColorHex(data.color_hex);
      if (data.predicted_ethnic_group) setUploadEthnicGroup(data.predicted_ethnic_group);
      if (data.material && !uploadMaterial) setUploadMaterial(data.material);
    } catch (err: any) {
      console.error('AI classification error:', err);
      setUploadStatus({
        loading: false,
        error: 'Cố vấn AI phân loại ảnh không khả dụng. Bạn có thể tự điền thông tin bên dưới.'
      });
    } finally {
      setIsClassifying(false);
    }
  };

  // Submit save to personal closet
  const handleSaveToPersonalCloset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadName.trim()) {
      setUploadStatus({ loading: false, error: 'Vui lòng nhập tên trang phục.' });
      return;
    }
    if (!uploadFile && !uploadPreview) {
      setUploadStatus({ loading: false, error: 'Vui lòng chọn hoặc tải lên tệp ảnh.' });
      return;
    }

    setUploadStatus({ loading: true });

    try {
      const res = await addPersonalGarment({
        file: uploadFile,
        base64Preview: uploadPreview || undefined,
        name: uploadName,
        category: uploadCategory,
        colorHex: uploadColorHex,
        ethnicGroup: uploadEthnicGroup,
        material: uploadMaterial,
        notes: uploadNotes,
        userUid: user?.uid
      });

      if (!res.success) {
        setUploadStatus({
          loading: false,
          error: res.error || 'Lưu thất bại. Vui lòng thử lại.'
        });
        return;
      }

      setUploadStatus({
        loading: false,
        success: res.isCloudSynced
          ? 'Đã lưu thành công vào Tủ Đồ Cá Nhân (Đã đồng bộ Cloud)!'
          : 'Đã lưu vào Tủ Đồ Cá Nhân (Lưu trữ cục bộ bền vững trên thiết bị)!',
        isCloudSynced: res.isCloudSynced
      });

      // Reset form
      setUploadFile(null);
      setUploadPreview(null);
      setUploadName('');
      setUploadNotes('');
      setUploadMaterial('');
      setAiSuggestion(null);

      // Auto switch to closet tab to inspect
      setTimeout(() => {
        setMainTab('closet');
      }, 1200);
    } catch (err: any) {
      setUploadStatus({
        loading: false,
        error: `Lỗi: ${err?.message || 'Không thể lưu trang phục'}`
      });
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* 1. Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-[#2D533F] text-white p-6 sm:p-8 shadow-xl border border-[#234131]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-[#D8B454] uppercase font-bold tracking-widest">
              VIỆT PHỤC REMIX · KHO TƯ LIỆU VĂN HÓA
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              Thư Viện Trang Phục & Tủ Đồ Di Sản
            </h1>
            <p className="text-xs sm:text-sm text-stone-100 max-w-xl">
              Nguồn tư liệu chuẩn mực của 54 dân tộc và triều đại Việt Nam, kết hợp cùng Tủ đồ cá nhân của bạn
            </p>
          </div>

          {/* Quick upload trigger CTA */}
          <button
            onClick={() => setMainTab('closet')}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#D8B454] hover:bg-[#c9a33e] text-stone-900 text-xs font-label-md font-bold shadow-md transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Thêm Đồ Cá Nhân Vào Tủ</span>
          </button>
        </div>
      </div>

      {/* 2. Main 3 Tabs: Items | Outfits | Collection + Personal Closet */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e9e8e3] pb-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setMainTab('items')}
            className={`px-4 py-2 rounded-xl font-label-md font-bold transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
              mainTab === 'items'
                ? 'bg-[#2D533F] text-white shadow-xs'
                : 'bg-white text-[#414942] hover:bg-[#f5f4ef] border border-[#e9e8e3]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Items (Các món rời · {heritageItems.length})</span>
          </button>

          <button
            onClick={() => setMainTab('outfits')}
            className={`px-4 py-2 rounded-xl font-label-md font-bold transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
              mainTab === 'outfits'
                ? 'bg-[#2D533F] text-white shadow-xs'
                : 'bg-white text-[#414942] hover:bg-[#f5f4ef] border border-[#e9e8e3]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D8B454]" />
            <span>Outfits (Bộ phối tiêu biểu)</span>
          </button>

          <button
            onClick={() => setMainTab('collections')}
            className={`px-4 py-2 rounded-xl font-label-md font-bold transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
              mainTab === 'collections'
                ? 'bg-[#2D533F] text-white shadow-xs'
                : 'bg-white text-[#414942] hover:bg-[#f5f4ef] border border-[#e9e8e3]'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Collection (Bộ sưu tập · {MOCK_COLLECTIONS.length})</span>
          </button>

          <button
            onClick={() => setMainTab('closet')}
            className={`px-4 py-2 rounded-xl font-label-md font-bold transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
              mainTab === 'closet'
                ? 'bg-[#A03F30] text-white shadow-xs'
                : 'bg-white text-[#A03F30] hover:bg-[#f5f4ef] border border-[#e9e8e3]'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Tủ Đồ Cá Nhân ({customClosetItems.length})</span>
          </button>
        </div>

        <span className="text-xs text-[#717971] font-mono shrink-0">
          {mainTab === 'items' && `${filteredHeritageItems.length} món phù hợp bộ lọc`}
        </span>
      </div>

      {/* 3. TAB CONTENT */}

      {/* --- TAB 1: ITEMS (CÁC MÓN RỜI THEO 8 DANH MỤC) --- */}
      {mainTab === 'items' && (
        <div className="space-y-6">
          {/* Sub-Category Filter Bar (8 Categories: Áo, Quần, Váy, Khăn, Mũ, Giày, Trang sức, Phụ kiện) */}
          <div className="p-4 bg-white rounded-2xl border border-[#e9e8e3] space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-label-md font-bold uppercase tracking-wider text-[#1a1c1a]">
                Phân Loại Trang Phục & Phụ Kiện:
              </span>
              {selectedCategory !== 'all' && (
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="text-xs text-[#A03F30] hover:underline"
                >
                  Xóa lọc phân loại
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3.5 py-1.5 rounded-xl font-label-md font-semibold shrink-0 cursor-pointer transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-[#2D533F] text-white shadow-xs'
                    : 'bg-[#f5f4ef] text-[#414942] hover:bg-[#e9e8e3]'
                }`}
              >
                Tất cả ({heritageItems.length})
              </button>

              {CATEGORIES.map((cat) => {
                const count = heritageItems.filter((i) => i.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl font-label-md font-semibold shrink-0 cursor-pointer transition-all ${
                      selectedCategory === cat
                        ? 'bg-[#2D533F] text-white shadow-xs'
                        : 'bg-[#f5f4ef] text-[#414942] hover:bg-[#e9e8e3]'
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>

            {/* Filter Bar: Ethnic Group & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1 border-t border-[#efeee9]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-[#717971]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm theo tên áo, hoa văn, sa đoạn, bạc, lanh..."
                  className="w-full bg-[#fbf9f4] border border-[#e9e8e3] rounded-xl pl-9 pr-3 py-2 text-xs text-[#1a1c1a] focus:outline-none focus:border-[#2D533F]"
                />
              </div>

              <select
                value={selectedEthnic}
                onChange={(e) => setSelectedEthnic(e.target.value)}
                className="bg-[#fbf9f4] border border-[#e9e8e3] rounded-xl px-3 py-2 text-xs text-[#1a1c1a] focus:outline-none focus:border-[#2D533F]"
              >
                <option value="all">Tất cả dân tộc & triều đại</option>
                {ETHNIC_GROUPS.map((eth) => (
                  <option key={eth} value={eth}>
                    Dân tộc {eth}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Garments Card Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredHeritageItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-[#e9e8e3] overflow-hidden hover:border-[#2D533F]/50 hover:shadow-lg transition-all flex flex-col group"
              >
                {/* Image Frame */}
                <div className="relative aspect-[4/3] bg-[#f5f4ef] p-3 overflow-hidden flex items-center justify-center">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-label-sm font-bold bg-[#2D533F] text-white">
                      {item.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-label-sm bg-black/60 text-white font-semibold">
                      {item.ethnic_group}
                    </span>
                  </div>

                  {item.color_hex && (
                    <span
                      className="absolute top-4 right-4 w-4 h-4 rounded-full border-2 border-white shadow-xs"
                      style={{ backgroundColor: item.color_hex }}
                      title={`Mã màu: ${item.color_hex}`}
                    />
                  )}
                </div>

                {/* Info & Metadata */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-[#717971]">
                      <span className="truncate">{item.period_or_region}</span>
                      <span className="font-mono text-[#755b00] font-semibold text-[10px]">
                        {item.cross_cultural_flag ? 'Giao thoa' : 'Nguyên bản'}
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-sm sm:text-base text-[#1a1c1a] group-hover:text-[#2D533F] transition-colors line-clamp-1">
                      {item.name}
                    </h3>

                    <p className="text-xs text-[#414942] line-clamp-2 leading-relaxed font-sans">
                      {item.pattern_description || item.cultural_significance}
                    </p>
                  </div>

                  {/* Verification Notice */}
                  <div className="pt-2 border-t border-[#efeee9] text-[10px] text-[#717971] flex items-center justify-between">
                    <span className="truncate max-w-[180px]">
                      Nguồn: {item.source_verification}
                    </span>
                    {item.ritual_level === 'sacred_ritual' && (
                      <span className="text-[#a03f30] font-bold">Tế tự</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-1 flex items-center gap-2">
                    <button
                      onClick={() => handleEquipItem(item)}
                      className="flex-1 py-1.5 px-3 bg-[#2D533F] hover:bg-[#456b56] text-white text-xs font-label-md font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Phối vào Studio</span>
                    </button>

                    <button
                      onClick={() => setSelectedItemForDetail(item)}
                      className="p-1.5 rounded-xl border border-[#e9e8e3] text-[#717971] hover:text-[#1a1c1a] hover:bg-[#f5f4ef] transition-colors cursor-pointer"
                      title="Xem chi tiết di sản"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 2: OUTFITS (BỘ PHỐI TIÊU BIỂU) --- */}
      {mainTab === 'outfits' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MOCK_COLLECTIONS.map((col) => {
            const top = heritageItems.find((i) => i.id === col.sample_outfit.top_id);
            const bottom = heritageItems.find((i) => i.id === col.sample_outfit.bottom_id);
            const head = heritageItems.find((i) => i.id === col.sample_outfit.head_id);
            const foot = heritageItems.find((i) => i.id === col.sample_outfit.footwear_id);

            return (
              <div
                key={col.id}
                className="bg-white rounded-3xl border border-[#e9e8e3] p-6 space-y-4 hover:shadow-xl transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#A03F30] uppercase">
                      {col.period_or_ethnic}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#f5f4ef] text-[#717971] font-semibold">
                      Bộ phối chuẩn mực
                    </span>
                  </div>

                  <h3 className="text-xl font-serif font-bold text-[#1a1c1a]">{col.title}</h3>
                  <p className="text-xs sm:text-sm text-[#414942] leading-relaxed">
                    {col.description}
                  </p>

                  {/* Outfit Garment Previews */}
                  <div className="grid grid-cols-4 gap-2.5 pt-2">
                    {[head, top, bottom, foot].filter(Boolean).map((g) => (
                      <div
                        key={g!.id}
                        onClick={() => setSelectedItemForDetail(g!)}
                        className="rounded-xl overflow-hidden aspect-square bg-[#f5f4ef] border border-[#e9e8e3] relative group cursor-pointer"
                      >
                        <img
                          src={g!.image_url}
                          alt={g!.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute bottom-1 inset-x-1 text-[9px] text-white bg-black/70 rounded px-1 py-0.5 truncate text-center">
                          {g!.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#efeee9] flex items-center justify-between">
                  <button
                    onClick={() => {
                      loadCollection(col.id);
                      setActiveTab('studio');
                    }}
                    className="w-full py-2.5 px-4 bg-[#2D533F] hover:bg-[#456b56] text-white text-xs font-label-md font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Thử Bộ Phối Này Trong Studio</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- TAB 3: COLLECTIONS (BỘ SƯU TẬP VĂN HÓA) --- */}
      {mainTab === 'collections' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MOCK_COLLECTIONS.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-3xl border border-[#e9e8e3] overflow-hidden hover:shadow-xl transition-all flex flex-col group"
              >
                {c.cover_image && (
                  <div className="relative aspect-[16/9] overflow-hidden bg-stone-900">
                    <img
                      src={c.cover_image}
                      alt={c.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#D8B454]">
                        {c.period_or_ethnic}
                      </span>
                      <h3 className="text-xl font-serif font-bold">{c.title}</h3>
                      <p className="text-xs text-stone-200 italic">{c.subtitle}</p>
                    </div>
                  </div>
                )}

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-xs sm:text-sm text-[#414942] leading-relaxed">
                    {c.description}
                  </p>

                  <button
                    onClick={() => {
                      loadCollection(c.id);
                      setActiveTab('studio');
                    }}
                    className="w-full py-2.5 bg-[#D8B454] hover:bg-[#c9a33e] text-stone-900 text-xs font-label-md font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Mở Bộ Sưu Tập Trong Studio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 4: PERSONAL CLOSET & IN-APP UPLOAD (TỦ ĐỒ CÁ NHÂN BẢO LƯU) --- */}
      {mainTab === 'closet' && (
        <div className="space-y-8">
          {/* Section A: Upload New Item Form */}
          <div className="bg-white rounded-3xl border border-[#e9e8e3] p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-[#efeee9] pb-4">
              <span className="text-[11px] font-mono text-[#A03F30] font-bold uppercase tracking-wider">
                BẢN QUYỀN & TỦ ĐỒ RIÊNG
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1a1c1a] mt-0.5">
                Thêm Trang Phục Vào Tủ Đồ Cá Nhân
              </h2>
              <p className="text-xs sm:text-sm text-[#414942] font-sans mt-0.5">
                Tải lên hình ảnh trang phục của bạn. Dữ liệu được lưu trữ an toàn, hỗ trợ AI nhận diện phân loại tự động.
              </p>
            </div>

            <form onSubmit={handleSaveToPersonalCloset} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Image Upload Dropzone (5 Cols) */}
                <div className="lg:col-span-5 space-y-3">
                  <label className="text-xs font-label-md font-bold text-[#1a1c1a] block">
                    Hình ảnh trang phục *
                  </label>

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative w-full aspect-square rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-4 text-center cursor-pointer ${
                      uploadPreview
                        ? 'border-[#2D533F] bg-[#f5f4ef]'
                        : 'border-[#c1c9bf] bg-[#fbf9f4] hover:border-[#2D533F] hover:bg-white'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {uploadPreview ? (
                      <div className="relative w-full h-full">
                        <img
                          src={uploadPreview}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-xl"
                        />
                        <span className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-black/70 text-white text-[10px] font-sans">
                          Nhấn để đổi ảnh khác
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-12 h-12 rounded-full bg-[#efeee9] text-[#717971] flex items-center justify-center mx-auto">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-label-md font-semibold text-[#1a1c1a]">
                          Nhấn hoặc kéo thả tệp ảnh vào đây
                        </p>
                        <p className="text-[10px] text-[#717971]">
                          Hỗ trợ PNG, JPG, WEBP (Tối đa 5MB)
                        </p>
                      </div>
                    )}
                  </div>

                  {/* AI Vision Classification Trigger */}
                  {uploadPreview && (
                    <button
                      type="button"
                      disabled={isClassifying}
                      onClick={handleAiClassifyImage}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#2D533F] hover:bg-[#456b56] disabled:opacity-50 text-white text-xs font-label-md font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Wand2 className="w-4 h-4 text-[#D8B454]" />
                      <span>{isClassifying ? 'AI đang phân tích ảnh...' : 'AI phân loại & giám định ảnh'}</span>
                    </button>
                  )}
                </div>

                {/* Metadata Fields & User Confirmation (7 Cols) */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Name field */}
                  <div className="space-y-1">
                    <label className="text-xs font-label-md font-bold text-[#1a1c1a]">
                      Tên trang phục / món đồ *
                    </label>
                    <input
                      type="text"
                      required
                      value={uploadName}
                      onChange={(e) => setUploadName(e.target.value)}
                      placeholder="Ví dụ: Áo ngũ thân tay chẽn lụa tơ, Chân váy lanh..."
                      className="w-full bg-[#fbf9f4] border border-[#e9e8e3] rounded-xl px-3.5 py-2 text-xs text-[#1a1c1a] focus:outline-none focus:border-[#2D533F]"
                    />
                  </div>

                  {/* Category Selector (8 categories) */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-label-md font-bold text-[#1a1c1a]">
                        Phân loại *
                      </label>
                      <select
                        value={uploadCategory}
                        onChange={(e) => setUploadCategory(e.target.value as GarmentCategory)}
                        className="w-full bg-[#fbf9f4] border border-[#e9e8e3] rounded-xl px-3 py-2 text-xs text-[#1a1c1a] focus:outline-none focus:border-[#2D533F]"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-label-md font-bold text-[#1a1c1a]">
                        Màu sắc chủ đạo
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={uploadColorHex}
                          onChange={(e) => setUploadColorHex(e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer border border-[#e9e8e3] p-0.5 bg-white"
                        />
                        <input
                          type="text"
                          value={uploadColorHex}
                          onChange={(e) => setUploadColorHex(e.target.value)}
                          className="flex-1 bg-[#fbf9f4] border border-[#e9e8e3] rounded-xl px-3 py-1.5 text-xs font-mono text-[#1a1c1a]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Cultural group & Material */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-label-md font-bold text-[#1a1c1a]">
                        Dân tộc / Phong cách
                      </label>
                      <input
                        type="text"
                        value={uploadEthnicGroup}
                        onChange={(e) => setUploadEthnicGroup(e.target.value)}
                        placeholder="Kinh, H'Mông, Đương đại..."
                        className="w-full bg-[#fbf9f4] border border-[#e9e8e3] rounded-xl px-3 py-2 text-xs text-[#1a1c1a] focus:outline-none focus:border-[#2D533F]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-label-md font-bold text-[#1a1c1a]">
                        Chất liệu
                      </label>
                      <input
                        type="text"
                        value={uploadMaterial}
                        onChange={(e) => setUploadMaterial(e.target.value)}
                        placeholder="Lụa, tơ tằm, lanh, đũi..."
                        className="w-full bg-[#fbf9f4] border border-[#e9e8e3] rounded-xl px-3 py-2 text-xs text-[#1a1c1a] focus:outline-none focus:border-[#2D533F]"
                      />
                    </div>
                  </div>

                  {/* Notes / Pattern description */}
                  <div className="space-y-1">
                    <label className="text-xs font-label-md font-bold text-[#1a1c1a]">
                      Ghi chú / Mô tả hoa văn
                    </label>
                    <textarea
                      rows={2}
                      value={uploadNotes}
                      onChange={(e) => setUploadNotes(e.target.value)}
                      placeholder="Mô tả phom dáng, họa tiết hoặc kỷ niệm gắn liền..."
                      className="w-full bg-[#fbf9f4] border border-[#e9e8e3] rounded-xl p-3 text-xs text-[#1a1c1a] focus:outline-none focus:border-[#2D533F]"
                    />
                  </div>

                  {/* AI Suggestion Box */}
                  {aiSuggestion && (
                    <div className="p-3.5 rounded-2xl bg-[#caa749]/15 border border-[#caa749]/40 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-label-md font-bold text-[#755b00] flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Gợi ý giám định từ AI:</span>
                        </span>
                        <span className="text-[10px] text-[#717971]">Vui lòng xác nhận hoặc sửa lại</span>
                      </div>
                      <p className="text-[#414942]">
                        <strong>Phom dáng:</strong> {aiSuggestion.silhouette} · <strong>Chất liệu:</strong> {aiSuggestion.material}
                      </p>
                      <p className="text-[#414942] italic">
                        {aiSuggestion.cultural_compatibility}
                      </p>
                    </div>
                  )}

                  {/* Status Banner */}
                  {uploadStatus.error && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{uploadStatus.error}</span>
                    </div>
                  )}

                  {uploadStatus.success && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{uploadStatus.success}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={uploadStatus.loading}
                      className="w-full py-3 px-6 bg-[#A03F30] hover:bg-[#863528] disabled:opacity-50 text-white font-label-md font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{uploadStatus.loading ? 'Đang lưu trữ...' : 'Lưu Vào Tủ Đồ Cá Nhân'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Section B: Personal Garments Gallery */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#1a1c1a]">
                  Các Món Trong Tủ Đồ Cá Nhân Của Bạn
                </h3>
                <p className="text-xs text-[#717971]">
                  Các món này được lưu giữ riêng tư và luôn sẵn sàng để phối đồ trong Studio
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#f5f4ef] text-[#414942]">
                {customClosetItems.length} món đã lưu
              </span>
            </div>

            {customClosetItems.length === 0 ? (
              <div className="py-12 bg-white rounded-3xl border border-dashed border-[#c1c9bf] text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-[#f5f4ef] text-[#717971] flex items-center justify-center mx-auto">
                  <FolderOpen className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-[#1a1c1a]">Tủ đồ cá nhân đang trống</h4>
                <p className="text-xs text-[#717971] max-w-sm mx-auto">
                  Hãy dùng biểu mẫu phía trên để tải lên hình ảnh áo dài, chân váy hoặc phụ kiện của bạn.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {customClosetItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-3xl border border-[#e9e8e3] overflow-hidden hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="relative aspect-[4/3] bg-[#f5f4ef] p-3 overflow-hidden flex items-center justify-center">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-4 left-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#A03F30] text-white">
                          {item.category}
                        </span>
                        {item.color_hex && (
                          <span
                            className="absolute top-4 right-4 w-4 h-4 rounded-full border-2 border-white shadow-xs"
                            style={{ backgroundColor: item.color_hex }}
                          />
                        )}
                      </div>

                      <div className="p-4 space-y-2">
                        <h4 className="font-serif font-bold text-sm text-[#1a1c1a] truncate">
                          {item.name}
                        </h4>
                        <p className="text-xs text-[#414942] line-clamp-2">
                          {item.pattern_description || item.material}
                        </p>
                        <div className="text-[10px] text-[#717971] flex items-center justify-between pt-1">
                          <span>Dân tộc: {item.ethnic_group}</span>
                          <span className="font-mono text-[#D8B454]">Cá nhân</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 pt-0 border-t border-[#efeee9] flex items-center gap-2">
                      <button
                        onClick={() => handleEquipItem(item)}
                        className="flex-1 py-1.5 px-3 bg-[#2D533F] hover:bg-[#456b56] text-white text-xs font-label-md font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Phối đồ</span>
                      </button>

                      <button
                        onClick={() => deletePersonalGarmentItem(item.id, user?.uid)}
                        className="p-1.5 rounded-xl border border-[#e9e8e3] text-[#717971] hover:text-[#A03F30] hover:bg-red-50 transition-colors cursor-pointer"
                        title="Xóa khỏi tủ đồ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
