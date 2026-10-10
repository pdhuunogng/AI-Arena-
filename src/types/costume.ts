/**
 * Costume and Heritage Type Definitions
 * Schema theo quy chuẩn VIỆT PHỤC REMIX - AI ARENA 2026
 * Chuẩn hóa theo Normalized Catalog V2
 */

export type GarmentCategory =
  | 'Áo'
  | 'Quần'
  | 'Váy'
  | 'Khăn'
  | 'Mũ'
  | 'Giày'
  | 'Trang sức'
  | 'Phụ kiện'
  | 'Mũ/khăn'
  | 'Áo lót'
  | 'Trang phục thân dưới'
  | 'Áo khoác'
  | 'Áo lễ phục'
  | 'Khăn/mũ'
  | 'Phụ kiện trang phục'
  | 'Bộ phận trang phục'
  | 'Váy/quấn';

export type CostumeSlot =
  | 'top'
  | 'bottom'
  | 'head'
  | 'footwear'
  | 'accessories'
  | 'ao_lot'
  | 'ao'
  | 'quan'
  | 'vay'
  | 'khan'
  | 'mu'
  | 'giay'
  | 'trang_suc'
  | 'phu_kien';

export type Gender = 'nam' | 'nu' | 'nonbinary';
export type RitualLevel = 'daily' | 'festive' | 'sacred_ritual';

export interface OutfitMembership {
  outfit_id: string;
  outfit_name: string;
  outfit_record_type?: string;
  slot: string;
  role: string;
  condition?: string;
  alternative_group?: string | null;
  evidence_note?: string;
  outfit_status?: string;
  source_ids?: string[];
  membership_status?: string;
  scope_note?: string;
}

export interface ItemPairingInfo {
  reference_outfit_ids: string[];
  co_listed_item_ids: string[];
  conditional_item_ids: string[];
  candidate_item_ids: string[];
  alternative_item_ids: string[];
  needs_review_item_ids: string[];
  pairing_rule_ids: string[];
}

export interface ItemTag {
  type: string;
  value: string;
}

export interface CostumeItem {
  id: string;
  name: string;
  image_url: string;
  imageUrl?: string | null;
  image_path?: string | null;
  slot: CostumeSlot;
  category: GarmentCategory;
  ethnic_group: string; // 'Kinh', 'Việt phục', 'H\'Mông', 'Chăm', 'Dao', 'Thái', 'Tày', etc.
  culturalGroup?: string;
  cultural_group?: string;
  subgroup?: string; // 'Hoàng tộc Huế', 'Thái Trắng', 'Thái Đen', 'Dao Tiền', 'Dao Đỏ', etc.
  period_or_region: string; // 'Thời Nguyễn', 'Bắc Bộ', 'Nam Bộ', etc.
  color_hex: string;
  material: string;
  materials?: string;
  pattern_description: string;
  patternDescription?: string;
  visual_features?: string;
  usage?: string;
  cultural_significance: string;
  culturalContext?: string;
  cultural_information_note?: string;
  source_verification: string;
  verification_status?: string;
  verificationStatus?: 'verified' | 'unverified' | 'pending' | string;
  source_ids?: string[];
  source_urls?: string[];
  source_titles?: string[];
  culturalAccuracyNotes?: string;
  notes?: string;
  imageReference?: string | null;
  reviewNote?: string;
  referenceLinks?: string[];
  ritual_level: RitualLevel;
  cross_cultural_flag: boolean;
  selectable_independently?: boolean;
  is_structural_part?: boolean;
  variant_group?: string;
  outfit_memberships?: OutfitMembership[];
  belongs_to_outfit_ids?: string[];
  tags?: string[];
  raw_tags?: ItemTag[];
  pairing?: ItemPairingInfo;
  compatibility_policy?: string;
  owner_uid?: string;
  is_personal?: boolean;
  storage_path?: string;
  createdAt?: number;
  updatedAt?: number;
  gender_affinity?: 'all' | 'nam' | 'nu';
}

export interface CurrentOutfitState {
  gender: Gender;
  slots: {
    // 9 Modular Garment Slots for VIỆT PHỤC REMIX
    ao_lot: CostumeItem | null;
    ao: CostumeItem | null;
    quan: CostumeItem | null;
    vay: CostumeItem | null;
    khan: CostumeItem | null;
    mu: CostumeItem | null;
    giay: CostumeItem | null;
    trang_suc: CostumeItem[];
    phu_kien: CostumeItem[];

    // Legacy compatibility aliases for existing lookbooks & server APIs
    head: CostumeItem | null;
    top: CostumeItem | null;
    bottom: CostumeItem | null;
    footwear: CostumeItem | null;
    accessories: CostumeItem[];
  };
  locked_slots: string[];
}

export interface AiSlotFeedback {
  item_name: string;
  material: string;
  color_hex?: string;
  cultural_notes: string;
}

export interface AiAdvisoryResult {
  outfit_id: string;
  outfit_name: string;
  ethnic_group: string;
  style_type: 'Nguyên bản truyền thống' | 'Phối cách tân / Giao thoa';
  cultural_accuracy_score: string;
  slots: {
    head: AiSlotFeedback;
    top: AiSlotFeedback;
    bottom: AiSlotFeedback;
    footwear: AiSlotFeedback;
    accessories: Array<{
      item_name: string;
      material: string;
      cultural_notes: string;
    }>;
  };
  overall_comment: string;
  warning_flags: string[];
  recommended_item_ids?: string[];
}

export interface LookbookRecord {
  id: string;
  timestamp: number;
  outfit_name: string;
  gender: Gender;
  ethnic_group: string;
  accuracy_score: string;
  style_type: string;
  slots: {
    head: CostumeItem | null;
    top: CostumeItem | null;
    bottom: CostumeItem | null;
    footwear: CostumeItem | null;
    accessories: CostumeItem[];
    ao_lot?: CostumeItem | null;
    ao?: CostumeItem | null;
    quan?: CostumeItem | null;
    vay?: CostumeItem | null;
    khan?: CostumeItem | null;
    mu?: CostumeItem | null;
    giay?: CostumeItem | null;
    trang_suc?: CostumeItem[];
    phu_kien?: CostumeItem[];
  };
  cultural_quote: string;
  curator_notes: string;
}

export interface OutfitComponentLink {
  item_id: string;
  slot: string;
  role: string;
  condition: string;
  alternative_group: string | null;
  evidence_note: string;
  item_name: string;
  category: string;
  cultural_group: string;
  subgroup: string;
  selectable_independently: boolean;
  is_structural_part: boolean;
  membership_status: string;
  pairing_group_id: string;
}

export interface NormalizedOutfit {
  seed_id: string;
  outfit_id: string;
  normalized_name: string;
  group: string;
  subgroup: string;
  record_type: string;
  history: string;
  usage: string;
  cautions: string;
  status: string;
  source_ids: string[];
  components: OutfitComponentLink[];
  source_sheet_record?: any;
  components_summary: string;
  source_urls: string[];
  component_item_ids: string[];
  required_item_ids: string[];
  alternative_groups: Record<string, string[]>;
  pairing_rule_ids: string[];
  compatibility_note: string;
}

export interface HeritageCollection {
  id: string;
  title: string;
  subtitle: string;
  period_or_ethnic: string;
  description: string;
  accent_color: string;
  cover_image?: string;
  status?: string;
  cautions?: string;
  components_count?: number;
  sample_outfit: {
    head_id?: string;
    top_id: string;
    bottom_id: string;
    footwear_id?: string;
    accessories_ids?: string[];
  };
  normalized_outfit?: NormalizedOutfit;
}

export interface OutfitItemLinkRecord {
  outfit_id: string;
  outfit_name: string;
  source_record_name: string;
  item_id: string;
  item_name: string;
  slot: string;
  role: string;
  condition: string;
  alternative_group: string | null;
  evidence_note: string;
  item_selectable_independently: boolean;
  order: number;
  membership_status: string;
  outfit_verification_status: string;
  item_category: string;
  cultural_group: string;
  subgroup: string;
  is_structural_part: boolean;
  selectable_independently: boolean;
  scope_note: string;
}

export interface ResearchSource {
  source_id: string;
  title: string;
  publisher: string;
  url: string;
  use_for: string;
}

export interface ReviewFlag {
  id: string;
  topic: string;
  issue: string;
  action: string;
  status: string;
}

export interface CompatibilityRule {
  relationship_id: string;
  item_a_id: string;
  item_a_name: string;
  item_b_id: string;
  item_b_name: string;
  outfit_id: string;
  outfit_name: string;
  scope: string;
  relationship_type: string;
  status:
    | 'conditional_in_reference_context'
    | 'candidate_requires_confirmation'
    | 'needs_review'
    | 'alternative_not_simultaneous'
    | 'co_listed_in_reference_outfit'
    | string;
  recommendation_mode: string;
  can_select_together: boolean;
  slot_a: string;
  slot_b: string;
  role_a: string;
  role_b: string;
  condition_a: string;
  condition_b: string;
  alternative_group_a: string | null;
  alternative_group_b: string | null;
  outfit_verification_status: string;
  source_ids: string[];
  source_urls: string[];
  explanation: string;
  policy_note: string;
}

export interface CompatibilityModelRule {
  status: string;
  meaning: string;
  usage: string;
}

export interface CompatibilityModel {
  version: string;
  principle: string;
  rules: CompatibilityModelRule[];
  default_for_unlinked_items: {
    status: string;
    can_recommend_as_traditional: boolean;
    note: string;
  };
  cross_outfit_policy: string;
}

export interface NormalizedCatalog {
  schemaVersion: number;
  catalogName: string;
  language: string;
  description: string;
  dataPolicy: any;
  outfits: NormalizedOutfit[];
  items: any[];
  outfitItemLinks: OutfitItemLinkRecord[];
  sources: ResearchSource[];
  reviewFlags: ReviewFlag[];
  imageImportTemplate: Array<{
    item_id: string;
    item_name: string;
    suggested_filename: string;
    image_path: string | null;
    notes: string;
  }>;
  compatibilityRules: CompatibilityRule[];
  compatibilityModel: CompatibilityModel;
  migrationNotes?: string[];
}
