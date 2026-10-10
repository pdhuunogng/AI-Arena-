/**
 * Costume and Heritage Type Definitions
 * Schema theo quy chuẩn VIỆT PHỤC REMIX - AI ARENA 2026
 */

export type GarmentCategory =
  | 'Áo'
  | 'Quần'
  | 'Váy'
  | 'Khăn'
  | 'Mũ'
  | 'Giày'
  | 'Trang sức'
  | 'Phụ kiện';

export type CostumeSlot =
  | 'top'
  | 'bottom'
  | 'head'
  | 'footwear'
  | 'accessories'
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

export interface CostumeItem {
  id: string;
  name: string;
  image_url: string;
  slot: CostumeSlot;
  category: GarmentCategory;
  ethnic_group: string; // 'Kinh', 'H\'Mông', 'Chăm', 'Dao', 'Thái', 'Tày', etc.
  subgroup?: string; // 'Hoàng tộc Huế', 'H\'Mông Hoa', 'Thái Trắng', 'Dao Đỏ', etc.
  period_or_region: string; // 'Thời Nguyễn', 'Tây Bắc', 'Nam Trung Bộ', etc.
  color_hex: string;
  material: string;
  pattern_description: string;
  cultural_significance: string;
  source_verification: string; // Tên tài liệu khảo cứu hoặc 'Chưa có thông tin xác minh'
  ritual_level: RitualLevel;
  cross_cultural_flag: boolean; // true nếu cho phép phối giao thoa / cách tân
  owner_uid?: string; // UID của người dùng tải lên cho tủ đồ cá nhân
  is_personal?: boolean; // true nếu là item người dùng tự thêm
  storage_path?: string; // Đường dẫn Firebase Storage nếu có
  createdAt?: number;
  updatedAt?: number;
  gender_affinity?: 'all' | 'nam' | 'nu';
  tags?: string[];
}

export interface CurrentOutfitState {
  gender: Gender;
  slots: {
    // 8 Modular Garment Slots for VIỆT PHỤC REMIX
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
  locked_slots: string[]; // Danh sách slot bị khóa: ['ao', 'quan', ...]
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
  cultural_accuracy_score: string; // Ví dụ: "95%"
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
    ao?: CostumeItem | null;
    quan?: CostumeItem | null;
    vay?: CostumeItem | null;
    khan?: CostumeItem | null;
    mu?: CostumeItem | null;
    giay?: CostumeItem | null;
  };
  cultural_quote: string;
  curator_notes: string;
}

export interface HeritageCollection {
  id: string;
  title: string;
  subtitle: string;
  period_or_ethnic: string;
  description: string;
  accent_color: string;
  cover_image?: string;
  sample_outfit: {
    head_id?: string;
    top_id: string;
    bottom_id: string;
    footwear_id?: string;
    accessories_ids?: string[];
  };
}
