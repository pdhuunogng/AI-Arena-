import {
  CostumeItem,
  CostumeSlot,
  HeritageCollection,
  GarmentCategory,
  NormalizedCatalog,
  NormalizedOutfit,
  ResearchSource,
  ReviewFlag,
  CompatibilityRule,
  CompatibilityModel
} from '../types/costume';

import rawCatalogJson from './viet_phuc_remix_normalized_catalog_v2.json';
import garmentImages from 'virtual:garment-images';

export const NORMALIZED_CATALOG = rawCatalogJson as unknown as NormalizedCatalog;

export const NORMALIZED_OUTFITS: NormalizedOutfit[] = NORMALIZED_CATALOG.outfits;
export const NORMALIZED_SOURCES: ResearchSource[] = NORMALIZED_CATALOG.sources;
export const NORMALIZED_REVIEW_FLAGS: ReviewFlag[] = NORMALIZED_CATALOG.reviewFlags;
export const NORMALIZED_COMPATIBILITY_RULES: CompatibilityRule[] = NORMALIZED_CATALOG.compatibilityRules;
export const COMPATIBILITY_MODEL: CompatibilityModel = NORMALIZED_CATALOG.compatibilityModel;

/**
 * Tạo placeholder SVG trung tính, thanh nhã theo mỹ thuật di sản Việt Nam
 * Dành riêng cho giai đoạn chưa nạp file ảnh thực tế theo quy chuẩn bảo tàng.
 */
export function createNeutralPlaceholder(
  name: string,
  category: string,
  culturalGroup?: string,
  subgroup?: string
): string {
  const safeName = (name || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  const safeGroup = (subgroup ? `${culturalGroup} · ${subgroup}` : culturalGroup || 'Việt Phục Di Sản')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const safeCat = (category || 'Trang phục')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
    <defs>
      <linearGradient id="bgParchment" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FAF8F5"/>
        <stop offset="100%" stop-color="#ECE6D9"/>
      </linearGradient>
      <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#D8B454" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#A03F30" stop-opacity="0.8"/>
      </linearGradient>
    </defs>
    <rect width="400" height="400" fill="url(#bgParchment)"/>
    <rect x="14" y="14" width="372" height="372" rx="18" fill="none" stroke="url(#borderGradient)" stroke-width="1.5" stroke-dasharray="5 3"/>
    <rect x="22" y="22" width="356" height="356" rx="12" fill="none" stroke="#2D533F" stroke-width="0.8" stroke-opacity="0.3"/>
    
    <g transform="translate(200, 140)" opacity="0.85">
      <circle r="46" fill="#2D533F" fill-opacity="0.07"/>
      <circle r="38" fill="none" stroke="#2D533F" stroke-width="1.2" stroke-opacity="0.35"/>
      <circle r="30" fill="none" stroke="#D8B454" stroke-width="0.8" stroke-opacity="0.6"/>
      <path d="M 0 -26 C 14 -13 20 7 0 26 C -20 7 -14 -13 0 -26 Z" fill="#2D533F" fill-opacity="0.22"/>
      <path d="M -26 0 C -13 14 7 20 26 0 C 7 -20 -13 -14 -26 0 Z" fill="#2D533F" fill-opacity="0.22"/>
      <circle r="5" fill="#D8B454"/>
    </g>

    <text x="200" y="225" text-anchor="middle" font-family="serif" font-size="11" font-weight="700" fill="#A03F30" letter-spacing="2">
      ${safeGroup.toUpperCase()}
    </text>
    <text x="200" y="244" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="600" fill="#717971" letter-spacing="1.2">
      PHÂN LOẠI: ${safeCat.toUpperCase()}
    </text>

    <text x="200" y="278" text-anchor="middle" font-family="serif" font-size="16" font-weight="bold" fill="#1A1C1A">
      ${safeName}
    </text>

    <rect x="110" y="316" width="180" height="26" rx="13" fill="#2D533F" fill-opacity="0.08"/>
    <text x="200" y="333" text-anchor="middle" font-family="sans-serif" font-size="9" font-weight="600" fill="#2D533F" letter-spacing="0.8">
      BẢN GHI TƯ LIỆU · CHỜ NẠP ẢNH
    </text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Phân định slot trong bộ phối dựa trên category chuẩn hóa và tên gọi item
 */
export function categoryToSlot(category: string, name = ''): CostumeSlot {
  const cat = (category || '').trim();
  const lowerName = (name || '').toLowerCase();

  // 1. Mũ/khăn hoặc Khăn/mũ: phân định theo tên (khăn -> khan, mũ/mão -> mu)
  if (cat === 'Mũ/khăn' || cat === 'Khăn/mũ') {
    if (lowerName.includes('khăn')) return 'khan';
    if (lowerName.includes('mũ') || lowerName.includes('mão')) return 'mu';
    return 'khan';
  }

  // 2. Áo lót -> slot chuyên biệt ao_lot (lớp trong)
  if (cat === 'Áo lót') return 'ao_lot';

  // 3. Áo khoác, Áo lễ phục, Áo -> ao (lớp ngoài / áo chính)
  if (cat === 'Áo khoác' || cat === 'Áo lễ phục' || cat === 'Áo') return 'ao';

  // 4. Trang phục thân dưới hoặc Quần -> quan
  if (cat === 'Trang phục thân dưới' || cat === 'Quần') return 'quan';

  // 5. Váy hoặc Váy/quấn -> vay
  if (cat === 'Váy' || cat === 'Váy/quấn') return 'vay';

  // 6. Khăn -> khan
  if (cat === 'Khăn') return 'khan';

  // 7. Mũ -> mu
  if (cat === 'Mũ') return 'mu';

  // 8. Giày -> giay
  if (cat === 'Giày') return 'giay';

  // 9. Trang sức -> trang_suc
  if (cat === 'Trang sức') return 'trang_suc';

  // 10. Phụ kiện, Phụ kiện trang phục, Bộ phận trang phục -> phu_kien
  if (cat === 'Phụ kiện trang phục' || cat === 'Phụ kiện' || cat === 'Bộ phận trang phục') {
    return 'phu_kien';
  }

  // Fallback an toàn cho dữ liệu mở rộng
  const lcat = cat.toLowerCase();
  if (lcat.includes('lót') || lcat.includes('yếm')) return 'ao_lot';
  if (lcat.includes('áo')) return 'ao';
  if (lcat.includes('quần') || lcat.includes('thân dưới') || lcat.includes('khố')) return 'quan';
  if (lcat.includes('váy')) return 'vay';
  if (lcat.includes('khăn')) return 'khan';
  if (lcat.includes('mũ') || lcat.includes('mão')) return 'mu';
  if (lcat.includes('giày') || lcat.includes('hài') || lcat.includes('guốc')) return 'giay';
  if (lcat.includes('trang sức')) return 'trang_suc';

  return 'phu_kien';
}

/**
 * Trích xuất màu hex đại diện mang sắc thái văn hóa
 */
function deriveColorHex(category: string, group: string): string {
  const g = (group || '').toLowerCase();
  if (g.includes('huế') || g.includes('triều nguyễn')) return '#A03F30';
  if (g.includes('thái')) return '#2D533F';
  if (g.includes('dao')) return '#C0392B';
  if (g.includes('mường')) return '#8E44AD';
  if (g.includes('chăm')) return '#D35400';
  if (g.includes('khmer')) return '#D4AC0D';
  if (g.includes('pà thẻn')) return '#E74C3C';
  if (g.includes('tày')) return '#2980B9';
  if (category.includes('Áo')) return '#2D533F';
  if (category.includes('Khăn') || category.includes('Mũ')) return '#D8B454';
  return '#4A5568';
}

/**
 * Định nghĩa lại cross_cultural_flag:
 * True khi item có ít nhất một compatibilityRule hoặc outfit_membership
 * liên kết với item / outfit thuộc nhóm văn hóa khác; ngược lại false nếu chỉ thuần nội bộ.
 */
function determineCrossCulturalFlag(item: any): boolean {
  const itemGroup = (item.cultural_group || '').toLowerCase().trim();
  const rules = NORMALIZED_COMPATIBILITY_RULES.filter(
    (r) => r.item_a_id === item.id || r.item_b_id === item.id
  );
  const itemsMap = new Map((NORMALIZED_CATALOG.items || []).map((i: any) => [i.id, i]));
  const outfitsMap = new Map((NORMALIZED_CATALOG.outfits || []).map((o: any) => [o.outfit_id, o]));

  for (const r of rules) {
    const otherId = r.item_a_id === item.id ? r.item_b_id : r.item_a_id;
    const other = itemsMap.get(otherId);
    if (other) {
      const otherGroup = (other.cultural_group || '').toLowerCase().trim();
      if (itemGroup && otherGroup && itemGroup !== otherGroup) {
        return true;
      }
    }
  }

  if (Array.isArray(item.outfit_memberships)) {
    for (const m of item.outfit_memberships) {
      const outfit = outfitsMap.get(m.outfit_id);
      if (outfit) {
        const outGroup = (outfit.group || '').toLowerCase().trim();
        if (itemGroup && outGroup && itemGroup !== outGroup) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Phân cấp mức độ nghi lễ (ritual_level):
 * - 'sacred_ritual': tế tự, thờ cúng, chầu văn, tâm linh, hầu đồng.
 * - 'festive': nghi lễ, cưới hỏi, lễ tết, đại lễ, cung đình, phẩm cấp.
 * - 'daily': trang phục sinh hoạt, thường nhật.
 */
function determineRitualLevel(item: any): RitualLevel {
  const text = `${item.usage || ''} ${(item.tags || []).map((t: any) => (typeof t === 'string' ? t : `${t.type} ${t.value}`)).join(' ')} ${item.notes || ''} ${item.cultural_information_note || ''} ${item.description || ''}`.toLowerCase();

  if (
    text.includes('tế tự') ||
    text.includes('thờ cúng') ||
    text.includes('chầu văn') ||
    text.includes('tâm linh') ||
    text.includes('hầu đồng')
  ) {
    return 'sacred_ritual';
  }

  if (
    text.includes('nghi lễ') ||
    text.includes('cưới') ||
    text.includes('lễ hội') ||
    text.includes('đại lễ') ||
    text.includes('lễ tết') ||
    text.includes('lễ phục') ||
    text.includes('cung đình') ||
    text.includes('phẩm cấp') ||
    item.category === 'Áo lễ phục'
  ) {
    return 'festive';
  }

  return 'daily';
}

/**
 * Phân định độ tương thích giới tính (gender_affinity):
 * - 'nam': khi mô tả/sử dụng nêu rõ nam giới, cho nam, đàn ông, khố.
 * - 'nu': khi nêu rõ nữ giới, phụ nữ, thiếu nữ, yếm, tứ thân, mệnh phụ, xiêm, váy, áo nữ.
 * - 'all': khi dùng chung hoặc không phân biệt rõ trong nguồn tư liệu, không tự suy đoán.
 */
function determineGenderAffinity(item: any): 'all' | 'nam' | 'nu' {
  const lowerName = (item.name || '').toLowerCase();
  const text = `${lowerName} ${item.usage || ''} ${item.notes || ''} ${item.cultural_information_note || ''} ${item.description || ''}`.toLowerCase();

  if (
    item.id === 'item-kho' ||
    text.includes('nam giới') ||
    text.includes('cho nam ') ||
    text.includes('dành cho nam') ||
    text.includes('đàn ông')
  ) {
    return 'nam';
  }

  if (
    text.includes('nữ giới') ||
    text.includes('phụ nữ') ||
    text.includes('cho nữ') ||
    text.includes('thiếu nữ') ||
    text.includes('dành cho nữ') ||
    text.includes('mệnh phụ') ||
    text.includes('yếm') ||
    text.includes('tứ thân') ||
    lowerName.includes('áo nữ') ||
    lowerName.includes('xiêm') ||
    lowerName.includes('váy')
  ) {
    return 'nu';
  }

  return 'all';
}

/**
 * 77 BẢN GHI ITEMS CHUẨN HÓA V2
 */
export const NORMALIZED_ITEMS: CostumeItem[] = (NORMALIZED_CATALOG.items || []).map((item) => {
  const slot = categoryToSlot(item.category, item.name);
  const colorHex = deriveColorHex(item.category, item.cultural_group);
  const placeholderImg = createNeutralPlaceholder(
    item.name,
    item.category,
    item.cultural_group,
    item.subgroup
  );

  const resolvedImage =
    garmentImages[item.id] ||
    (typeof item.image_path === 'string' && item.image_path.trim() !== ''
      ? item.image_path
      : null);
  const finalImageUrl = resolvedImage || placeholderImg;

  return {
    id: item.id,
    name: item.name,
    category: item.category as GarmentCategory,
    slot,
    ethnic_group: item.cultural_group || 'Việt phục',
    culturalGroup: item.cultural_group,
    cultural_group: item.cultural_group,
    subgroup: item.subgroup || '',
    period_or_region: item.cultural_information_note || item.usage || 'Việt Nam',
    material: item.materials || 'Chất liệu theo tư liệu lịch sử',
    materials: item.materials,
    pattern_description: item.visual_features || 'Đặc điểm thị giác ghi nhận trong nguồn tư liệu.',
    patternDescription: item.visual_features,
    visual_features: item.visual_features,
    usage: item.usage,
    cultural_significance: item.description || '',
    culturalContext: item.description,
    source_verification:
      item.source_titles && item.source_titles.length > 0
        ? item.source_titles.join('; ')
        : item.verification_status || 'Chưa có thông tin xác minh độc lập',
    verification_status: item.verification_status,
    verificationStatus: item.verification_status,
    source_ids: item.source_ids || [],
    source_urls: item.source_urls || [],
    source_titles: item.source_titles || [],
    cultural_information_note: item.cultural_information_note,
    notes: item.notes || '',
    image_url: finalImageUrl,
    imageUrl: finalImageUrl,
    image_path: resolvedImage || null,
    imageReference: item.source_urls && item.source_urls.length > 0 ? item.source_urls[0] : null,
    ritual_level: determineRitualLevel(item),
    cross_cultural_flag: determineCrossCulturalFlag(item),
    selectable_independently: item.selectable_independently ?? true,
    is_structural_part: item.is_structural_part ?? false,
    gender_affinity: determineGenderAffinity(item),
    variant_group: item.variant_group || '',
    outfit_memberships: item.outfit_memberships || [],
    belongs_to_outfit_ids: item.belongs_to_outfit_ids || [],
    tags: item.tags ? item.tags.map((t: any) => `${t.type}:${t.value}`) : [],
    raw_tags: item.tags || [],
    pairing: item.pairing,
    compatibility_policy: item.compatibility_policy,
    color_hex: colorHex,
    is_personal: false
  };
});

/**
 * 21 BỘ THAM CHIẾU OUTFITS CHUẨN HÓA V2 -> TƯƠNG THÍCH MOCK_COLLECTIONS
 */
export const MOCK_COLLECTIONS: HeritageCollection[] = NORMALIZED_OUTFITS.map((o) => {
  const sampleTop =
    o.components.find((c) => c.slot.toLowerCase().includes('áo'))?.item_id ||
    o.components[0]?.item_id ||
    '';
  const sampleBottom =
    o.components.find(
      (c) =>
        c.slot.toLowerCase().includes('quần') ||
        c.slot.toLowerCase().includes('váy') ||
        c.slot.toLowerCase().includes('thân dưới')
    )?.item_id || '';
  const sampleHead =
    o.components.find(
      (c) => c.slot.toLowerCase().includes('khăn') || c.slot.toLowerCase().includes('mũ')
    )?.item_id || '';
  const sampleFoot =
    o.components.find(
      (c) => c.slot.toLowerCase().includes('giày') || c.slot.toLowerCase().includes('dép')
    )?.item_id || '';
  const sampleAccs = o.components
    .filter(
      (c) =>
        c.item_id !== sampleTop &&
        c.item_id !== sampleBottom &&
        c.item_id !== sampleHead &&
        c.item_id !== sampleFoot
    )
    .map((c) => c.item_id);

  return {
    id: o.outfit_id,
    title: o.normalized_name,
    subtitle: `${o.group}${o.subgroup ? ` · ${o.subgroup}` : ''}`,
    period_or_ethnic: o.group,
    description: o.history || o.usage,
    accent_color: '#2D533F',
    status: o.status,
    cautions: o.cautions,
    components_count: o.components.length,
    sample_outfit: {
      top_id: sampleTop,
      bottom_id: sampleBottom,
      head_id: sampleHead,
      footwear_id: sampleFoot,
      accessories_ids: sampleAccs
    },
    normalized_outfit: o
  };
});

/**
 * Xuất MOCK_HERITAGE_ITEMS tương thích tuyệt đối từ 77 items chuẩn hóa
 */
export const MOCK_HERITAGE_ITEMS: CostumeItem[] = NORMALIZED_ITEMS;

/**
 * Tra cứu quy tắc tương thích giữa 2 item cụ thể theo 168 compatibilityRules
 */
export function findCompatibilityRule(itemAId: string, itemBId: string): CompatibilityRule | null {
  return (
    NORMALIZED_COMPATIBILITY_RULES.find(
      (r) =>
        (r.item_a_id === itemAId && r.item_b_id === itemBId) ||
        (r.item_a_id === itemBId && r.item_b_id === itemAId)
    ) || null
  );
}

export interface OutfitCompatibilityEvaluation {
  status:
    | 'reference_match'
    | 'conditional_match'
    | 'alternative_conflict'
    | 'mostly_matched'
    | 'contemporary_remix';
  badgeTitle: string;
  badgeClass: string;
  matchedOutfit: NormalizedOutfit | null;
  matchedCount: number;
  totalCount: number;
  matchedItems: CostumeItem[];
  mismatchedItems: Array<{
    item: CostumeItem;
    reason: string;
  }>;
  ruleMessages: Array<{
    type: 'conflict' | 'condition' | 'co_member' | 'review' | 'sacred_warning';
    itemA: string;
    itemB: string;
    message: string;
    ruleId?: string;
  }>;
  explanation: string;
}

/**
 * Đánh giá tính chuẩn xác và tương thích của tổ hợp trang phục đang mặc
 * Chấm điểm khớp theo bộ tham chiếu thay vì yêu cầu cứng tất cả món phải thuộc 1 bộ.
 */
export function evaluateEquippedOutfitCompatibility(
  equippedItems: CostumeItem[]
): OutfitCompatibilityEvaluation {
  const items = equippedItems.filter(Boolean);
  if (items.length < 2) {
    return {
      status: 'contemporary_remix',
      badgeTitle: 'Đang chọn món',
      badgeClass: 'bg-stone-100 text-stone-700 border-stone-200',
      matchedOutfit: null,
      matchedCount: items.length,
      totalCount: items.length,
      matchedItems: items,
      mismatchedItems: [],
      ruleMessages: [],
      explanation: 'Hãy chọn thêm món để hệ thống đánh giá tương thích văn hóa.'
    };
  }

  // 1. Kiểm tra quy tắc cặp (Pairwise Compatibility Rules) & Cảnh báo thiêng liêng
  const ruleMessages: Array<{
    type: 'conflict' | 'condition' | 'co_member' | 'review' | 'sacred_warning';
    itemA: string;
    itemB: string;
    message: string;
    ruleId?: string;
  }> = [];

  let hasAlternativeConflict = false;
  let hasConditional = false;

  // Cảnh báo món tế tự / tín ngưỡng thiêng liêng (Hard Constraint)
  items.forEach((it) => {
    if (it.ritual_level === 'sacred_ritual') {
      ruleMessages.push({
        type: 'sacred_warning',
        itemA: it.name,
        itemB: '',
        message: `Lưu ý thiêng liêng: Món "${it.name}" mang ý nghĩa tế tự/tín ngưỡng (sacred_ritual). Không tùy tiện phối cho sự kiện thường nhật!`
      });
    }
  });

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i];
      const b = items[j];
      const rule = findCompatibilityRule(a.id, b.id);

      if (rule) {
        if (rule.status === 'alternative_not_simultaneous') {
          hasAlternativeConflict = true;
          ruleMessages.push({
            type: 'conflict',
            itemA: a.name,
            itemB: b.name,
            message: `Xung đột biến thể: ${a.name} và ${b.name} là phương án thay thế trong cùng bộ, không nên mặc đồng thời.`,
            ruleId: rule.relationship_id
          });
        } else if (rule.status === 'conditional_in_reference_context') {
          hasConditional = true;
          ruleMessages.push({
            type: 'condition',
            itemA: a.name,
            itemB: b.name,
            message: `Điều kiện kết hợp: ${rule.condition_a || rule.condition_b || rule.explanation}`,
            ruleId: rule.relationship_id
          });
        } else if (rule.status === 'candidate_requires_confirmation') {
          ruleMessages.push({
            type: 'review',
            itemA: a.name,
            itemB: b.name,
            message: `Cần xác nhận tư liệu: ${rule.explanation}`,
            ruleId: rule.relationship_id
          });
        } else if (rule.status === 'co_listed_in_reference_outfit') {
          ruleMessages.push({
            type: 'co_member',
            itemA: a.name,
            itemB: b.name,
            message: `Cùng thuộc bộ tham chiếu: ${rule.outfit_name}`,
            ruleId: rule.relationship_id
          });
        }
      }
    }
  }

  // 2. Chấm điểm khớp theo từng bộ tham chiếu trong NORMALIZED_OUTFITS
  let bestOutfit: NormalizedOutfit | null = null;
  let bestMatchedItems: CostumeItem[] = [];
  let bestMismatchedItems: Array<{ item: CostumeItem; reason: string }> = [];
  let maxMatchedCount = 0;

  for (const outfit of NORMALIZED_OUTFITS) {
    const matched: CostumeItem[] = [];
    const mismatched: Array<{ item: CostumeItem; reason: string }> = [];

    for (const item of items) {
      const belongs = (item.belongs_to_outfit_ids || []).includes(outfit.outfit_id);
      if (belongs) {
        matched.push(item);
      } else {
        let reason = `Không thuộc cấu trúc chuẩn của bộ ${outfit.normalized_name}`;
        if (item.cultural_group && outfit.group && item.cultural_group !== outfit.group) {
          reason = `Khác nhóm văn hóa (${item.cultural_group} so với ${outfit.group})`;
        }
        mismatched.push({ item, reason });
      }
    }

    if (matched.length > maxMatchedCount) {
      maxMatchedCount = matched.length;
      bestOutfit = outfit;
      bestMatchedItems = matched;
      bestMismatchedItems = mismatched;
    }
  }

  // 3. Phân định trạng thái tương thích
  if (hasAlternativeConflict) {
    return {
      status: 'alternative_conflict',
      badgeTitle: '⚠️ Xung đột biến thể (Không mặc đồng thời)',
      badgeClass: 'bg-red-100 text-red-800 border-red-300',
      matchedOutfit: bestOutfit,
      matchedCount: maxMatchedCount,
      totalCount: items.length,
      matchedItems: bestMatchedItems,
      mismatchedItems: bestMismatchedItems,
      ruleMessages,
      explanation: 'Bộ đồ đang chứa 2 món là phương án thay thế cho nhau trong cùng bộ tham chiếu.'
    };
  }

  if (bestOutfit && maxMatchedCount === items.length) {
    if (hasConditional) {
      return {
        status: 'conditional_match',
        badgeTitle: `Tương thích có điều kiện · ${bestOutfit.normalized_name} (${maxMatchedCount}/${items.length})`,
        badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
        matchedOutfit: bestOutfit,
        matchedCount: maxMatchedCount,
        totalCount: items.length,
        matchedItems: bestMatchedItems,
        mismatchedItems: [],
        ruleMessages,
        explanation: `Tất cả ${items.length} món đều thuộc tổ hợp tham chiếu ${bestOutfit.normalized_name}. Cần lưu ý các điều kiện phối kết hợp cụ thể.`
      };
    }
    return {
      status: 'reference_match',
      badgeTitle: `Khớp hoàn toàn chuẩn nguyên bản · ${bestOutfit.normalized_name} (${maxMatchedCount}/${items.length})`,
      badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      matchedOutfit: bestOutfit,
      matchedCount: maxMatchedCount,
      totalCount: items.length,
      matchedItems: bestMatchedItems,
      mismatchedItems: [],
      ruleMessages,
      explanation: `Tất cả ${items.length} món đang mặc đều thuộc bộ tham chiếu lịch sử: ${bestOutfit.normalized_name}.`
    };
  }

  if (bestOutfit && maxMatchedCount >= 2) {
    const mismatchNames = bestMismatchedItems.map((m) => m.item.name).join(', ');
    return {
      status: 'mostly_matched',
      badgeTitle: `Khớp phần lớn · ${bestOutfit.normalized_name} (${maxMatchedCount}/${items.length} món)`,
      badgeClass: 'bg-blue-100 text-blue-900 border-blue-300',
      matchedOutfit: bestOutfit,
      matchedCount: maxMatchedCount,
      totalCount: items.length,
      matchedItems: bestMatchedItems,
      mismatchedItems: bestMismatchedItems,
      ruleMessages,
      explanation: `Có ${maxMatchedCount}/${items.length} món khớp với bộ ${bestOutfit.normalized_name}. Có ${bestMismatchedItems.length} món phối xen kẽ: ${mismatchNames}.`
    };
  }

  return {
    status: 'contemporary_remix',
    badgeTitle: 'Phối cách tân / Giao thoa văn hóa',
    badgeClass: 'bg-stone-100 text-stone-800 border-stone-300',
    matchedOutfit: bestOutfit,
    matchedCount: maxMatchedCount,
    totalCount: items.length,
    matchedItems: bestMatchedItems,
    mismatchedItems: bestMismatchedItems,
    ruleMessages,
    explanation: 'Chưa có quan hệ đối chiếu trong cùng một bộ tư liệu tham chiếu gốc (Chế độ Phối sáng tạo / Remix đương đại).'
  };
}
