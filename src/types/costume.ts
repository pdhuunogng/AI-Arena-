/**
 * Costume and Heritage Type Definitions
 * Schema theo quy chuẩn AI ARENA 2026 - Việt Cổ Y Phong AI
 */

export type CostumeSlot = 'head' | 'top' | 'bottom' | 'footwear' | 'accessories';
export type Gender = 'nam' | 'nu' | 'nonbinary';
export type RitualLevel = 'daily' | 'festive' | 'sacred_ritual';

export interface CostumeItem {
  id: string;
  name: string;
  slot: CostumeSlot;
  ethnic_group: string; // 'Kinh', 'H'Mông', 'Chăm', 'Dao', 'Thái', 'Tây Nguyên', etc.
  period_or_region: string; // 'Thời Nguyễn', 'Thời Lê', 'Bắc Bộ', 'Tây Bắc', 'Nam Trung Bộ', etc.
  ritual_level: RitualLevel; // 'daily' | 'festive' | 'sacred_ritual'
  cross_cultural_flag: boolean; // true nếu cho phép phối giao thoa
  color_hex: string;
  material: string;
  pattern_description: string;
  cultural_significance: string;
  source_verification: string; // Tên tài liệu khảo cứu hoặc 'Chưa có thông tin xác minh'
  model_3d_url?: string;
  image_url: string;
  subgroup?: string; // e.g. H'Mông Hoa, Dao Đỏ, Thái Đen
  gender_affinity?: 'all' | 'nam' | 'nu';
}

export interface CurrentOutfitState {
  gender: Gender;
  slots: {
    head: CostumeItem | null;
    top: CostumeItem | null;
    bottom: CostumeItem | null;
    footwear: CostumeItem | null;
    accessories: CostumeItem[];
  };
  locked_slots: string[]; // ['head', 'top', ...]
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
  cultural_accuracy_score: string; // e.g. "95%"
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
  sample_outfit: {
    head_id: string;
    top_id: string;
    bottom_id: string;
    footwear_id: string;
    accessories_ids: string[];
  };
}
