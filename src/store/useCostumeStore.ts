import { create } from 'zustand';
import {
  CostumeItem,
  CostumeSlot,
  CurrentOutfitState,
  Gender,
  AiAdvisoryResult,
  LookbookRecord
} from '../types/costume';
import { MOCK_HERITAGE_ITEMS, MOCK_COLLECTIONS } from '../data/mockHeritageData';

export type ScreenTab = 'showcase' | 'studio' | 'archive' | 'lookbook';

interface CostumeStoreState {
  // Screen routing
  activeTab: ScreenTab;
  setActiveTab: (tab: ScreenTab) => void;

  // Outfit state
  outfit: CurrentOutfitState;
  setGender: (gender: Gender) => void;
  setSlotItem: (slot: CostumeSlot, item: CostumeItem | null) => void;
  toggleLockSlot: (slot: string) => void;
  isSlotLocked: (slot: string) => boolean;
  clearOutfit: () => void;
  loadCollection: (collectionId: string) => void;

  // Modals & drawers
  selectedSlotForWardrobe: CostumeSlot | null;
  setSelectedSlotForWardrobe: (slot: CostumeSlot | null) => void;
  selectedItemForDetail: CostumeItem | null;
  setSelectedItemForDetail: (item: CostumeItem | null) => void;

  // Wardrobe catalog & custom items
  heritageItems: CostumeItem[];
  customClosetItems: CostumeItem[];
  addCustomItem: (item: CostumeItem) => void;

  // Filters for Archive
  filters: {
    ethnicGroup: string;
    region: string;
    slot: CostumeSlot | 'all';
    ritualLevel: string;
    searchQuery: string;
  };
  setFilter: (key: string, value: string) => void;
  resetFilters: () => void;

  // AI Advisory state
  isAiLoading: boolean;
  aiAdvisoryResult: AiAdvisoryResult | null;
  aiError: string | null;
  setAiLoading: (loading: boolean) => void;
  setAiAdvisoryResult: (result: AiAdvisoryResult | null) => void;
  setAiError: (error: string | null) => void;
  applyAiOutfit: (result: AiAdvisoryResult) => void;

  // Lookbooks saved
  savedLookbooks: LookbookRecord[];
  saveCurrentToLookbook: (customNotes?: string) => LookbookRecord;
  deleteLookbook: (id: string) => void;
}

// Initial default outfit (Nhật Bình set)
const initialItemsMap = new Map(MOCK_HERITAGE_ITEMS.map((item) => [item.id, item]));

const defaultOutfit: CurrentOutfitState = {
  gender: 'nu',
  slots: {
    head: initialItemsMap.get('nb-head-01') || null,
    top: initialItemsMap.get('nb-top-01') || null,
    bottom: initialItemsMap.get('nb-bottom-01') || null,
    footwear: initialItemsMap.get('nb-foot-01') || null,
    accessories: [initialItemsMap.get('nb-acc-01')].filter(Boolean) as CostumeItem[]
  },
  locked_slots: ['top'] // Lock top by default to demo mechanism 1
};

export const useCostumeStore = create<CostumeStoreState>((set, get) => ({
  activeTab: 'showcase',
  setActiveTab: (tab) => set({ activeTab: tab }),

  outfit: defaultOutfit,

  setGender: (gender) =>
    set((state) => ({
      outfit: {
        ...state.outfit,
        gender
      }
    })),

  setSlotItem: (slot, item) =>
    set((state) => {
      if (slot === 'accessories') {
        if (!item) {
          return {
            outfit: {
              ...state.outfit,
              slots: {
                ...state.outfit.slots,
                accessories: []
              }
            }
          };
        }
        const exists = state.outfit.slots.accessories.some((acc) => acc.id === item.id);
        const newAccessories = exists
          ? state.outfit.slots.accessories.filter((acc) => acc.id !== item.id)
          : [...state.outfit.slots.accessories, item];
        return {
          outfit: {
            ...state.outfit,
            slots: {
              ...state.outfit.slots,
              accessories: newAccessories
            }
          }
        };
      }

      return {
        outfit: {
          ...state.outfit,
          slots: {
            ...state.outfit.slots,
            [slot]: item
          }
        }
      };
    }),

  toggleLockSlot: (slot) =>
    set((state) => {
      const isLocked = state.outfit.locked_slots.includes(slot);
      const newLocked = isLocked
        ? state.outfit.locked_slots.filter((s) => s !== slot)
        : [...state.outfit.locked_slots, slot];
      return {
        outfit: {
          ...state.outfit,
          locked_slots: newLocked
        }
      };
    }),

  isSlotLocked: (slot) => {
    return get().outfit.locked_slots.includes(slot);
  },

  clearOutfit: () =>
    set((state) => ({
      outfit: {
        ...state.outfit,
        slots: {
          head: null,
          top: null,
          bottom: null,
          footwear: null,
          accessories: []
        },
        locked_slots: []
      },
      aiAdvisoryResult: null
    })),

  loadCollection: (collectionId) => {
    const col = MOCK_COLLECTIONS.find((c) => c.id === collectionId);
    if (!col) return;
    const allItems = [...get().heritageItems, ...get().customClosetItems];
    const findItem = (id: string) => allItems.find((i) => i.id === id) || null;

    set((state) => ({
      outfit: {
        ...state.outfit,
        slots: {
          head: findItem(col.sample_outfit.head_id),
          top: findItem(col.sample_outfit.top_id),
          bottom: findItem(col.sample_outfit.bottom_id),
          footwear: findItem(col.sample_outfit.footwear_id),
          accessories: col.sample_outfit.accessories_ids
            .map((id) => findItem(id))
            .filter(Boolean) as CostumeItem[]
        },
        locked_slots: ['top']
      },
      activeTab: 'studio',
      aiAdvisoryResult: null
    }));
  },

  selectedSlotForWardrobe: null,
  setSelectedSlotForWardrobe: (slot) => set({ selectedSlotForWardrobe: slot }),

  selectedItemForDetail: null,
  setSelectedItemForDetail: (item) => set({ selectedItemForDetail: item }),

  heritageItems: MOCK_HERITAGE_ITEMS,
  customClosetItems: [],

  addCustomItem: (item) =>
    set((state) => ({
      customClosetItems: [item, ...state.customClosetItems]
    })),

  filters: {
    ethnicGroup: 'all',
    region: 'all',
    slot: 'all',
    ritualLevel: 'all',
    searchQuery: ''
  },

  setFilter: (key, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value
      }
    })),

  resetFilters: () =>
    set({
      filters: {
        ethnicGroup: 'all',
        region: 'all',
        slot: 'all',
        ritualLevel: 'all',
        searchQuery: ''
      }
    }),

  isAiLoading: false,
  aiAdvisoryResult: null,
  aiError: null,
  setAiLoading: (loading) => set({ isAiLoading: loading, aiError: null }),
  setAiAdvisoryResult: (result) => set({ aiAdvisoryResult: result }),
  setAiError: (error) => set({ aiError: error }),

  applyAiOutfit: (result) => {
    const allItems = [...get().heritageItems, ...get().customClosetItems];
    const currentOutfit = get().outfit;
    const locked = currentOutfit.locked_slots;

    const findItemByNameOrId = (nameOrId: string, slot: CostumeSlot) => {
      const match = allItems.find(
        (i) =>
          i.slot === slot &&
          (i.id === nameOrId ||
            i.name.toLowerCase().includes(nameOrId.toLowerCase()) ||
            nameOrId.toLowerCase().includes(i.name.toLowerCase()))
      );
      return match || null;
    };

    // If result provides recommended_item_ids, use them directly
    if (result.recommended_item_ids && result.recommended_item_ids.length > 0) {
      const newSlots = { ...currentOutfit.slots };
      result.recommended_item_ids.forEach((id) => {
        const item = allItems.find((i) => i.id === id);
        if (item && !locked.includes(item.slot)) {
          if (item.slot === 'accessories') {
            if (!newSlots.accessories.some((a) => a.id === item.id)) {
              newSlots.accessories = [...newSlots.accessories, item];
            }
          } else {
            newSlots[item.slot] = item;
          }
        }
      });
      set({
        outfit: {
          ...currentOutfit,
          slots: newSlots
        }
      });
      return;
    }

    // Otherwise match by slot names
    const newSlots = { ...currentOutfit.slots };
    if (!locked.includes('head') && result.slots.head?.item_name) {
      newSlots.head = findItemByNameOrId(result.slots.head.item_name, 'head') || newSlots.head;
    }
    if (!locked.includes('top') && result.slots.top?.item_name) {
      newSlots.top = findItemByNameOrId(result.slots.top.item_name, 'top') || newSlots.top;
    }
    if (!locked.includes('bottom') && result.slots.bottom?.item_name) {
      newSlots.bottom = findItemByNameOrId(result.slots.bottom.item_name, 'bottom') || newSlots.bottom;
    }
    if (!locked.includes('footwear') && result.slots.footwear?.item_name) {
      newSlots.footwear = findItemByNameOrId(result.slots.footwear.item_name, 'footwear') || newSlots.footwear;
    }
    if (!locked.includes('accessories') && result.slots.accessories?.length > 0) {
      const accMatches = result.slots.accessories
        .map((acc) => findItemByNameOrId(acc.item_name, 'accessories'))
        .filter(Boolean) as CostumeItem[];
      if (accMatches.length > 0) {
        newSlots.accessories = accMatches;
      }
    }

    set({
      outfit: {
        ...currentOutfit,
        slots: newSlots
      }
    });
  },

  savedLookbooks: [
    {
      id: 'lookbook-seed-01',
      timestamp: Date.now() - 3600000 * 24,
      outfit_name: 'Nhật Bình Cung Đình Huế · Điển Lễ Hoàng Gia',
      gender: 'nu',
      ethnic_group: 'Kinh',
      accuracy_score: '98%',
      style_type: 'Nguyên bản truyền thống',
      slots: defaultOutfit.slots,
      cultural_quote: 'Áo xẻ giữa thân, viền ngũ sắc tượng trưng ngũ hành, phượng hàm thư ngậm lời chúc phúc trường thọ thiên thu.',
      curator_notes: 'Set đồ chuẩn mực cho đại lễ và không gian cung đình Cố Đô.'
    }
  ],

  saveCurrentToLookbook: (customNotes) => {
    const current = get().outfit;
    const aiResult = get().aiAdvisoryResult;
    const topName = current.slots.top?.name || 'Trang phục Việt Cổ';
    const ethnic = current.slots.top?.ethnic_group || 'Kinh';

    const newRecord: LookbookRecord = {
      id: `lb-${Date.now()}`,
      timestamp: Date.now(),
      outfit_name: aiResult?.outfit_name || `${topName} Phối Chuẩn Sắc`,
      gender: current.gender,
      ethnic_group: aiResult?.ethnic_group || ethnic,
      accuracy_score: aiResult?.cultural_accuracy_score || '95%',
      style_type: aiResult?.style_type || 'Nguyên bản truyền thống',
      slots: { ...current.slots },
      cultural_quote:
        aiResult?.overall_comment ||
        'Y phục là tấm gương phản chiếu tâm hồn dân tộc, gìn giữ hồn cốt qua từng đường kim tơ tằm.',
      curator_notes: customNotes || 'Lưu từ phòng phối đồ Việt Cổ Y Phong AI ARENA 2026.'
    };

    set((state) => ({
      savedLookbooks: [newRecord, ...state.savedLookbooks]
    }));

    return newRecord;
  },

  deleteLookbook: (id) =>
    set((state) => ({
      savedLookbooks: state.savedLookbooks.filter((item) => item.id !== id)
    }))
}));
