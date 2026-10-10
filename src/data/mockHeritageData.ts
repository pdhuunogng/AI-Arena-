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
 * Phân định slot trong bộ phối dựa trên category chuẩn hóa
 */
export function categoryToSlot(category: string): CostumeSlot {
  const cat = (category || '').toLowerCase();
  if (cat.includes('áo')) return 'ao';
  if (cat.includes('quần')) return 'quan';
  if (cat.includes('váy')) return 'vay';
  if (cat.includes('khăn')) return 'khan';
  if (cat.includes('mũ')) return 'mu';
  if (cat.includes('giày')) return 'giay';
  if (cat.includes('trang sức')) return 'trang_suc';
  if (cat.includes('thân dưới') || cat.includes('khố')) return 'quan';
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
 * 77 BẢN GHI ITEMS CHUẨN HÓA V2
 */
export const NORMALIZED_ITEMS: CostumeItem[] = (NORMALIZED_CATALOG.items || []).map((item) => {
  const slot = categoryToSlot(item.category);
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
    ritual_level:
      item.usage && (item.usage.includes('nghi lễ') || item.usage.includes('cưới') || item.usage.includes('tế tự'))
        ? 'festive'
        : 'daily',
    cross_cultural_flag: !(
      item.compatibility_policy &&
      item.compatibility_policy.includes('not automatically compatible')
    ),
    selectable_independently: item.selectable_independently ?? true,
    is_structural_part: item.is_structural_part ?? false,
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

/**
 * Đánh giá tính chuẩn xác và tương thích của tổ hợp trang phục đang mặc
 */
export function evaluateEquippedOutfitCompatibility(equippedItems: CostumeItem[]): {
  status: 'reference_match' | 'conditional_match' | 'alternative_conflict' | 'contemporary_remix';
  badgeTitle: string;
  badgeClass: string;
  matchedOutfit: NormalizedOutfit | null;
  ruleMessages: Array<{
    type: 'conflict' | 'condition' | 'co_member' | 'review';
    itemA: string;
    itemB: string;
    message: string;
    ruleId?: string;
  }>;
  explanation: string;
} {
  const items = equippedItems.filter(Boolean);
  if (items.length < 2) {
    return {
      status: 'contemporary_remix',
      badgeTitle: 'Đang chọn món',
      badgeClass: 'bg-stone-100 text-stone-700',
      matchedOutfit: null,
      ruleMessages: [],
      explanation: 'Hãy chọn thêm món để hệ thống đánh giá tương thích văn hóa.'
    };
  }

  // Check pairwise rules
  const ruleMessages: Array<{
    type: 'conflict' | 'condition' | 'co_member' | 'review';
    itemA: string;
    itemB: string;
    message: string;
    ruleId?: string;
  }> = [];

  let hasAlternativeConflict = false;
  let hasConditional = false;

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
            message: `Xung đột: ${a.name} và ${b.name} là phương án thay thế trong cùng bộ, không nên mặc đồng thời.`,
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
            message: `Cần xác nhận ảnh/mẫu: ${rule.explanation}`,
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

  // Find if all items belong to a single reference outfit
  const itemOutfitSets = items.map((it) => new Set(it.belongs_to_outfit_ids || []));
  const commonOutfitIds = (items[0].belongs_to_outfit_ids || []).filter((oid) =>
    itemOutfitSets.every((s) => s.has(oid))
  );

  const matchedOutfit = commonOutfitIds.length > 0
    ? NORMALIZED_OUTFITS.find((o) => o.outfit_id === commonOutfitIds[0]) || null
    : null;

  if (hasAlternativeConflict) {
    return {
      status: 'alternative_conflict',
      badgeTitle: '⚠️ Xung đột biến thể (Alternative Not Simultaneous)',
      badgeClass: 'bg-red-100 text-red-800 border-red-300',
      matchedOutfit,
      ruleMessages,
      explanation: 'Bộ đồ đang chứa 2 món là phương án thay thế cho nhau theo tư liệu nghiên cứu.'
    };
  }

  if (matchedOutfit) {
    if (hasConditional) {
      return {
        status: 'conditional_match',
        badgeTitle: `Tương thích có điều kiện · ${matchedOutfit.normalized_name}`,
        badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
        matchedOutfit,
        ruleMessages,
        explanation: `Bộ trang phục khớp với tổ hợp tham chiếu ${matchedOutfit.normalized_name}. Cần lưu ý các điều kiện kết hợp chi tiết.`
      };
    }
    return {
      status: 'reference_match',
      badgeTitle: `Chuẩn nguyên bản · ${matchedOutfit.normalized_name}`,
      badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      matchedOutfit,
      ruleMessages,
      explanation: `Tất cả các món đều thuộc tổ hợp tham chiếu lịch sử: ${matchedOutfit.normalized_name}.`
    };
  }

  return {
    status: 'contemporary_remix',
    badgeTitle: 'Phối cách tân / Giao thoa văn hóa',
    badgeClass: 'bg-stone-100 text-stone-800 border-stone-300',
    matchedOutfit: null,
    ruleMessages,
    explanation: 'Chưa có quan hệ đối chiếu trong cùng một bộ tư liệu tham chiếu gốc (Chế độ Phối sáng tạo / Remix đương đại).'
  };
}
