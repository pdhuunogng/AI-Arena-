import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const PORT = parseInt(process.env.PORT || '3000', 10);


// Initialize Gemini client server-side
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

const SYSTEM_INSTRUCTION = `
Bạn là "Việt Cổ Y Phong AI" – Cố vấn phối đồ và Giám định tri thức trang phục dân tộc & Việt phục truyền thống tại sự kiện AI ARENA 2026.
Concept: Tôn vinh họa tiết, hoa văn truyền thống 54 dân tộc và các triều đại Việt Nam trong giao diện và tinh thần trẻ trung, tinh tế, đa dạng giới tính (nam, nữ, nonbinary).

BỘ QUY TẮC RÀNG BUỘC NGHIÊM NGẶT (RULES & CONSTRAINTS):
1. HARD CONSTRAINTS (Tuyệt đối không vi phạm):
- KHÔNG phối chéo các item thuộc các dân tộc khác nhau nếu không có cờ cross_cultural_flag: true (ví dụ: cấm ghép chân váy Mông với áo Tấc Kinh; chỉ cho phép phụ kiện hiện đại/phổ quát). Nếu vi phạm, phải cảnh báo ngay trong mảng warning_flags và hạ điểm cultural_accuracy_score.
- KHÔNG đề xuất trang phục nghi lễ, tín ngưỡng, tế tự (như khăn chầu áo ngự, áo tế trang trọng, đồ tang lễ có ritual_level: sacred_ritual) cho các sự kiện thông thường, dạo phố hoặc chụp ảnh thường nhật. Chỉ gợi ý khi sự kiện người dùng chọn hoàn toàn trùng khớp với chức năng tế tự.
- KHÔNG tự ý sửa đổi, thêm bớt các chi tiết quy chuẩn mang ý nghĩa tín ngưỡng/nghi lễ thiêng liêng.

2. SOFT CONSTRAINTS (Ưu tiên tối ưu hóa):
- Ưu tiên 1: Cùng dân tộc, cùng tiểu nhóm địa phương và cùng thời kỳ lịch sử.
- Ưu tiên 2: Tuân thủ quy cách phối truyền thống đã ghi nhận trong tư liệu khảo cứu.
- Ưu tiên 3: Tương thích với sự kiện, thời tiết và tính trang trọng của bối cảnh.
- Ưu tiên 4: Hài hòa về hoa văn, bố cục ngũ sắc hoặc sắc màu tự nhiên của chất liệu (nhuộm chàm, nhuộm củ nâu, dệt tơ tằm).
- Cho phép biến tấu cách tân nhẹ ở phụ kiện không bắt buộc, nhưng BẮT BUỘC gắn nhãn: style_type: "Phối cách tân / Giao thoa" (không được ghi là nguyên bản).

3. CULTURAL CONFIDENCE (Chống ảo giác tri thức):
- Chỉ xuất nội dung ý nghĩa văn hóa và hoa văn khi thông tin đã có nguồn khảo cứu chuẩn xác.
- Nếu không đủ tư liệu xác minh, AI BẮT BUỘC ghi rõ cụm từ: "Chưa có thông tin xác minh" tại trường cultural_notes, tuyệt đối không tự suy luận hoặc bịa đặt điển tích.

ĐỊNH DẠNG ĐẦU RA (OUTPUT SCHEMA):
Bắt buộc trả kết quả dạng JSON hợp lệ tuân thủ chính xác cấu trúc sau:
{
  "outfit_id": "chuỗi ngẫu nhiên",
  "outfit_name": "Tên set trang phục",
  "ethnic_group": "Tên dân tộc / Triều đại (Kinh / H'Mông / Dao / Chăm...)",
  "style_type": "Nguyên bản truyền thống" hoặc "Phối cách tân / Giao thoa",
  "cultural_accuracy_score": "Điểm phần trăm (ví dụ: 95%)",
  "slots": {
    "head": {
      "item_name": "Tên mũ/khăn",
      "material": "Chất liệu",
      "color_hex": "#MãMàu",
      "cultural_notes": "Ý nghĩa hoặc 'Chưa có thông tin xác minh'"
    },
    "top": {
      "item_name": "Tên áo",
      "material": "Chất liệu",
      "color_hex": "#MãMàu",
      "cultural_notes": "Ý nghĩa hoa văn hoặc 'Chưa có thông tin xác minh'"
    },
    "bottom": {
      "item_name": "Tên quần/váy",
      "material": "Chất liệu",
      "color_hex": "#MãMàu",
      "cultural_notes": "Ý nghĩa hoa văn hoặc 'Chưa có thông tin xác minh'"
    },
    "footwear": {
      "item_name": "Tên hài/guốc/giày",
      "material": "Chất liệu",
      "cultural_notes": "Thông tin chi tiết"
    },
    "accessories": [
      {
        "item_name": "Tên phụ kiện",
        "material": "Chất liệu",
        "cultural_notes": "Ý nghĩa biểu tượng"
      }
    ]
  },
  "overall_comment": "Nhận xét tổng quan về bố cục, màu sắc và lời khuyên phối đồ",
  "warning_flags": [],
  "recommended_item_ids": ["id_món_khuyên_dùng_từ_kho"]
}
`;

// Helper: fallback cultural advisor engine if Gemini is offline or quota exceeded
function runHeritageRuleEngine(
  mode: 'complete' | 'prompt',
  context: {
    currentOutfit?: any;
    lockedSlots?: string[];
    catalogItems: any[];
    prompt?: string;
    gender?: string;
  }
) {
  const { currentOutfit, lockedSlots = [], catalogItems = [], prompt = '', gender = 'nu' } = context;
  const pLower = (prompt || '').toLowerCase();

  // Determine target ethnic group
  let targetEthnic = 'Kinh';
  let targetRegion = 'Thời Nguyễn (Cung đình Huế)';
  let isSacredRequested = pLower.includes('tế tự') || pLower.includes('hầu đồng') || pLower.includes('tín ngưỡng');
  let isCasualOrStreet = pLower.includes('dạo phố') || pLower.includes('hẹn hò') || pLower.includes('thường nhật') || pLower.includes('chụp ảnh');
  let isWeddingOrCeremony = pLower.includes('cưới') || pLower.includes('lễ cưới') || pLower.includes('hôn lễ');
  let isBrocadeHmong = pLower.includes('mông') || pLower.includes('hmong') || pLower.includes('tây bắc') || pLower.includes('sáp ong');
  let isCham = pLower.includes('chăm') || pLower.includes('katê') || pLower.includes('ninh thuận') || pLower.includes('tháp');
  let isDao = pLower.includes('dao') || pLower.includes('quả bông') || pLower.includes('khăn đỏ');
  let isTac = pLower.includes('tấc') || pLower.includes('ngũ thân') || pLower.includes('thăng long') || pLower.includes('nho nhã') || pLower.includes('nam');

  // If in complete mode and a slot is locked, adhere strictly to the locked item's ethnic group
  const warning_flags: string[] = [];
  if (mode === 'complete' && currentOutfit?.slots) {
    const lockedTop = currentOutfit.slots.top;
    const lockedHead = currentOutfit.slots.head;
    const lockedBottom = currentOutfit.slots.bottom;
    const primaryLocked = lockedTop || lockedHead || lockedBottom;

    if (primaryLocked) {
      targetEthnic = primaryLocked.ethnic_group;
      targetRegion = primaryLocked.period_or_region;
    }

    // Check for hard constraint violations among currently worn items
    const wornItems = [
      currentOutfit.slots.head,
      currentOutfit.slots.top,
      currentOutfit.slots.bottom,
      currentOutfit.slots.footwear,
      ...(currentOutfit.slots.accessories || [])
    ].filter(Boolean);

    const ethnicSet = new Set(
      wornItems.filter((i: any) => !i.cross_cultural_flag).map((i: any) => i.ethnic_group)
    );

    if (ethnicSet.size > 1) {
      warning_flags.push(
        `Cảnh báo Hard Constraint: Phát hiện phối chéo đa văn hóa (${Array.from(ethnicSet).join(
          ' + '
        )}) giữa các món nguyên bản chưa bật cờ cross_cultural_flag!`
      );
    }

    const sacredItems = wornItems.filter((i: any) => i.ritual_level === 'sacred_ritual');
    if (sacredItems.length > 0 && !isSacredRequested) {
      warning_flags.push(
        `Cảnh báo Tín ngưỡng: Món "${sacredItems[0].name}" là trang phục tế tự/tín ngưỡng thiêng liêng, không được sử dụng cho sự kiện thông thường!`
      );
    }
  } else {
    // Mode prompt
    if (isBrocadeHmong) {
      targetEthnic = "H'Mông";
      targetRegion = 'Tây Bắc (Sa Pa, Mù Cang Chải)';
    } else if (isCham) {
      targetEthnic = 'Chăm';
      targetRegion = 'Nam Trung Bộ (Ninh Thuận)';
    } else if (isDao) {
      targetEthnic = 'Dao';
      targetRegion = 'Tây Bắc (Lào Cai, Yên Bái)';
    } else if (isTac) {
      targetEthnic = 'Kinh';
      targetRegion = 'Thời Nguyễn (Bắc Bộ & Trung Bộ)';
    }
  }

  // Filter compatible items from catalog
  const ethnicItems = catalogItems.filter(
    (i: any) => i.ethnic_group === targetEthnic || i.cross_cultural_flag === true
  );

  const pickSlot = (slot: string, fallbackId: string) => {
    // If locked in current outfit, keep it
    if (mode === 'complete' && lockedSlots.includes(slot) && currentOutfit?.slots?.[slot]) {
      return currentOutfit.slots[slot];
    }
    const matching = ethnicItems.filter((i: any) => i.slot === slot && i.ethnic_group === targetEthnic);
    if (matching.length > 0) return matching[0];
    const anyMatching = catalogItems.find((i: any) => i.id === fallbackId);
    return anyMatching || null;
  };

  let chosenTop = pickSlot('top', targetEthnic === 'Kinh' ? 'nb-top-01' : 'hm-top-01');
  let chosenHead = pickSlot('head', targetEthnic === 'Kinh' ? 'nb-head-01' : 'hm-head-01');
  let chosenBottom = pickSlot('bottom', targetEthnic === 'Kinh' ? 'nb-bottom-01' : 'hm-bottom-01');
  let chosenFoot = pickSlot('footwear', targetEthnic === 'Kinh' ? 'nb-foot-01' : 'hm-foot-01');
  let chosenAccs = ethnicItems.filter((i: any) => i.slot === 'accessories').slice(0, 2);

  // If wedding or ceremony requested and Kinh, check if Ao Tac fits better
  if (isWeddingOrCeremony && targetEthnic === 'Kinh' && !lockedSlots.includes('top')) {
    const tacTop = catalogItems.find((i: any) => i.id === 'tac-top-01');
    if (tacTop) {
      chosenTop = tacTop;
      chosenHead = catalogItems.find((i: any) => i.id === 'tac-head-01') || chosenHead;
      chosenBottom = catalogItems.find((i: any) => i.id === 'tac-bottom-01') || chosenBottom;
      chosenFoot = catalogItems.find((i: any) => i.id === 'tac-foot-01') || chosenFoot;
    }
  }

  const isCrossCultural = chosenAccs.some((a: any) => a.cross_cultural_flag && a.ethnic_group !== targetEthnic);
  const accuracyScore = warning_flags.length > 0 ? '68%' : isCrossCultural ? '90%' : '98%';
  const styleType = isCrossCultural || pLower.includes('cách tân') ? 'Phối cách tân / Giao thoa' : 'Nguyên bản truyền thống';

  let outfitName = `${chosenTop?.name || 'Cổ phục'} · Bản Sắc ${targetEthnic}`;
  if (targetEthnic === 'Kinh' && chosenTop?.id?.includes('nb')) {
    outfitName = 'Nhật Bình Cung Đình Huế · Mệnh Phụ Hoàng Tộc';
  } else if (targetEthnic === 'Kinh' && chosenTop?.id?.includes('tac')) {
    outfitName = 'Áo Tấc Ngũ Thân Phẩm Lam · Sĩ Phu Tràng An';
  } else if (targetEthnic === "H'Mông") {
    outfitName = "Y Phục H'Mông Hoa Hội Gầu Tào · Tây Bắc";
  } else if (targetEthnic === 'Chăm') {
    outfitName = 'Aw Cam Nữ Chăm Katê Tinh Khôi · Tháp Po Klong Garai';
  } else if (targetEthnic === 'Dao') {
    outfitName = 'Lễ Phục Quả Bông Dao Đỏ · Hương Sắc Bản Làng';
  }

  const recommendedIds = [
    chosenHead?.id,
    chosenTop?.id,
    chosenBottom?.id,
    chosenFoot?.id,
    ...chosenAccs.map((a: any) => a.id)
  ].filter(Boolean);

  return {
    outfit_id: `outfit-${Date.now()}`,
    outfit_name: outfitName,
    ethnic_group: targetEthnic,
    style_type: styleType,
    cultural_accuracy_score: accuracyScore,
    slots: {
      head: {
        item_name: chosenHead?.name || 'Khăn truyền thống',
        material: chosenHead?.material || 'Lụa tơ tằm',
        color_hex: chosenHead?.color_hex || '#F9CA24',
        cultural_notes: chosenHead?.cultural_significance || 'Chưa có thông tin xác minh'
      },
      top: {
        item_name: chosenTop?.name || 'Áo truyền thống',
        material: chosenTop?.material || 'Tơ tằm cao cấp',
        color_hex: chosenTop?.color_hex || '#D63031',
        cultural_notes: chosenTop?.pattern_description || 'Chưa có thông tin xác minh'
      },
      bottom: {
        item_name: chosenBottom?.name || 'Váy/Quần truyền thống',
        material: chosenBottom?.material || 'Vải tự dệt',
        color_hex: chosenBottom?.color_hex || '#F7F5F0',
        cultural_notes: chosenBottom?.cultural_significance || 'Chưa có thông tin xác minh'
      },
      footwear: {
        item_name: chosenFoot?.name || 'Hài/Guốc thủ công',
        material: chosenFoot?.material || 'Gỗ hoặc gấm',
        cultural_notes: chosenFoot?.cultural_significance || 'Chưa có thông tin xác minh'
      },
      accessories: chosenAccs.map((a: any) => ({
        item_name: a.name,
        material: a.material,
        cultural_notes: a.cultural_significance || 'Chưa có thông tin xác minh'
      }))
    },
    overall_comment: `Bản phối tôn vinh tính chuẩn xác di sản của dân tộc ${targetEthnic} (${targetRegion}). Bố cục màu sắc chuyển tiếp tự nhiên giữa tà áo chính và các điểm nhấn phụ kiện, đảm bảo thuần phong mỹ tục và giữ trọn hồn cốt văn hóa dân tộc.`,
    warning_flags,
    recommended_item_ids: recommendedIds
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  // --- API 1: Phối Hoàn Thiện Trang Phục (Cơ chế 1) ---
  app.post('/api/advisor/complete-outfit', async (req, res) => {
    try {
      const { currentOutfit, lockedSlots, catalogItems, userGender, occasionPrompt } = req.body;

      if (!aiClient) {
        // Fallback to rich heritage rule engine
        const fallbackResult = runHeritageRuleEngine('complete', {
          currentOutfit,
          lockedSlots,
          catalogItems,
          prompt: occasionPrompt,
          gender: userGender
        });
        return res.json(fallbackResult);
      }

      const promptText = `
Yêu cầu: Hoàn thiện trang phục (Cơ chế 1) cho người dùng.
- Giới tính người mặc: ${userGender || 'nu'}
- Bối cảnh/Ghi chú người dùng: ${occasionPrompt || 'Phối trọn vẹn hài hòa văn hóa'}
- Các slot ĐÃ BỊ KHÓA (Bắt buộc giữ nguyên món đang mặc, không được thay đổi): ${JSON.stringify(
        lockedSlots || []
      )}
- Trang phục hiện tại đang mặc: ${JSON.stringify(currentOutfit?.slots || {})}
- Danh mục trang phục có sẵn trong kho để chọn: ${JSON.stringify(
        (catalogItems || []).map((i: any) => ({
          id: i.id,
          name: i.name,
          slot: i.slot,
          ethnic_group: i.ethnic_group,
          period_or_region: i.period_or_region,
          ritual_level: i.ritual_level,
          cross_cultural_flag: i.cross_cultural_flag,
          color_hex: i.color_hex,
          material: i.material,
          cultural_significance: i.cultural_significance,
          source_verification: i.source_verification
        }))
      )}

Hãy chọn các item phù hợp nhất cho các slot CHƯA KHÓA từ danh mục trên.
Tuân thủ tuyệt đối HARD CONSTRAINTS (cấm phối chéo dân tộc nếu không có cờ, cấm đồ tế tự sacred_ritual cho sự kiện thông thường).
Trả về JSON đúng cấu trúc đã định nghĩa, bao gồm mảng recommended_item_ids chứa danh sách các id của item được chọn.
`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: promptText,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      });

      const responseText = response.text || '';
      try {
        const parsed = JSON.parse(responseText);
        return res.json(parsed);
      } catch (e) {
        const fallbackResult = runHeritageRuleEngine('complete', {
          currentOutfit,
          lockedSlots,
          catalogItems,
          prompt: occasionPrompt,
          gender: userGender
        });
        return res.json(fallbackResult);
      }
    } catch (err: any) {
      console.error('Error in complete-outfit endpoint:', err);
      // Seamless fallback
      const fallbackResult = runHeritageRuleEngine('complete', {
        currentOutfit: req.body?.currentOutfit,
        lockedSlots: req.body?.lockedSlots,
        catalogItems: req.body?.catalogItems || [],
        prompt: req.body?.occasionPrompt,
        gender: req.body?.userGender
      });
      return res.json(fallbackResult);
    }
  });

  // --- API 2: Phối Theo Ngữ Cảnh Tự Do (Cơ chế 2) ---
  app.post('/api/advisor/free-prompt', async (req, res) => {
    try {
      const { prompt, catalogItems, userGender } = req.body;

      if (!aiClient) {
        const fallbackResult = runHeritageRuleEngine('prompt', {
          catalogItems,
          prompt,
          gender: userGender
        });
        return res.json(fallbackResult);
      }

      const promptText = `
Yêu cầu: Phối theo ngữ cảnh tự do (Cơ chế 2).
- Prompt từ người dùng: "${prompt}"
- Giới tính: ${userGender || 'nu'}
- Danh mục trang phục có sẵn trong kho: ${JSON.stringify(
        (catalogItems || []).map((i: any) => ({
          id: i.id,
          name: i.name,
          slot: i.slot,
          ethnic_group: i.ethnic_group,
          period_or_region: i.period_or_region,
          ritual_level: i.ritual_level,
          cross_cultural_flag: i.cross_cultural_flag,
          color_hex: i.color_hex,
          material: i.material,
          cultural_significance: i.cultural_significance,
          source_verification: i.source_verification
        }))
      )}

Đọc hiểu bối cảnh (sự kiện, thời tiết, tính trang trọng, sắc màu, mong muốn văn hóa).
Chọn bộ trang phục hoàn chỉnh gồm head, top, bottom, footwear, accessories.
Kiểm tra kỹ: nếu sự kiện là thường nhật/dạo phố mà có ý định chọn sacred_ritual, phải từ chối hoặc cảnh báo trong warning_flags!
Nếu có yếu tố giao thoa, đánh nhãn style_type: "Phối cách tân / Giao thoa".
Trả về JSON đúng cấu trúc đã định nghĩa, đính kèm mảng recommended_item_ids.
`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: promptText,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          temperature: 0.3
        }
      });

      const responseText = response.text || '';
      try {
        const parsed = JSON.parse(responseText);
        return res.json(parsed);
      } catch (e) {
        const fallbackResult = runHeritageRuleEngine('prompt', {
          catalogItems,
          prompt,
          gender: userGender
        });
        return res.json(fallbackResult);
      }
    } catch (err: any) {
      console.error('Error in free-prompt endpoint:', err);
      const fallbackResult = runHeritageRuleEngine('prompt', {
        catalogItems: req.body?.catalogItems || [],
        prompt: req.body?.prompt,
        gender: req.body?.userGender
      });
      return res.json(fallbackResult);
    }
  });

  // --- API 3: Giám Định & Phân Loại Đồ Tải Lên (Kho Cá Nhân) ---
  app.post('/api/advisor/classify-upload', async (req, res) => {
    try {
      const { description, itemCategory, base64Image } = req.body;

      if (!aiClient) {
        // Rule-based classification fallback
        const desc = (description || '').toLowerCase();
        let slot = 'top';
        let category = 'Áo';
        if (desc.includes('khăn')) { slot = 'head'; category = 'Khăn'; }
        else if (desc.includes('mũ') || desc.includes('nón')) { slot = 'head'; category = 'Mũ'; }
        else if (desc.includes('váy')) { slot = 'bottom'; category = 'Váy'; }
        else if (desc.includes('quần')) { slot = 'bottom'; category = 'Quần'; }
        else if (desc.includes('áo') || desc.includes('yếm')) { slot = 'top'; category = 'Áo'; }
        else if (desc.includes('hài') || desc.includes('giày') || desc.includes('guốc')) { slot = 'footwear'; category = 'Giày'; }
        else if (desc.includes('kiềng') || desc.includes('vòng') || desc.includes('chuỗi') || desc.includes('bạc')) { slot = 'accessories'; category = 'Trang sức'; }
        else if (desc.includes('túi') || desc.includes('thắt lưng') || desc.includes('xà tích')) { slot = 'accessories'; category = 'Phụ kiện'; }
        else if (itemCategory) {
          category = itemCategory;
          if (['Khăn', 'Mũ'].includes(itemCategory)) slot = 'head';
          else if (itemCategory === 'Áo') slot = 'top';
          else if (['Quần', 'Váy'].includes(itemCategory)) slot = 'bottom';
          else if (itemCategory === 'Giày') slot = 'footwear';
          else slot = 'accessories';
        }

        let ethnic = 'Chưa xác minh';
        if (desc.includes('mông') || desc.includes('lanh') || desc.includes('chàm')) ethnic = "H'Mông";
        else if (desc.includes('chăm') || desc.includes('aw cam') || desc.includes('khaban')) ethnic = 'Chăm';
        else if (desc.includes('dao') || desc.includes('quả bông')) ethnic = 'Dao';
        else if (desc.includes('ngũ thân') || desc.includes('nhật bình') || desc.includes('áo tấc')) ethnic = 'Kinh';

        return res.json({
          predicted_category: category,
          predicted_slot: slot,
          predicted_ethnic_group: ethnic,
          color_hex: '#456B56',
          silhouette: 'Phom trang phục cổ phong cách điệu',
          material: 'Vải dệt hoặc tơ tự nhiên',
          cultural_compatibility: 'Món đồ có thể phối cùng các trang phục giao thoa hoặc dạo phố đương đại.',
          cross_cultural_recommended: true
        });
      }

      const promptText = `
Bạn là Chuyên gia Giám định Trang phục & Di sản Thời trang "VIỆT PHỤC REMIX".
Hãy phân tích hình ảnh và thông tin của món đồ thời trang cá nhân người dùng tải lên:
- Mô tả bổ sung từ người dùng: "${description || 'Món đồ trang phục cá nhân'}"
- Phân loại sơ bộ từ người dùng: "${itemCategory || 'Chưa rõ'}"

QUY TẮC CẢNH BÁO QUAN TRỌNG:
1. KHÔNG tự ý gán nhãn trang phục cá nhân là đồ tế tự/tín ngưỡng (sacred_ritual) nếu không có bằng chứng rõ ràng.
2. KHÔNG tự bịa điển tích lịch sử. Nếu chưa đủ tư liệu, ghi "Chưa có thông tin xác minh" cho trường văn hóa.
3. Nhận diện hình dáng thực tế từ ảnh: Áo, Quần, Váy, Khăn, Mũ, Giày, Trang sức, hay Phụ kiện.

Hãy phân tích và trả về đúng định dạng JSON sau:
{
  "predicted_category": "Áo" | "Quần" | "Váy" | "Khăn" | "Mũ" | "Giày" | "Trang sức" | "Phụ kiện",
  "predicted_slot": "top" | "bottom" | "head" | "footwear" | "accessories",
  "predicted_ethnic_group": "Tên dân tộc nếu nhận diện được (ví dụ: Kinh, H'Mông, Chăm...) hoặc 'Chưa xác minh'",
  "color_hex": "#Mã màu chủ đạo của món đồ (ví dụ: #2D533F)",
  "silhouette": "Mô tả ngắn phom dáng (dưới 15 từ)",
  "material": "Gợi ý chất liệu phỏng đoán (dưới 15 từ)",
  "cultural_compatibility": "Gợi ý cách phối kết hợp đương đại an toàn",
  "cross_cultural_recommended": true
}
`;

      const contentParts: any[] = [];

      // Extract Base64 Image if provided
      if (base64Image && typeof base64Image === 'string') {
        const commaIdx = base64Image.indexOf(',');
        if (commaIdx !== -1) {
          const mimeMatch = base64Image.substring(0, commaIdx).match(/data:([^;]+);/);
          const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
          const rawBase64 = base64Image.substring(commaIdx + 1);
          contentParts.push({
            inlineData: {
              data: rawBase64,
              mimeType: mimeType
            }
          });
        }
      }

      contentParts.push({ text: promptText });

      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contentParts,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (err: any) {
      console.error('Error in classify-upload endpoint:', err);
      return res.json({
        predicted_category: req.body?.itemCategory || 'Áo',
        predicted_slot: 'top',
        predicted_ethnic_group: 'Chưa xác minh',
        color_hex: '#456B56',
        silhouette: 'Phom dáng đương đại',
        material: 'Vải tự nhiên',
        cultural_compatibility: 'Món đồ có tiềm năng phối giao thoa phong cách trẻ trung.',
        cross_cultural_recommended: true
      });
    }
  });

  // --- API 4: Multi-Turn Cultural Advisor Chatbot (Gemini AI) ---
  app.post('/api/advisor/chat', async (req, res) => {
    try {
      const { messages = [] } = req.body;

      if (!aiClient) {
        // Fallback response if API key is not yet set
        const lastMsg = messages[messages.length - 1]?.content || '';
        return res.json({
          reply: `Chào bạn! Tôi là Cố vấn Việt Cổ Y Phong AI. Về câu hỏi "${lastMsg}", trang phục truyền thống Việt Nam và 54 dân tộc luôn tuân theo các nguyên tắc hài hòa ngũ sắc, tôn trọng tín ngưỡng và nguồn gốc cội nguồn. Bạn có thể sử dụng tính năng "Phối theo ngữ cảnh" hoặc chọn các món đồ tại Studio phối đồ để trải nghiệm trực quan nhé!`
        });
      }

      const formattedContents = messages.map((m: any) => ({
        role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      const chatSystemInstruction = `
Bạn là Cố Vấn Văn Hóa & Phong Cách Cổ Phục "Việt Cổ Y Phong AI" (AI ARENA 2026).
Nhiệm vụ: Trả lời giải thích chi tiết, uyên bác nhưng gần gũi, thanh nhã về:
- Lịch sử y quan, điển chế trang phục các triều đại (Nguyễn, Lê, Lý, Trần...).
- Bản sắc trang phục truyền thống 54 dân tộc anh em (H'Mông, Chăm, Dao, Thái, Tày, Ê-đê...).
- Quy tắc phối đồ, phối màu ngũ ngũ hành, họa tiết vân mây, thủy ba, chim phượng, hoa sen.
- Cảnh báo chuẩn xác nếu người dùng muốn dùng đồ tế tự/tín ngưỡng (sacred_ritual) cho mục đích dạo phố.
Ngôn ngữ: Tiếng Việt chuẩn mực, tôn vinh giá trị văn hóa dân tộc.
`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: formattedContents,
        config: {
          systemInstruction: chatSystemInstruction,
          temperature: 0.6
        }
      });

      return res.json({ reply: response.text || 'Rất vui được hỗ trợ bạn tìm hiểu về di sản cổ phục Việt Nam.' });
    } catch (err: any) {
      console.error('Error in chat endpoint:', err);
      return res.json({
        reply: 'Cố vấn AI đang xử lý lượng thông tin khảo cứu lớn. Bạn có thể thử lại trong giây lát hoặc tham khảo trực tiếp các tài liệu tại Kho Cổ Phục!'
      });
    }
  });

  // Serve Frontend
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Viet Co Y Phong AI server running on port ${PORT}`);
  });
}

startServer();
