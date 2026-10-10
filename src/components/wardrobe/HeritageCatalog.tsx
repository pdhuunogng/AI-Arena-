import React, { useState, useRef } from 'react';
import { useCostumeStore } from '../../store/useCostumeStore';
import { useAuthStore } from '../../store/useAuthStore';
import { CostumeItem, GarmentCategory } from '../../types/costume';
import {
  MOCK_COLLECTIONS,
  NORMALIZED_OUTFITS,
  NORMALIZED_SOURCES,
  NORMALIZED_REVIEW_FLAGS
} from '../../data/mockHeritageData';
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
  ArrowRight,
  BookOpen,
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
  Tag,
  HelpCircle
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

  // Main 5 Tabs
  const [mainTab, setMainTab] = useState<'items' | 'outfits' | 'reviewFlags' | 'sources' | 'closet'>('items');

  // Items tab filters
  const [selectedCategory, setSelectedCategory] = useState<GarmentCategory | 'all'>('all');
  const [selectedEthnic, setSelectedEthnic] = useState<string>('all');
  const [selectedSubgroup, setSelectedSubgroup] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedOutfitFilter, setSelectedOutfitFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Outfits tab filters
  const [outfitGroupFilter, setOutfitGroupFilter] = useState<string>('all');
  const [outfitSearchQuery, setOutfitSearchQuery] = useState('');

  // Review flags filter
  const [reviewStatusFilter, setReviewStatusFilter] = useState<string>('all');

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

  // Available categories in the 77 normalized items
  const CATEGORIES = Array.from(new Set(heritageItems.map((i) => i.category))).sort();

  // Distinct ethnic/cultural groups in normalized items
  const ETHNIC_GROUPS = Array.from(
    new Set(heritageItems.map((i) => i.ethnic_group || i.culturalGroup || '').filter(Boolean))
  ).sort();

  // Distinct subgroups in normalized items
  const SUBGROUPS = Array.from(
    new Set(heritageItems.map((i) => i.subgroup || '').filter(Boolean))
  ).sort();

  // Distinct verification statuses in normalized items
  const VERIFICATION_STATUSES = Array.from(
    new Set(heritageItems.map((i) => i.verificationStatus || i.verification_status || '').filter(Boolean))
  ).sort();

  // Filter curated heritage items
  const filteredHeritageItems = heritageItems.filter((item) => {
    const itemEthnic = item.ethnic_group || item.culturalGroup || '';
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (selectedEthnic !== 'all' && itemEthnic !== selectedEthnic) return false;
    if (selectedSubgroup !== 'all' && (item.subgroup || '') !== selectedSubgroup) return false;
    if (selectedStatus !== 'all') {
      const vStatus = item.verificationStatus || item.verification_status || '';
      if (!vStatus.includes(selectedStatus)) return false;
    }
    if (selectedOutfitFilter !== 'all') {
      const belongs = item.belongs_to_outfit_ids || [];
      if (!belongs.includes(selectedOutfitFilter)) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        item.id.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        itemEthnic.toLowerCase().includes(q) ||
        (item.subgroup && item.subgroup.toLowerCase().includes(q)) ||
        (item.material && item.material.toLowerCase().includes(q)) ||
        (item.pattern_description && item.pattern_description.toLowerCase().includes(q)) ||
        (item.cultural_significance && item.cultural_significance.toLowerCase().includes(q)) ||
        (item.notes && item.notes.toLowerCase().includes(q)) ||
        (item.tags && item.tags.some((t) => t.toLowerCase().includes(q)));
      if (!match) return false;
    }
    return true;
  });

  // Filter outfits
  const filteredOutfits = NORMALIZED_OUTFITS.filter((outfit) => {
    if (outfitGroupFilter !== 'all' && outfit.group !== outfitGroupFilter) return false;
    if (outfitSearchQuery.trim()) {
      const q = outfitSearchQuery.toLowerCase();
      const match =
        outfit.outfit_id.toLowerCase().includes(q) ||
        outfit.normalized_name.toLowerCase().includes(q) ||
        outfit.group.toLowerCase().includes(q) ||
        outfit.subgroup.toLowerCase().includes(q) ||
        outfit.history.toLowerCase().includes(q) ||
        outfit.usage.toLowerCase().includes(q) ||
        outfit.components.some((c) => c.item_name.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  // Filter review flags
  const filteredReviewFlags = NORMALIZED_REVIEW_FLAGS.filter((flag) => {
    if (reviewStatusFilter !== 'all' && flag.status !== reviewStatusFilter) return false;
    return true;
  });

  // Handle adding an individual garment into the outfit builder
  const handleEquipItem = (item: CostumeItem) => {
    const slot = item.slot;
    if (slot === 'ao') setSlotItem('ao', item);
    else if (slot === 'quan') setSlotItem('quan', item);
    else if (slot === 'vay') setSlotItem('vay', item);
    else if (slot === 'khan') setSlotItem('khan', item);
    else if (slot === 'mu') setSlotItem('mu', item);
    else if (slot === 'giay') setSlotItem('giay', item);
    else if (slot === 'trang_suc') setSlotItem('trang_suc', item);
    else setSlotItem('phu_kien', item);

    setActiveTab('studio');
  };

  // Helper for status badge styling
  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    const s = status.toLowerCase();
    if (s.includes('chưa xác minh') || s.includes('chưa tìm được')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-50 text-red-700 border border-red-200">
          <ShieldAlert className="w-3 h-3 text-red-600" />
          <span>Chưa xác minh độc lập</span>
        </span>
      );
    }
    if (s.includes('cần') || s.includes('một phần') || s.includes('chờ ảnh')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          <span className="truncate max-w-[200px]">{status}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        <span className="truncate max-w-[200px]">{status}</span>
      </span>
    );
  };

  // Handle selecting local image file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
      if (!uploadName) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setUploadName(cleanName);
      }
    };
    reader.readAsDataURL(file);
  };

  // Mock AI classification for personal uploads
  const handleAiClassifyImage = async () => {
    if (!uploadPreview) return;
    setIsClassifying(true);
    setTimeout(() => {
      setIsClassifying(false);
      setAiSuggestion({
        category: 'Áo',
        ethnicGroup: 'Việt phục',
        material: 'Lụa tơ tằm dệt trơn',
        colorHex: '#2D533F',
        confidence: '92%'
      });
      setUploadCategory('Áo');
      setUploadEthnicGroup('Việt phục');
      setUploadMaterial('Lụa tơ tằm dệt trơn');
      setUploadColorHex('#2D533F');
    }, 1000);
  };

  // Save personal garment
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
        success: 'Đã lưu thành công vào Tủ Đồ Cá Nhân!',
        isCloudSynced: res.isCloudSynced
      });

      setUploadFile(null);
      setUploadPreview(null);
      setUploadName('');
      setUploadNotes('');
      setUploadMaterial('');
      setAiSuggestion(null);

      setTimeout(() => {
        setMainTab('closet');
      }, 1000);
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
              VIỆT PHỤC REMIX · KHO TƯ LIỆU VĂN HÓA CHUẨN HÓA V2
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              Thư Viện Trang Phục & Tủ Đồ Di Sản
            </h1>
            <p className="text-xs sm:text-sm text-stone-100 max-w-2xl leading-relaxed">
              Dữ liệu chuẩn hóa gồm 77 món trang phục độc lập, 21 tổ hợp tham khảo, 83 liên kết thành phần, 168 quy tắc tương thích có phạm vi và 14 cờ thẩm định chuyên khảo.
            </p>
          </div>

          <button
            onClick={() => setMainTab('closet')}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#D8B454] hover:bg-[#c9a33e] text-stone-900 text-xs font-label-md font-bold shadow-md transition-all cursor-pointer shrink-0"
          >
            <Upload className="w-4 h-4" />
            <span>Thêm Đồ Cá Nhân Vào Tủ</span>
          </button>
        </div>
      </div>

      {/* 2. Main Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e9e8e3] pb-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setMainTab('items')}
            className={`px-4 py-2.5 rounded-xl font-label-md font-bold transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
              mainTab === 'items'
                ? 'bg-[#2D533F] text-white shadow-xs'
                : 'bg-white text-[#414942] hover:bg-[#f5f4ef] border border-[#e9e8e3]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Items (Món rời · {heritageItems.length})</span>
          </button>

          <button
            onClick={() => setMainTab('outfits')}
            className={`px-4 py-2.5 rounded-xl font-label-md font-bold transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
              mainTab === 'outfits'
                ? 'bg-[#2D533F] text-white shadow-xs'
                : 'bg-white text-[#414942] hover:bg-[#f5f4ef] border border-[#e9e8e3]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D8B454]" />
            <span>Outfits (Tổ hợp tham khảo · {NORMALIZED_OUTFITS.length})</span>
          </button>

          <button
            onClick={() => setMainTab('reviewFlags')}
            className={`px-4 py-2.5 rounded-xl font-label-md font-bold transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
              mainTab === 'reviewFlags'
                ? 'bg-[#2D533F] text-white shadow-xs'
                : 'bg-white text-[#414942] hover:bg-[#f5f4ef] border border-[#e9e8e3]'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span>Thẩm định & Rà soát ({NORMALIZED_REVIEW_FLAGS.length})</span>
          </button>

          <button
            onClick={() => setMainTab('sources')}
            className={`px-4 py-2.5 rounded-xl font-label-md font-bold transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
              mainTab === 'sources'
                ? 'bg-[#2D533F] text-white shadow-xs'
                : 'bg-white text-[#414942] hover:bg-[#f5f4ef] border border-[#e9e8e3]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            <span>Tư liệu nguồn ({NORMALIZED_SOURCES.length})</span>
          </button>

          <button
            onClick={() => setMainTab('closet')}
            className={`px-4 py-2.5 rounded-xl font-label-md font-bold transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
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
          {mainTab === 'items' && `${filteredHeritageItems.length} / ${heritageItems.length} món phù hợp`}
          {mainTab === 'outfits' && `${filteredOutfits.length} / ${NORMALIZED_OUTFITS.length} bộ tham chiếu`}
        </span>
      </div>

      {/* 3. TAB 1: ITEMS (77 MÓN RỜI CHUẨN HÓA) */}
      {mainTab === 'items' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="p-5 bg-white rounded-2xl border border-[#e9e8e3] space-y-4 shadow-xs">
            {/* Category pills */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-label-md font-bold uppercase tracking-wider text-[#1a1c1a]">
                  Phân Loại Trang Phục:
                </span>
                {selectedCategory !== 'all' && (
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="text-xs text-[#A03F30] hover:underline cursor-pointer"
                  >
                    Xem tất cả loại
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 rounded-xl font-label-md font-semibold shrink-0 cursor-pointer transition-all ${
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
                      onClick={() => setSelectedCategory(cat as GarmentCategory)}
                      className={`px-3 py-1.5 rounded-xl font-label-md font-semibold shrink-0 cursor-pointer transition-all ${
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
            </div>

            {/* Dropdown Filters & Search */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-[#efeee9]">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-[#717971]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo tên, ID, hoa văn..."
                  className="w-full bg-[#fbf9f4] border border-[#e9e8e3] rounded-xl pl-9 pr-3 py-2 text-xs text-[#1a1c1a] focus:outline-none focus:border-[#2D533F]"
                />
              </div>

              {/* Ethnic group */}
              <select
                value={selectedEthnic}
                onChange={(e) => setSelectedEthnic(e.target.value)}
                className="bg-[#fbf9f4] border border-[#e9e8e3] rounded-xl px-3 py-2 text-xs text-[#1a1c1a] focus:outline-none focus:border-[#2D533F]"
              >
                <option value="all">Tất cả dân tộc & triều đại</option>
                {ETHNIC_GROUPS.map((eth) => (
                  <option key={eth} value={eth}>
                    {eth}
                  </option>
                ))}
              </select>

              {/* Subgroup */}
              <select
                value={selectedSubgroup}
                onChange={(e) => setSelectedSubgroup(e.target.value)}
                className="bg-[#fbf9f4] border border-[#e9e8e3] rounded-xl px-3 py-2 text-xs text-[#1a1c1a] focus:outline-none focus:border-[#2D533F]"
              >
                <option value="all">Tất cả phân nhóm (Subgroup)</option>
                {SUBGROUPS.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>

              {/* Outfit filter */}
              <select
                value={selectedOutfitFilter}
                onChange={(e) => setSelectedOutfitFilter(e.target.value)}
                className="bg-[#fbf9f4] border border-[#e9e8e3] rounded-xl px-3 py-2 text-xs text-[#1a1c1a] focus:outline-none focus:border-[#2D533F]"
              >
                <option value="all">Tất cả bộ tham chiếu (Outfits)</option>
                {NORMALIZED_OUTFITS.map((o) => (
                  <option key={o.outfit_id} value={o.outfit_id}>
                    {o.normalized_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset button if active filters */}
            {(selectedCategory !== 'all' ||
              selectedEthnic !== 'all' ||
              selectedSubgroup !== 'all' ||
              selectedOutfitFilter !== 'all' ||
              searchQuery.trim()) && (
              <div className="pt-2 flex items-center justify-between text-xs border-t border-[#efeee9]">
                <span className="text-[#717971]">
                  Đang lọc {filteredHeritageItems.length} kết quả
                </span>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedEthnic('all');
                    setSelectedSubgroup('all');
                    setSelectedOutfitFilter('all');
                    setSearchQuery('');
                  }}
                  className="text-[#A03F30] font-semibold hover:underline cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Xóa tất cả bộ lọc</span>
                </button>
              </div>
            )}
          </div>

          {/* Garments Card Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredHeritageItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-[#e9e8e3] overflow-hidden hover:border-[#2D533F]/50 hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Image Frame with Neutral SVG Placeholder */}
                  <div className="relative aspect-[4/3] bg-[#FAF8F5] p-2 overflow-hidden flex items-center justify-center border-b border-[#efeee9]">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-contain rounded-2xl group-hover:scale-102 transition-transform duration-300"
                    />

                    {/* Top badging */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1 max-w-[85%]">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#2D533F] text-white">
                        {item.category}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/70 text-white font-medium">
                        {item.ethnic_group || item.culturalGroup}
                      </span>
                      {item.subgroup && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] bg-amber-800 text-white font-medium">
                          {item.subgroup}
                        </span>
                      )}
                    </div>

                    {/* Stable ID Badge */}
                    <div className="absolute bottom-3 left-3">
                      <span className="px-2 py-0.5 rounded-md bg-stone-900/80 text-[9px] font-mono text-stone-200">
                        {item.id}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-2.5">
                    <div>
                      <h3 className="font-serif font-bold text-base text-[#1a1c1a] group-hover:text-[#2D533F] transition-colors line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-xs text-[#414942] line-clamp-2 leading-relaxed mt-1">
                        {item.cultural_significance || item.culturalContext}
                      </p>
                    </div>

                    {/* Verification status */}
                    <div className="pt-1">
                      {getStatusBadge(item.verificationStatus || item.verification_status)}
                    </div>

                    {/* Belongs to outfit membership */}
                    {item.belongs_to_outfit_ids && item.belongs_to_outfit_ids.length > 0 && (
                      <div className="pt-1">
                        <span className="text-[10px] text-[#717971] block font-mono">
                          Tổ hợp: {item.belongs_to_outfit_ids.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 pt-0">
                  <div className="pt-3 border-t border-[#efeee9] flex items-center gap-2">
                    <button
                      onClick={() => handleEquipItem(item)}
                      className="flex-1 py-2 px-3 bg-[#2D533F] hover:bg-[#456b56] text-white text-xs font-label-md font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Phối vào Studio</span>
                    </button>

                    <button
                      onClick={() => setSelectedItemForDetail(item)}
                      className="p-2 rounded-xl border border-[#e9e8e3] text-[#717971] hover:text-[#1a1c1a] hover:bg-[#f5f4ef] transition-colors cursor-pointer"
                      title="Xem hồ sơ di sản chi tiết"
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

      {/* 4. TAB 2: OUTFITS (21 TỔ HỢP THAM KHẢO CHUẨN HÓA) */}
      {mainTab === 'outfits' && (
        <div className="space-y-6">
          {/* Outfits Filter Bar */}
          <div className="p-4 bg-white rounded-2xl border border-[#e9e8e3] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="relative flex-1 w-full sm:w-auto">
              <Search className="w-4 h-4 absolute left-3 top-3 text-[#717971]" />
              <input
                type="text"
                value={outfitSearchQuery}
                onChange={(e) => setOutfitSearchQuery(e.target.value)}
                placeholder="Tìm bộ tham chiếu theo tên, thời kỳ, dân tộc..."
                className="w-full bg-[#fbf9f4] border border-[#e9e8e3] rounded-xl pl-9 pr-3 py-2 text-xs text-[#1a1c1a] focus:outline-none focus:border-[#2D533F]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={outfitGroupFilter}
                onChange={(e) => setOutfitGroupFilter(e.target.value)}
                className="w-full sm:w-auto bg-[#fbf9f4] border border-[#e9e8e3] rounded-xl px-3 py-2 text-xs text-[#1a1c1a] focus:outline-none focus:border-[#2D533F]"
              >
                <option value="all">Tất cả nhóm trang phục ({NORMALIZED_OUTFITS.length})</option>
                {Array.from(new Set(NORMALIZED_OUTFITS.map((o) => o.group))).map((grp) => (
                  <option key={grp} value={grp}>
                    {grp}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Outfits List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredOutfits.map((outfit) => (
              <div
                key={outfit.outfit_id}
                className="bg-white rounded-3xl border border-[#e9e8e3] p-6 space-y-5 hover:shadow-xl transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#efeee9] pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#A03F30] uppercase">
                        {outfit.group} {outfit.subgroup && `· ${outfit.subgroup}`}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                        {outfit.outfit_id}
                      </span>
                    </div>
                    {getStatusBadge(outfit.status)}
                  </div>

                  {/* Title & History */}
                  <div>
                    <h3 className="text-xl font-serif font-bold text-[#1a1c1a]">
                      {outfit.normalized_name}
                    </h3>
                    <p className="text-xs text-[#414942] leading-relaxed mt-2">
                      {outfit.history}
                    </p>
                  </div>

                  {/* Cautions Alert */}
                  {outfit.cautions && (
                    <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-semibold text-amber-900 block">Lưu ý thẩm định:</span>
                        <p className="text-amber-800 leading-relaxed">{outfit.cautions}</p>
                      </div>
                    </div>
                  )}

                  {/* Components Breakdown */}
                  <div className="space-y-2 pt-1">
                    <span className="text-xs font-label-md font-bold uppercase tracking-wider text-[#1a1c1a] block">
                      Thành phần tổ hợp ({outfit.components.length} món):
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {outfit.components.map((comp) => {
                        const itemObj = heritageItems.find((i) => i.id === comp.item_id);
                        return (
                          <div
                            key={comp.item_id}
                            onClick={() => itemObj && setSelectedItemForDetail(itemObj)}
                            className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#e9e8e3] hover:border-[#2D533F] transition-colors cursor-pointer space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-serif font-bold text-xs text-[#1a1c1a] truncate">
                                {comp.item_name}
                              </span>
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#2D533F]/10 text-[#2D533F] font-semibold">
                                {comp.slot}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-[#717971]">
                              <span className="italic">{comp.role}</span>
                              {comp.alternative_group && (
                                <span className="text-amber-700 font-mono">
                                  alt: {comp.alternative_group}
                                </span>
                              )}
                            </div>
                            {comp.condition && (
                              <p className="text-[10px] text-stone-600 line-clamp-1 italic">
                                {comp.condition}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sources citation */}
                  {outfit.source_urls && outfit.source_urls.length > 0 && (
                    <div className="text-[10px] text-stone-500 pt-1">
                      <span>Nguồn tham chiếu: </span>
                      {outfit.source_urls.map((url, idx) => (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-700 hover:underline mr-2 inline-flex items-center gap-0.5"
                        >
                          <span>Tư liệu [{idx + 1}]</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action button */}
                <div className="pt-4 border-t border-[#efeee9]">
                  <button
                    onClick={() => {
                      loadCollection(outfit.outfit_id);
                      setActiveTab('studio');
                    }}
                    className="w-full py-3 px-4 bg-[#2D533F] hover:bg-[#456b56] text-white text-xs font-label-md font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Thử bộ phối này trong Studio</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. TAB 3: REVIEW FLAGS (14 CỜ RÀ SOÁT & THẨM ĐỊNH) */}
      {mainTab === 'reviewFlags' && (
        <div className="space-y-6">
          <div className="p-4 bg-white rounded-2xl border border-[#e9e8e3] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="space-y-0.5">
              <h3 className="font-serif font-bold text-base text-[#1a1c1a]">
                Danh Mục Cờ Thẩm Định & Rà Soát Học Thuật ({NORMALIZED_REVIEW_FLAGS.length} bản ghi)
              </h3>
              <p className="text-xs text-[#717971]">
                Ghi nhận các điểm cần nguồn bổ sung, phân biệt biến thể địa phương và ngăn chặn suy diễn tùy tiện.
              </p>
            </div>

            <select
              value={reviewStatusFilter}
              onChange={(e) => setReviewStatusFilter(e.target.value)}
              className="bg-[#fbf9f4] border border-[#e9e8e3] rounded-xl px-3 py-2 text-xs text-[#1a1c1a] focus:outline-none focus:border-[#2D533F]"
            >
              <option value="all">Tất cả trạng thái ({NORMALIZED_REVIEW_FLAGS.length})</option>
              {Array.from(new Set(NORMALIZED_REVIEW_FLAGS.map((f) => f.status))).map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredReviewFlags.map((flag) => (
              <div
                key={flag.id}
                className="bg-white rounded-2xl border border-[#e9e8e3] p-5 space-y-3 shadow-xs hover:border-[#2D533F]/40 transition-colors"
              >
                <div className="flex items-center justify-between border-b border-[#efeee9] pb-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                    {flag.id}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700">
                    {flag.status}
                  </span>
                </div>

                <h4 className="font-serif font-bold text-base text-[#1a1c1a]">
                  {flag.topic}
                </h4>

                <div className="space-y-1.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-red-50/60 border border-red-100 text-red-900 space-y-0.5">
                    <span className="font-semibold block text-[11px] uppercase tracking-wider text-red-800">
                      Vấn đề rà soát:
                    </span>
                    <p className="leading-relaxed">{flag.issue}</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 text-emerald-900 space-y-0.5">
                    <span className="font-semibold block text-[11px] uppercase tracking-wider text-emerald-800">
                      Hành động chuẩn hóa:
                    </span>
                    <p className="leading-relaxed">{flag.action}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. TAB 4: RESEARCH SOURCES (23 NGUỒN KHẢO CỨU) */}
      {mainTab === 'sources' && (
        <div className="space-y-6">
          <div className="p-4 bg-white rounded-2xl border border-[#e9e8e3] shadow-xs space-y-1">
            <h3 className="font-serif font-bold text-base text-[#1a1c1a]">
              Thư Mục Nguồn & Tư Liệu Khảo Cứu ({NORMALIZED_SOURCES.length} nguồn)
            </h3>
            <p className="text-xs text-[#717971]">
              Hệ thống thư viện tham chiếu trực tiếp từ Bảo tàng Lịch sử Quốc gia, Bảo tàng Phụ nữ Việt Nam, Đài Tiếng nói Việt Nam (VOV4) và các công trình chuyên khảo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {NORMALIZED_SOURCES.map((src) => (
              <div
                key={src.source_id}
                className="bg-white rounded-2xl border border-[#e9e8e3] p-5 space-y-3 shadow-xs flex flex-col justify-between hover:border-[#2D533F]/40 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                      {src.source_id}
                    </span>
                    <span className="text-[11px] font-semibold text-stone-600 truncate max-w-[180px]">
                      {src.publisher}
                    </span>
                  </div>

                  <h4 className="font-serif font-bold text-sm text-[#1a1c1a] leading-snug">
                    {src.title}
                  </h4>

                  <p className="text-xs text-[#414942] leading-relaxed bg-[#fbf9f4] p-2.5 rounded-xl border border-[#efeee9]">
                    <span className="font-semibold text-stone-700 block mb-0.5">Sử dụng cho:</span>
                    {src.use_for}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#efeee9]">
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Truy cập nguồn tài liệu</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. TAB 5: PERSONAL CLOSET & IN-APP UPLOAD */}
      {mainTab === 'closet' && (
        <div className="space-y-8">
          {/* Upload Form */}
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

                  {uploadPreview && (
                    <button
                      type="button"
                      disabled={isClassifying}
                      onClick={handleAiClassifyImage}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#2D533F] hover:bg-[#456b56] disabled:opacity-50 text-white text-xs font-label-md font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Wand2 className="w-4 h-4 text-[#D8B454]" />
                      <span>{isClassifying ? 'AI đang phân tích ảnh...' : 'AI phân loại & gợi ý'}</span>
                    </button>
                  )}
                </div>

                {/* Form fields (7 Cols) */}
                <div className="lg:col-span-7 space-y-4">
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
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-label-md font-bold text-[#1a1c1a]">
                        Dân tộc / Văn hóa
                      </label>
                      <input
                        type="text"
                        value={uploadEthnicGroup}
                        onChange={(e) => setUploadEthnicGroup(e.target.value)}
                        placeholder="Kinh, H'Mông, Chăm..."
                        className="w-full bg-[#fbf9f4] border border-[#e9e8e3] rounded-xl px-3 py-2 text-xs text-[#1a1c1a] focus:outline-none focus:border-[#2D533F]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-label-md font-bold text-[#1a1c1a]">
                        Chất liệu
                      </label>
                      <input
                        type="text"
                        value={uploadMaterial}
                        onChange={(e) => setUploadMaterial(e.target.value)}
                        placeholder="Lụa, tơ tằm, sa đoạn..."
                        className="w-full bg-[#fbf9f4] border border-[#e9e8e3] rounded-xl px-3 py-2 text-xs text-[#1a1c1a] focus:outline-none focus:border-[#2D533F]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-label-md font-bold text-[#1a1c1a]">
                        Mã màu đại diện
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={uploadColorHex}
                          onChange={(e) => setUploadColorHex(e.target.value)}
                          className="w-9 h-9 rounded-lg border border-[#e9e8e3] cursor-pointer"
                        />
                        <input
                          type="text"
                          value={uploadColorHex}
                          onChange={(e) => setUploadColorHex(e.target.value)}
                          className="w-full bg-[#fbf9f4] border border-[#e9e8e3] rounded-xl px-3 py-2 text-xs text-[#1a1c1a] font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-label-md font-bold text-[#1a1c1a]">
                      Ghi chú cá nhân
                    </label>
                    <textarea
                      rows={2}
                      value={uploadNotes}
                      onChange={(e) => setUploadNotes(e.target.value)}
                      placeholder="Ý nghĩa, hoàn cảnh xuất xứ hoặc kỷ niệm..."
                      className="w-full bg-[#fbf9f4] border border-[#e9e8e3] rounded-xl px-3 py-2 text-xs text-[#1a1c1a] focus:outline-none focus:border-[#2D533F]"
                    />
                  </div>

                  {uploadStatus.error && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                      {uploadStatus.error}
                    </div>
                  )}

                  {uploadStatus.success && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold">
                      {uploadStatus.success}
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={uploadStatus.loading}
                      className="w-full py-3 px-6 rounded-xl bg-[#2D533F] hover:bg-[#456b56] disabled:opacity-50 text-white text-xs font-label-md font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{uploadStatus.loading ? 'Đang lưu trữ...' : 'Lưu Vào Tủ Đồ Cá Nhân'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* User's custom items grid */}
          <div className="space-y-4">
            <h3 className="text-lg font-serif font-bold text-[#1a1c1a]">
              Món Đồ Cá Nhân Của Bạn ({customClosetItems.length})
            </h3>

            {customClosetItems.length === 0 ? (
              <div className="p-8 rounded-3xl bg-white border border-[#e9e8e3] text-center space-y-2">
                <p className="text-xs sm:text-sm text-[#717971]">
                  Bạn chưa thêm món đồ cá nhân nào vào tủ. Hãy tải lên ảnh món đồ của bạn ở biểu mẫu phía trên!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {customClosetItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-3xl border border-[#e9e8e3] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#A03F30] text-white">
                          Cá nhân · {item.category}
                        </span>
                      </div>

                      <div className="p-4 space-y-1">
                        <h4 className="font-serif font-bold text-sm text-[#1a1c1a]">
                          {item.name}
                        </h4>
                        <p className="text-xs text-[#717971] line-clamp-2">
                          {item.notes || item.material || 'Đồ cá nhân tự tải lên'}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 pt-0">
                      <div className="pt-2 border-t border-[#efeee9] flex items-center gap-2">
                        <button
                          onClick={() => handleEquipItem(item)}
                          className="flex-1 py-1.5 px-3 bg-[#2D533F] hover:bg-[#456b56] text-white text-xs font-label-md font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Phối</span>
                        </button>

                        <button
                          onClick={() => deletePersonalGarmentItem(item.id, user?.uid)}
                          className="p-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Xóa món đồ này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
