import React, { useRef, useState } from 'react';
import { useCostumeStore } from '../../store/useCostumeStore';
import { Gender, LookbookRecord } from '../../types/costume';
import {
  Download,
  Share2,
  Bookmark,
  Trash2,
  Users,
  CheckCircle2,
  QrCode,
  Sparkles,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export const LookbookExport: React.FC = () => {
  const {
    outfit,
    setGender,
    savedLookbooks,
    deleteLookbook,
    setSlotItem,
    setActiveTab
  } = useCostumeStore();

  const [activeLookbookId, setActiveLookbookId] = useState<string | null>(
    savedLookbooks[0]?.id || null
  );
  const [isExporting, setIsExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const selectedRecord =
    savedLookbooks.find((lb) => lb.id === activeLookbookId) || savedLookbooks[0] || null;

  const handleApplySavedOutfit = (record: LookbookRecord) => {
    setGender(record.gender);
    setSlotItem('head', record.slots.head);
    setSlotItem('top', record.slots.top);
    setSlotItem('bottom', record.slots.bottom);
    setSlotItem('footwear', record.slots.footwear);
    // clear and set accessories
    setSlotItem('accessories', null);
    record.slots.accessories.forEach((acc) => setSlotItem('accessories', acc));
    setActiveTab('studio');
  };

  // Render high-res lookbook card to canvas and download PNG
  const handleDownloadCard = () => {
    if (!selectedRecord) return;
    setIsExporting(true);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas size (800 x 1200 high-res portrait card)
    canvas.width = 800;
    canvas.height = 1150;

    // 1. Background (Warm Papyrus / Giấy Điệp #F7F5F0)
    ctx.fillStyle = '#F7F5F0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle paper texture grain / noise
    ctx.fillStyle = '#EFE9DE';
    ctx.fillRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Decorative Double Frame Border (Khung Kỷ Hà Di Sản)
    ctx.strokeStyle = '#2d533f';
    ctx.lineWidth = 3;
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

    ctx.strokeStyle = '#AA820A';
    ctx.lineWidth = 1;
    ctx.strokeRect(38, 38, canvas.width - 76, canvas.height - 76);

    // Corner decorative accents
    const drawCorner = (x: number, y: number) => {
      ctx.fillStyle = '#2d533f';
      ctx.fillRect(x - 5, y - 5, 10, 10);
    };
    drawCorner(38, 38);
    drawCorner(canvas.width - 38, 38);
    drawCorner(38, canvas.height - 38);
    drawCorner(canvas.width - 38, canvas.height - 38);

    // 2. Header Typography
    ctx.fillStyle = '#6E6152';
    ctx.font = '14px serif';
    ctx.textAlign = 'center';
    ctx.fillText('MẶC CHẤT RIÊNG, GIỮ NÉT VIỆT', canvas.width / 2, 75);

    ctx.fillStyle = '#2d533f';
    ctx.font = 'bold 34px serif';
    ctx.fillText('VIỆT PHỤC 5.0', canvas.width / 2, 120);

    // Separator line
    ctx.strokeStyle = '#D1C7B7';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(180, 140);
    ctx.lineTo(canvas.width - 180, 140);
    ctx.stroke();

    // 3. Outfit Title & Metadata
    ctx.fillStyle = '#1C1917';
    ctx.font = 'bold 24px serif';
    ctx.fillText(selectedRecord.outfit_name, canvas.width / 2, 185);

    ctx.fillStyle = '#665C4F';
    ctx.font = '16px sans-serif';
    ctx.fillText(
      `Dân tộc: ${selectedRecord.ethnic_group}  |  Phong cách: ${selectedRecord.style_type}  |  Độ chuẩn xác: ${selectedRecord.accuracy_score}`,
      canvas.width / 2,
      218
    );

    // 4. Center Curated Garments Flat-Lay Visual Plate
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

    // Render garment cards on the canvas plate
    const garments = [
      { label: 'Y Phục Chính (Áo)', item: selectedRecord.slots.top },
      { label: 'Hạ Phục (Váy / Quần)', item: selectedRecord.slots.bottom },
      { label: 'Khăn / Mũ', item: selectedRecord.slots.head },
      { label: 'Hài / Giày / Phụ Kiện', item: selectedRecord.slots.footwear || selectedRecord.slots.accessories[0] }
    ];

    const cardPositions = [
      { x: 125, y: 295, w: 260, h: 220 },
      { x: 415, y: 295, w: 260, h: 220 },
      { x: 125, y: 535, w: 260, h: 220 },
      { x: 415, y: 535, w: 260, h: 220 }
    ];

    garments.forEach((g, idx) => {
      const pos = cardPositions[idx];
      // Card background
      ctx.fillStyle = '#FAF8F4';
      ctx.strokeStyle = '#E9E4DC';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(pos.x, pos.y, pos.w, pos.h, 12);
      ctx.fill();
      ctx.stroke();

      // Category badge
      ctx.fillStyle = '#456B56';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(g.label, pos.x + 14, pos.y + 24);

      if (g.item) {
        // Color accent pill
        ctx.fillStyle = g.item.color_hex || '#D8B454';
        ctx.beginPath();
        ctx.roundRect(pos.x + 14, pos.y + 36, 32, 14, 7);
        ctx.fill();

        // Item name
        ctx.fillStyle = '#1A1C1A';
        ctx.font = 'bold 15px serif';
        const itemName = g.item.name.length > 22 ? g.item.name.slice(0, 20) + '...' : g.item.name;
        ctx.fillText(itemName, pos.x + 14, pos.y + 72);

        // Ethnic group & Region
        ctx.fillStyle = '#736B5E';
        ctx.font = '12px sans-serif';
        ctx.fillText(`${g.item.ethnic_group} · ${g.item.period_or_region}`, pos.x + 14, pos.y + 96);

        // Material
        ctx.fillStyle = '#554C41';
        ctx.font = '12px sans-serif';
        const mat = `Chất liệu: ${g.item.material}`.slice(0, 26);
        ctx.fillText(mat, pos.x + 14, pos.y + 120);

        // Ritual level or cultural badge
        ctx.fillStyle = '#456B56';
        ctx.font = 'italic 11px serif';
        const sig = (g.item.pattern_description || g.item.cultural_significance).slice(0, 32) + '...';
        ctx.fillText(sig, pos.x + 14, pos.y + 145);
        if ((g.item.pattern_description || g.item.cultural_significance).length > 32) {
          const sig2 = (g.item.pattern_description || g.item.cultural_significance).slice(32, 64) + '...';
          ctx.fillText(sig2, pos.x + 14, pos.y + 165);
        }

        // Verified source note
        ctx.fillStyle = '#9E9282';
        ctx.font = '10px sans-serif';
        ctx.fillText(`Khảo cứu: ${g.item.source_verification || 'Chuẩn xác'}`, pos.x + 14, pos.y + 200);
      } else {
        ctx.fillStyle = '#A3998D';
        ctx.font = 'italic 13px sans-serif';
        ctx.fillText('Chưa chọn món', pos.x + 14, pos.y + 80);
      }
    });

    // 5. Cultural Essay / Quote Block
    ctx.fillStyle = '#2A2420';
    ctx.font = 'italic 16px serif';
    ctx.textAlign = 'center';
    const quote = `"${selectedRecord.cultural_quote}"`;
    ctx.fillText(quote.slice(0, 90), canvas.width / 2, 820);
    if (quote.length > 90) {
      ctx.fillText(quote.slice(90, 180), canvas.width / 2, 846);
    }

    // 6. Slot Specifications Grid
    ctx.textAlign = 'left';
    ctx.font = '13px sans-serif';
    ctx.fillStyle = '#5A4E42';
    const leftMargin = 120;
    ctx.fillText(`• Khăn/Mũ: ${selectedRecord.slots.head?.name || 'Nguyên bản'}`, leftMargin, 895);
    ctx.fillText(`• Y phục chính: ${selectedRecord.slots.top?.name || 'Nguyên bản'}`, leftMargin, 922);
    ctx.fillText(`• Hạ phục: ${selectedRecord.slots.bottom?.name || 'Nguyên bản'}`, leftMargin, 949);

    const rightMargin = 450;
    ctx.fillText(`• Hài/Guốc: ${selectedRecord.slots.footwear?.name || 'Nguyên bản'}`, rightMargin, 895);
    ctx.fillText(
      `• Phụ kiện: ${selectedRecord.slots.accessories[0]?.name || 'Tự do'}`,
      rightMargin,
      922
    );
    ctx.fillText(`• Giới tính người mặc: ${selectedRecord.gender.toUpperCase()}`, rightMargin, 949);

    // 7. Footer: QR Code Mockup + Authenticity Seal
    // QR Code Box on bottom right
    const qrX = canvas.width - 210;
    const qrY = 985;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(qrX, qrY, 110, 110);
    ctx.strokeStyle = '#1C1917';
    ctx.lineWidth = 2;
    ctx.strokeRect(qrX, qrY, 110, 110);

    // QR grid dots simulation
    ctx.fillStyle = '#1C1917';
    ctx.fillRect(qrX + 10, qrY + 10, 28, 28);
    ctx.fillRect(qrX + 72, qrY + 10, 28, 28);
    ctx.fillRect(qrX + 10, qrY + 72, 28, 28);
    ctx.fillRect(qrX + 48, qrY + 48, 14, 14);
    ctx.fillRect(qrX + 70, qrY + 70, 20, 20);

    // Curatorial Stamp
    ctx.textAlign = 'left';
    ctx.font = 'bold 15px serif';
    ctx.fillStyle = '#2d533f';
    ctx.fillText('GIÁM ĐỊNH VĂN HÓA SỐ HÓA', 100, 1025);
    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#786C5E';
    ctx.fillText('Xác thực bởi Hệ thống AI ARENA 2026', 100, 1050);
    ctx.fillText(`Mã thẻ di sản: #${selectedRecord.id.toUpperCase()}`, 100, 1072);

    // Convert to PNG download
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `VietCoYPhong_${selectedRecord.outfit_name.replace(/\s+/g, '_')}.png`;
    link.href = dataUrl;
    link.click();

    setIsExporting(false);
    setExportNotice('Ảnh thẻ Lookbook đã tải về thành công!');
    setTimeout(() => setExportNotice(null), 3500);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Hidden canvas for high-res export */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header & Sub-section 1: Hồ sơ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#755b00] font-label-md font-bold block">
            Màn hình 4 · Tài khoản & Xuất Thẻ Lookbook
          </span>
          <h1 className="text-2xl sm:text-3xl font-headline font-bold text-stone-900 mt-1">
            Tài Khoản & Xuất Thẻ Lookbook
          </h1>
        </div>

        {/* Mục 1: Hồ sơ */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 text-xs bg-white p-3 rounded-2xl border border-stone-200 shadow-2xs font-label-md">
          <div className="flex items-center gap-1.5 text-stone-600 font-semibold">
            <Users className="w-4 h-4 text-[#2d533f]" />
            <span>Mục: Hồ Sơ (Vóc dáng giới tính):</span>
          </div>
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
            {(['nam', 'nu', 'nonbinary'] as Gender[]).map((g) => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  outfit.gender === g
                    ? 'bg-white text-stone-900 font-bold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {g === 'nam' ? 'Nam' : g === 'nu' ? 'Nữ' : 'Nonbinary'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Lookbook Export Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Mục 2 - Bộ sưu tập cá nhân (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#755b00] font-label-md font-bold block">
                  Mục 2
                </span>
                <h2 className="font-headline font-bold text-base text-stone-900">
                  Bộ Sưu Tập Cá Nhân ({savedLookbooks.length})
                </h2>
              </div>
              <span className="text-xs text-stone-400">Chọn để xem thẻ</span>
            </div>

            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {savedLookbooks.map((record) => {
                const isSelected = selectedRecord?.id === record.id;

                return (
                  <div
                    key={record.id}
                    onClick={() => setActiveLookbookId(record.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'bg-[#f5f4ef] border-[#2d533f] shadow-2xs'
                        : 'bg-white border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-serif italic text-stone-500">
                        {record.ethnic_group} · {record.gender.toUpperCase()}
                      </span>
                      <span className="text-xs font-mono font-semibold text-[#2d533f] bg-[#2d533f]/10 px-2 py-0.5 rounded">
                        {record.accuracy_score}
                      </span>
                    </div>

                    <h3 className="font-headline font-bold text-sm text-stone-900 line-clamp-1">
                      {record.outfit_name}
                    </h3>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplySavedOutfit(record);
                        }}
                        className="text-[#2d533f] hover:underline font-semibold cursor-pointer"
                      >
                        Nạp vào Studio & Phối tiếp →
                      </button>

                      {savedLookbooks.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteLookbook(record.id);
                          }}
                          className="text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Xóa bộ này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Mục 3 - Tính năng Lookbook Export (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {selectedRecord ? (
            <div className="p-6 sm:p-8 rounded-3xl bg-[#fbf9f4] border border-[#e9e8e3] shadow-md space-y-6">
              {/* Card Header */}
              <div className="text-center space-y-1 pb-4 border-b border-stone-200">
                <span className="text-[10px] uppercase tracking-wider text-[#755b00] font-label-md font-bold block">
                  Mục 3: Tính Năng Lookbook Export
                </span>
                <span className="text-[11px] uppercase tracking-widest text-stone-500 font-label-sm block">
                  VIỆT PHỤC REMIX · THẺ DI SẢN MỸ THUẬT
                </span>
                <h2 className="text-2xl font-headline font-bold text-stone-900">
                  {selectedRecord.outfit_name}
                </h2>
                <div className="flex items-center justify-center gap-2 text-xs text-stone-600 font-sans">
                  <span>Dân tộc: {selectedRecord.ethnic_group}</span>
                  <span aria-hidden="true">·</span>
                  <span>Phong cách: {selectedRecord.style_type}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold text-[#2d533f]">
                    Chuẩn xác: {selectedRecord.accuracy_score}
                  </span>
                </div>
              </div>

              {/* Real Garments Thumbnails Composition */}
              <div className="p-4 rounded-2xl bg-white border border-[#e9e8e3] space-y-3">
                <span className="text-[11px] font-label-md font-bold text-stone-500 uppercase block">
                  Hình ảnh các món trong bộ phối:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    selectedRecord.slots.top,
                    selectedRecord.slots.bottom,
                    selectedRecord.slots.head,
                    selectedRecord.slots.footwear
                  ].filter(Boolean).map((item) => (
                    <div key={item!.id} className="space-y-1 text-center">
                      <div className="aspect-square rounded-xl overflow-hidden bg-[#f5f4ef] border border-[#e9e8e3]">
                        <img src={item!.image_url} alt={item!.name} className="w-full h-full object-cover" />
                      </div>
                      <p className="text-[11px] font-bold text-stone-900 truncate">{item!.name}</p>
                      <span className="text-[10px] text-stone-500 font-medium">{item!.category || item!.slot}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cultural Quote Citation */}
              <div className="p-4 rounded-2xl bg-white border border-[#e9e8e3] text-center">
                <p className="font-serif italic text-stone-800 text-sm leading-relaxed">
                  "{selectedRecord.cultural_quote}"
                </p>
              </div>

              {/* Outfit Slots Specs Table */}
              <div className="p-4 rounded-2xl bg-white border border-[#e9e8e3] space-y-2 text-xs">
                <span className="font-semibold uppercase tracking-wider text-stone-500 font-label-sm block mb-2">
                  Danh Mục Y Phục Đính Kèm:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-700 font-body-sm">
                  <p>• Khăn/Mũ: <strong>{selectedRecord.slots.head?.name || 'Trống'}</strong></p>
                  <p>• Áo chính: <strong>{selectedRecord.slots.top?.name || 'Trống'}</strong></p>
                  <p>• Quần/Váy: <strong>{selectedRecord.slots.bottom?.name || 'Trống'}</strong></p>
                  <p>• Hài/Guốc: <strong>{selectedRecord.slots.footwear?.name || 'Trống'}</strong></p>
                  <p className="sm:col-span-2">
                    • Phụ kiện: <strong>{selectedRecord.slots.accessories[0]?.name || 'Không'}</strong>
                  </p>
                </div>
              </div>

              {/* Bottom Card Footer with Simulated QR & Download Action */}
              <div className="pt-4 border-t border-[#e9e8e3] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-stone-900 text-white rounded-lg flex items-center justify-center">
                    <QrCode className="w-8 h-8" />
                  </div>
                  <div className="text-left text-xs font-body-sm">
                    <span className="font-headline font-bold text-stone-900 block">
                      Xác Thực Tri Thức Di Sản
                    </span>
                    <span className="text-stone-500 text-[11px]">
                      Quét mã để tra cứu tư liệu khảo cứu
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleDownloadCard}
                  disabled={isExporting}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#2d533f] text-white text-xs font-label-md font-semibold hover:bg-[#456b56] transition-all shadow-md shadow-[#2d533f]/20 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{isExporting ? 'Đang xuất thẻ...' : 'Tải Thẻ Lookbook PNG (High-Res)'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-stone-400 bg-white rounded-2xl border border-stone-200">
              Chưa có outfit nào được lưu. Hãy sang màn hình Phối đồ và nhấn "Lưu Lookbook"!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
