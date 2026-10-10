import React, { useRef, useState } from 'react';
import { useCostumeStore } from '../../store/useCostumeStore';
import { useAuthStore } from '../../store/useAuthStore';
import { LookbookRecord } from '../../types/costume';
import {
  Download,
  Share2,
  Bookmark,
  Trash2,
  User,
  ShieldCheck,
  Mail,
  LogOut,
  Edit3,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export const AccountView: React.FC = () => {
  const {
    setGender,
    savedLookbooks,
    deleteLookbook,
    setSlotItem,
    setActiveTab
  } = useCostumeStore();

  const { user, logout, setAuthModalOpen } = useAuthStore();

  // Lookbook export/active state
  const [activeLookbookId, setActiveLookbookId] = useState<string | null>(
    savedLookbooks[0]?.id || null
  );
  const [isExporting, setIsExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [shareNotice, setShareNotice] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleApplySavedOutfit = (record: LookbookRecord) => {
    setGender(record.gender);
    setSlotItem('head', record.slots.head);
    setSlotItem('top', record.slots.top);
    setSlotItem('bottom', record.slots.bottom);
    setSlotItem('footwear', record.slots.footwear);
    setSlotItem('accessories', null);
    record.slots.accessories.forEach((acc) => setSlotItem('accessories', acc));
    setActiveTab('studio');
  };

  // High-res Canvas Download
  const handleDownloadCard = (record: LookbookRecord) => {
    setIsExporting(true);
    const canvas = canvasRef.current;
    if (!canvas) {
      setIsExporting(false);
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsExporting(false);
      return;
    }

    canvas.width = 800;
    canvas.height = 1150;

    // Papyrus Background
    ctx.fillStyle = '#F7F5F0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#EFE9DE';
    ctx.fillRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Ornate Border
    ctx.strokeStyle = '#2d533f';
    ctx.lineWidth = 3;
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

    ctx.strokeStyle = '#caa749';
    ctx.lineWidth = 1;
    ctx.strokeRect(38, 38, canvas.width - 76, canvas.height - 76);

    const drawCorner = (x: number, y: number) => {
      ctx.fillStyle = '#2d533f';
      ctx.fillRect(x - 5, y - 5, 10, 10);
    };
    drawCorner(38, 38);
    drawCorner(canvas.width - 38, 38);
    drawCorner(38, canvas.height - 38);
    drawCorner(canvas.width - 38, canvas.height - 38);

    // Header
    ctx.fillStyle = '#6E6152';
    ctx.font = '14px serif';
    ctx.textAlign = 'center';
    ctx.fillText('AI ARENA 2026 · THẺ BỘ SƯU TẬP DI SẢN CÁ NHÂN', canvas.width / 2, 75);

    ctx.fillStyle = '#2d533f';
    ctx.font = 'bold 34px serif';
    ctx.fillText('VIỆT CỔ Y PHONG AI', canvas.width / 2, 120);

    // Separator
    ctx.strokeStyle = '#D1C7B7';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(180, 140);
    ctx.lineTo(canvas.width - 180, 140);
    ctx.stroke();

    // Title & Metadata
    ctx.fillStyle = '#1C1917';
    ctx.font = 'bold 24px serif';
    ctx.fillText(record.outfit_name, canvas.width / 2, 185);

    ctx.fillStyle = '#665C4F';
    ctx.font = '16px sans-serif';
    ctx.fillText(
      `Dân tộc: ${record.ethnic_group}  |  Phong cách: ${record.style_type}  |  Độ chuẩn xác: ${record.accuracy_score}`,
      canvas.width / 2,
      218
    );

    // Plate Box (Curated Flat-Lay Garment Deck)
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#E2D9CB';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(100, 245, 600, 535, 16);
    ctx.fill();
    ctx.stroke();

    // Plate Title
    ctx.fillStyle = '#8C7A68';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BẢNG PHỐI Y PHỤC DI SẢN (CURATED FLAT-LAY)', canvas.width / 2, 275);

    // Curated flat-lay garment slots
    const garments = [
      { label: 'Y Phục Chính (Áo)', item: record.slots.top },
      { label: 'Hạ Phục (Váy / Quần)', item: record.slots.bottom },
      { label: 'Khăn / Mũ', item: record.slots.head },
      { label: 'Hài / Giày / Phụ Kiện', item: record.slots.footwear || record.slots.accessories[0] }
    ];

    const cardPositions = [
      { x: 125, y: 295, w: 260, h: 220 },
      { x: 415, y: 295, w: 260, h: 220 },
      { x: 125, y: 535, w: 260, h: 220 },
      { x: 415, y: 535, w: 260, h: 220 }
    ];

    garments.forEach((g, idx) => {
      const pos = cardPositions[idx];
      ctx.fillStyle = '#FAF8F4';
      ctx.strokeStyle = '#E9E4DC';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(pos.x, pos.y, pos.w, pos.h, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#456B56';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(g.label, pos.x + 14, pos.y + 24);

      if (g.item) {
        ctx.fillStyle = g.item.color_hex || '#D8B454';
        ctx.beginPath();
        ctx.roundRect(pos.x + 14, pos.y + 36, 32, 14, 7);
        ctx.fill();

        ctx.fillStyle = '#1A1C1A';
        ctx.font = 'bold 15px serif';
        const itemName = g.item.name.length > 22 ? g.item.name.slice(0, 20) + '...' : g.item.name;
        ctx.fillText(itemName, pos.x + 14, pos.y + 72);

        ctx.fillStyle = '#736B5E';
        ctx.font = '12px sans-serif';
        ctx.fillText(`${g.item.ethnic_group} · ${g.item.period_or_region}`, pos.x + 14, pos.y + 96);

        ctx.fillStyle = '#554C41';
        ctx.font = '12px sans-serif';
        const mat = `Chất liệu: ${g.item.material}`.slice(0, 26);
        ctx.fillText(mat, pos.x + 14, pos.y + 120);

        ctx.fillStyle = '#456B56';
        ctx.font = 'italic 11px serif';
        const sig = (g.item.pattern_description || g.item.cultural_significance).slice(0, 32) + '...';
        ctx.fillText(sig, pos.x + 14, pos.y + 145);
        if ((g.item.pattern_description || g.item.cultural_significance).length > 32) {
          const sig2 = (g.item.pattern_description || g.item.cultural_significance).slice(32, 64) + '...';
          ctx.fillText(sig2, pos.x + 14, pos.y + 165);
        }

        ctx.fillStyle = '#9E9282';
        ctx.font = '10px sans-serif';
        ctx.fillText(`Khảo cứu: ${g.item.source_verification || 'Chuẩn xác'}`, pos.x + 14, pos.y + 200);
      } else {
        ctx.fillStyle = '#A3998D';
        ctx.font = 'italic 13px sans-serif';
        ctx.fillText('Chưa chọn món', pos.x + 14, pos.y + 80);
      }
    });

    // Quote
    ctx.fillStyle = '#2A2420';
    ctx.font = 'italic 16px serif';
    ctx.textAlign = 'center';
    const quote = `"${record.cultural_quote}"`;
    ctx.fillText(quote.slice(0, 90), canvas.width / 2, 820);
    if (quote.length > 90) {
      ctx.fillText(quote.slice(90, 180), canvas.width / 2, 846);
    }

    // Slots details
    ctx.textAlign = 'left';
    ctx.font = '13px sans-serif';
    ctx.fillStyle = '#5A4E42';
    const leftMargin = 120;
    ctx.fillText(`• Khăn/Mũ: ${record.slots.head?.name || 'Nguyên bản'}`, leftMargin, 895);
    ctx.fillText(`• Y phục chính: ${record.slots.top?.name || 'Nguyên bản'}`, leftMargin, 922);
    ctx.fillText(`• Hạ phục: ${record.slots.bottom?.name || 'Nguyên bản'}`, leftMargin, 949);

    const rightMargin = 450;
    ctx.fillText(`• Hài/Guốc: ${record.slots.footwear?.name || 'Nguyên bản'}`, rightMargin, 895);
    ctx.fillText(
      `• Phụ kiện: ${record.slots.accessories[0]?.name || 'Tự do'}`,
      rightMargin,
      922
    );
    ctx.fillText(`• Giới tính người mặc: ${record.gender.toUpperCase()}`, rightMargin, 949);

    // Footer Stamp
    ctx.fillStyle = '#8B2626';
    ctx.font = 'bold 14px serif';
    ctx.textAlign = 'center';
    ctx.fillText('✓ ĐÃ GIÁM ĐỊNH VĂN HÓA AI ARENA 2026', canvas.width / 2, 1030);

    setTimeout(() => {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `VietCoYPhong_${record.outfit_name.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
      setIsExporting(false);
      setExportNotice(`Đã tải xuống thẻ Lookbook "${record.outfit_name}" thành công!`);
      setTimeout(() => setExportNotice(null), 3500);
    }, 400);
  };

  const handleShareCard = (record: LookbookRecord) => {
    const shareUrl = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setShareNotice(`Đã sao chép liên kết bộ sưu tập "${record.outfit_name}" vào bộ nhớ tạm!`);
      setTimeout(() => setShareNotice(null), 3500);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Hidden Canvas for High-Res PNG Generation */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Notice Banners */}
        {exportNotice && (
          <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-fade-in border border-stone-700">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-sm font-medium">{exportNotice}</span>
          </div>
        )}
        {shareNotice && (
          <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-fade-in border border-stone-700">
            <Share2 className="w-5 h-5 text-[#F9CA24] shrink-0" />
            <span className="text-sm font-medium">{shareNotice}</span>
          </div>
        )}

        {/* SECTION 1: FIREBASE USER PROFILE & AUTHENTICATION HEADER - TAB 4: TÍM CUNG ĐÌNH HUẾ (ROYAL HUE PURPLE) */}
        <div className="relative rounded-3xl overflow-hidden bg-[#5C2B4E] text-[#FFFDF8] p-6 sm:p-8 shadow-md border border-[#47203C]">
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="royal-hue-lattice" width="24" height="24" patternUnits="userSpaceOnUse">
                  <path d="M12 2 L22 12 L12 22 L2 12 Z" fill="none" stroke="#FFFDF8" strokeWidth="0.8" strokeOpacity="0.3" />
                  <circle cx="12" cy="12" r="3" fill="#D8B454" fillOpacity="0.35" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#royal-hue-lattice)"></rect>
            </svg>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#D8B454] to-[#caa749] p-1 shadow-md">
                  <div className="w-full h-full rounded-full bg-[#fbf9f4] flex items-center justify-center overflow-hidden">
                    {user ? (
                      user.avatarUrl && user.avatarUrl.trim() !== '' ? (
                        <img src={user.avatarUrl} alt={user.displayName || 'Người dùng'} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl sm:text-3xl font-headline font-bold text-[#5C2B4E]">
                          {(user.displayName || 'U').charAt(0)}
                        </span>
                      )
                    ) : (
                      <User className="w-10 h-10 text-stone-400" />
                    )}
                  </div>
                </div>
                {user && (
                  <span className="absolute bottom-0 right-0 w-5 h-5 bg-[#D8B454] border-2 border-[#5C2B4E] rounded-full" title="Đã xác thực" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-headline font-bold text-white">
                    {user ? user.displayName : 'Khách tham quan AI Arena'}
                  </h1>
                  {user && (
                    <span className="px-3 py-1 bg-white/15 text-[#D8B454] text-xs font-label-md font-semibold rounded-full border border-white/20 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Hồ sơ: {user.gender === 'nam' ? 'Nam · Dáng vóc uy nghi' : user.gender === 'nu' ? 'Nữ · Dáng thanh tú' : 'Nonbinary · Phom dáng linh hoạt'}
                    </span>
                  )}
                </div>
                <p className="text-sm text-stone-200 mt-1 flex items-center gap-2 font-body-sm">
                  {user ? (
                    <>
                      <Mail className="w-3.5 h-3.5 text-[#D8B454]" />
                      <span>{user.email || user.phoneNumber || 'Đã liên kết Firebase'}</span>
                      <span className="text-white/40">•</span>
                      <span className="text-[#D8B454] font-medium">Đã liên kết tài khoản Firebase Auth</span>
                    </>
                  ) : (
                    'Vui lòng đăng nhập để lưu trữ bộ sưu tập cá nhân và đồng bộ đám mây.'
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end font-label-md">
              {user ? (
                <>
                  <button
                    onClick={() => setAuthModalOpen(true, 'onboarding')}
                    className="flex-1 md:flex-initial px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 border border-white/20"
                  >
                    <Edit3 className="w-4 h-4 text-[#D8B454]" />
                    <span>Chỉnh sửa hồ sơ</span>
                  </button>
                  <button
                    onClick={logout}
                    className="px-4 py-2.5 bg-black/25 hover:bg-black/35 text-stone-200 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 border border-white/15"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Đăng xuất</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true, 'signin')}
                  className="w-full md:w-auto px-6 py-3 bg-[#D8B454] hover:bg-[#c9a33e] text-stone-900 text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-stone-900" />
                  <span>Đăng nhập / Đăng ký</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 2: LOOKBOOK & SAVED OUTFITS HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-headline font-bold text-stone-900 flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-[#2d533f]" />
              <span>Bộ Sưu Tập Lookbook Đã Lưu ({savedLookbooks.length})</span>
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5 font-body-sm">
              Những set trang phục di sản bạn đã phối và lưu lại từ phòng phối đồ.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('studio')}
            className="self-start sm:self-auto px-4 py-2 bg-[#2d533f] hover:bg-[#456b56] text-white text-xs font-label-md font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#caa749]" />
            <span>Phối thêm bộ mới</span>
          </button>
        </div>

        {/* SECTION 3: VISUAL-FIRST HERITAGE LOOKBOOK CARDS GRID */}
        {savedLookbooks.length === 0 ? (
          <div className="bg-[#fbf9f4] border border-[#e9e8e3] rounded-3xl p-12 text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-[#caa749]/20 flex items-center justify-center mx-auto text-[#755b00]">
              <Bookmark className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-headline font-bold text-stone-900">Chưa có bộ sưu tập nào được lưu</h3>
            <p className="text-sm text-stone-600 max-w-md mx-auto font-body-sm">
              Hãy truy cập Phòng Phối Đồ (Styling Studio), chọn lựa các họa tiết di sản 54 dân tộc và triều đại Việt Nam rồi bấm "Lưu vào Lookbook" để hiển thị tại đây.
            </p>
            <button
              onClick={() => setActiveTab('studio')}
              className="px-6 py-3 bg-[#2d533f] hover:bg-[#456b56] text-white text-sm font-label-md font-semibold rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#caa749]" />
              <span>Khám phá phòng thiết kế ngay</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedLookbooks.map((record) => {
              const topItem = record.slots.top;
              const bottomItem = record.slots.bottom;
              const headItem = record.slots.head;

              return (
                <div
                  key={record.id}
                  className="bg-white border border-[#e9e8e3] hover:border-[#2d533f] rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col group relative"
                >
                  {/* Card Header Tag */}
                  <div className="bg-stone-900 text-[#fbf9f4] px-4 py-2.5 flex items-center justify-between text-xs font-label-md">
                    <span className="font-semibold tracking-wider uppercase text-[#caa749]">
                      {record.ethnic_group}
                    </span>
                    <span className="bg-white/10 px-2.5 py-0.5 rounded-full font-mono text-[11px]">
                      {record.accuracy_score} Chuẩn xác
                    </span>
                  </div>

                  {/* Visual Preview Plate */}
                  <div className="p-6 bg-gradient-to-b from-[#f5f4ef] to-[#fbf9f4] border-b border-[#e9e8e3] flex flex-col items-center justify-center relative min-h-[220px]">
                    <div className="absolute top-3 left-3 text-[10px] font-label-sm uppercase text-stone-500 bg-white/90 px-2 py-0.5 rounded-md border border-[#e9e8e3]">
                      {record.style_type}
                    </div>

                    {/* Clean Composition of Real Garment Image Thumbnails */}
                    <div className="w-full grid grid-cols-3 gap-2 py-3 px-2">
                      {[headItem, topItem, bottomItem].filter(Boolean).map((item) => (
                        <div
                          key={item!.id}
                          className="aspect-square rounded-xl overflow-hidden bg-white border border-[#e9e8e3] shadow-xs group-hover:scale-105 transition-transform"
                          title={item!.name}
                        >
                          <img
                            src={item!.image_url}
                            alt={item!.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="text-center mt-1">
                      <span className="text-xs font-headline font-bold text-stone-800 line-clamp-1">
                        {record.outfit_name}
                      </span>
                    </div>
                  </div>

                  {/* Card Body & Cultural Quote */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <p className="text-xs italic text-stone-700 font-serif line-clamp-2 bg-[#f5f4ef] p-3 rounded-xl border border-[#e9e8e3]">
                        "{record.cultural_quote}"
                      </p>

                      <div className="text-[11px] text-stone-500 space-y-0.5 font-body-sm pt-1">
                        <div className="truncate">• Mũ/Khăn: <span className="text-stone-800 font-medium">{headItem?.name || 'Nguyên bản'}</span></div>
                        <div className="truncate">• Y phục: <span className="text-stone-800 font-medium">{topItem?.name || 'Nguyên bản'}</span></div>
                        <div className="truncate">• Hạ phục: <span className="text-stone-800 font-medium">{bottomItem?.name || 'Nguyên bản'}</span></div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#e9e8e3] font-label-md">
                      <button
                        onClick={() => handleApplySavedOutfit(record)}
                        className="px-3 py-2 bg-[#2d533f] hover:bg-[#456b56] text-white text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                        title="Nạp bộ này vào Studio để phối tiếp"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#caa749]" />
                        <span>Phối tiếp bộ này</span>
                      </button>

                      <button
                        onClick={() => handleDownloadCard(record)}
                        disabled={isExporting}
                        className="px-3 py-2 bg-[#f5f4ef] hover:bg-[#efeee9] text-stone-800 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-[#e9e8e3]"
                        title="Tải thẻ Lookbook dạng ảnh PNG"
                      >
                        <Download className="w-3.5 h-3.5 text-stone-600" />
                        <span>Tải PNG</span>
                      </button>

                      <button
                        onClick={() => handleShareCard(record)}
                        className="px-3 py-2 bg-[#f5f4ef] hover:bg-[#efeee9] text-stone-800 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-[#e9e8e3]"
                        title="Chia sẻ liên kết"
                      >
                        <Share2 className="w-3.5 h-3.5 text-stone-600" />
                        <span>Chia sẻ</span>
                      </button>

                      <button
                        onClick={() => deleteLookbook(record.id)}
                        className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-stone-200"
                        title="Xóa bộ sưu tập"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
