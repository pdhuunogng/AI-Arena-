import { create } from 'zustand';
import {
  CostumeItem,
  CostumeSlot,
  CurrentOutfitState,
  Gender,
  AiAdvisoryResult,
  LookbookRecord,
  GarmentCategory
} from '../types/costume';
import { MOCK_HERITAGE_ITEMS, MOCK_COLLECTIONS } from '../data/mockHeritageData';
import {
  fetchPersonalCloset,
  uploadAndSaveGarment,
  deletePersonalGarment as deleteGarmentFromStorage,
  UploadGarmentPayload,
  UploadResult,
  categoryToSlot
} from '../lib/closetService';

export type ScreenTab = 'showcase' | 'studio' | 'archive' | 'lookbook';

interface CostumeStoreState {
  // Screen routing
  activeTab: ScreenTab;
  setActiveTab: (tab: ScreenTab) => void;

  // Outfit state
  outfit: CurrentOutfitState;
  setGender: (gender: Gender) => void;
  setSlotItem: (slot: string, item: CostumeItem | null) => void;
  removeSlotItem: (slot: string) => void;
  toggleLockSlot: (slot: string) => void;
  isSlotLocked: (slot: string) => boolean;
  clearOutfit: () => void;
  loadCollection: (collectionId: string) => void;

  // Modals & drawers
  selectedSlotForWardrobe: string | null;
  setSelectedSlotForWardrobe: (slot: string | null) => void;
  selectedItemForDetail: CostumeItem | null;
  setSelectedItemForDetail: (item: CostumeItem | null) => void;

  // Wardrobe catalog & personal closet
  heritageItems: CostumeItem[];
  customClosetItems: CostumeItem[];
  isClosetLoading: boolean;
  initPersonalCloset: (uid?: string) => Promise<void>;
  addPersonalGarment: (payload: UploadGarmentPayload) => Promise<UploadResult>;
  deletePersonalGarmentItem: (id: string, uid?: string) => Promise<void>;

  // Filters for Archive
  filters: {
    ethnicGroup: string;
    subgroup: string;
    region: string;
    category: GarmentCategory | 'all';
    slot: CostumeSlot | 'all';
    ritualLevel: string;
    verificationStatus: string;
    outfitId: string;
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

const defaultHead = initialItemsMap.get('item-khan-vanh-nhat-binh') || initialItemsMap.get('nb-head-01') || null;
const defaultTop = initialItemsMap.get('item-ao-nhat-binh') || initialItemsMap.get('nb-top-01') || null;
const defaultBottom = initialItemsMap.get('item-xiem-trang-nhat-binh') || initialItemsMap.get('nb-bottom-01') || null;
const defaultFoot = initialItemsMap.get('item-quan-trang-nhat-binh') || null;
const defaultAcc = initialItemsMap.get('item-tram-hoa-nhat-binh') || initialItemsMap.get('nb-acc-01') || null;

const defaultOutfit: CurrentOutfitState = {
  gender: 'nu',
  slots: {
    // 8 slots
    ao: defaultTop,
    quan: null,
    vay: defaultBottom,
    khan: defaultHead,
    mu: null,
    giay: defaultFoot,
    trang_suc: defaultAcc ? [defaultAcc] : [],
    phu_kien: [],

    // Legacy compatibility mirrors
    head: defaultHead,
    top: defaultTop,
    bottom: defaultBottom,
    footwear: defaultFoot,
    accessories: defaultAcc ? [defaultAcc] : []
  },
  locked_slots: ['ao', 'top']
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

  setSlotItem: (slotKey, item) =>
    set((state) => {
      const currentSlots = { ...state.outfit.slots };

      // Handle 8 distinct slots and legacy mirrors
      if (slotKey === 'ao' || slotKey === 'top') {
        currentSlots.ao = item;
        currentSlots.top = item;
      } else if (slotKey === 'quan') {
        currentSlots.quan = item;
        if (item) {
          currentSlots.vay = null; // Quần and Váy are mutually alternative bottom garments
          currentSlots.bottom = item;
        } else if (currentSlots.bottom?.id === currentSlots.quan?.id) {
          currentSlots.bottom = null;
        }
      } else if (slotKey === 'vay') {
        currentSlots.vay = item;
        if (item) {
          currentSlots.quan = null;
          currentSlots.bottom = item;
        } else if (currentSlots.bottom?.id === currentSlots.vay?.id) {
          currentSlots.bottom = null;
        }
      } else if (slotKey === 'bottom') {
        currentSlots.bottom = item;
        if (item?.category === 'Váy') {
          currentSlots.vay = item;
          currentSlots.quan = null;
        } else {
          currentSlots.quan = item;
          currentSlots.vay = null;
        }
      } else if (slotKey === 'khan') {
        currentSlots.khan = item;
        if (item) {
          currentSlots.mu = null;
          currentSlots.head = item;
        } else if (currentSlots.head?.id === currentSlots.khan?.id) {
          currentSlots.head = null;
        }
      } else if (slotKey === 'mu') {
        currentSlots.mu = item;
        if (item) {
          currentSlots.khan = null;
          currentSlots.head = item;
        } else if (currentSlots.head?.id === currentSlots.mu?.id) {
          currentSlots.head = null;
        }
      } else if (slotKey === 'head') {
        currentSlots.head = item;
        if (item?.category === 'Mũ') {
          currentSlots.mu = item;
          currentSlots.khan = null;
        } else {
          currentSlots.khan = item;
          currentSlots.mu = null;
        }
      } else if (slotKey === 'giay' || slotKey === 'footwear') {
        currentSlots.giay = item;
        currentSlots.footwear = item;
      } else if (slotKey === 'trang_suc') {
        if (!item) {
          currentSlots.trang_suc = [];
        } else {
          const exists = currentSlots.trang_suc.some((a) => a.id === item.id);
          currentSlots.trang_suc = exists
            ? currentSlots.trang_suc.filter((a) => a.id !== item.id)
            : [...currentSlots.trang_suc, item];
        }
        currentSlots.accessories = [...currentSlots.trang_suc, ...currentSlots.phu_kien];
      } else if (slotKey === 'phu_kien') {
        if (!item) {
          currentSlots.phu_kien = [];
        } else {
          const exists = currentSlots.phu_kien.some((a) => a.id === item.id);
          currentSlots.phu_kien = exists
            ? currentSlots.phu_kien.filter((a) => a.id !== item.id)
            : [...currentSlots.phu_kien, item];
        }
        currentSlots.accessories = [...currentSlots.trang_suc, ...currentSlots.phu_kien];
      } else if (slotKey === 'accessories') {
        if (!item) {
          currentSlots.accessories = [];
          currentSlots.trang_suc = [];
          currentSlots.phu_kien = [];
        } else {
          const exists = currentSlots.accessories.some((a) => a.id === item.id);
          currentSlots.accessories = exists
            ? currentSlots.accessories.filter((a) => a.id !== item.id)
            : [...currentSlots.accessories, item];
          currentSlots.trang_suc = currentSlots.accessories.filter((a) => a.category === 'Trang sức');
          currentSlots.phu_kien = currentSlots.accessories.filter((a) => a.category !== 'Trang sức');
        }
      }

      return {
        outfit: {
          ...state.outfit,
          slots: currentSlots
        }
      };
    }),

  removeSlotItem: (slotKey) => {
    get().setSlotItem(slotKey, null);
  },

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
          ao: null,
          quan: null,
          vay: null,
          khan: null,
          mu: null,
          giay: null,
          trang_suc: [],
          phu_kien: [],
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
    const findItem = (id?: string) => (id ? allItems.find((i) => i.id === id) || null : null);

    if (col.normalized_outfit && col.normalized_outfit.components && col.normalized_outfit.components.length > 0) {
      const newSlots = {
        ao: null as CostumeItem | null,
        quan: null as CostumeItem | null,
        vay: null as CostumeItem | null,
        khan: null as CostumeItem | null,
        mu: null as CostumeItem | null,
        giay: null as CostumeItem | null,
        trang_suc: [] as CostumeItem[],
        phu_kien: [] as CostumeItem[],
        head: null as CostumeItem | null,
        top: null as CostumeItem | null,
        bottom: null as CostumeItem | null,
        footwear: null as CostumeItem | null,
        accessories: [] as CostumeItem[]
      };

      for (const comp of col.normalized_outfit.components) {
        const item = findItem(comp.item_id);
        if (!item) continue;
        const slot = item.slot;
        const cslot = comp.slot.toLowerCase();

        if ((slot === 'ao' || cslot.includes('áo')) && !newSlots.ao) {
          newSlots.ao = item;
          newSlots.top = item;
        } else if ((slot === 'vay' || cslot.includes('váy')) && !newSlots.vay) {
          newSlots.vay = item;
          if (!newSlots.bottom) newSlots.bottom = item;
        } else if ((slot === 'quan' || cslot.includes('quần') || cslot.includes('thân dưới')) && !newSlots.quan) {
          newSlots.quan = item;
          if (!newSlots.bottom) newSlots.bottom = item;
        } else if ((slot === 'khan' || cslot.includes('khăn')) && !newSlots.khan) {
          newSlots.khan = item;
          if (!newSlots.head) newSlots.head = item;
        } else if ((slot === 'mu' || cslot.includes('mũ')) && !newSlots.mu) {
          newSlots.mu = item;
          if (!newSlots.head) newSlots.head = item;
        } else if (slot === 'giay' && !newSlots.giay) {
          newSlots.giay = item;
          newSlots.footwear = item;
        } else if (slot === 'trang_suc' || cslot.includes('trang sức')) {
          if (!newSlots.trang_suc.some((t) => t.id === item.id)) {
            newSlots.trang_suc.push(item);
            newSlots.accessories.push(item);
          }
        } else {
          if (!newSlots.phu_kien.some((p) => p.id === item.id)) {
            newSlots.phu_kien.push(item);
            newSlots.accessories.push(item);
          }
        }
      }

      set((state) => ({
        outfit: {
          ...state.outfit,
          slots: newSlots,
          locked_slots: ['ao', 'top']
        },
        activeTab: 'studio',
        aiAdvisoryResult: null
      }));
      return;
    }

    const top = findItem(col.sample_outfit.top_id);
    const bottom = findItem(col.sample_outfit.bottom_id);
    const head = findItem(col.sample_outfit.head_id);
    const foot = findItem(col.sample_outfit.footwear_id);
    const accs = (col.sample_outfit.accessories_ids || [])
      .map((id) => findItem(id))
      .filter(Boolean) as CostumeItem[];

    const isVay = bottom?.category === 'Váy' || bottom?.slot === 'vay';
    const isMu = head?.category === 'Mũ' || head?.slot === 'mu';

    set((state) => ({
      outfit: {
        ...state.outfit,
        slots: {
          ao: top,
          quan: isVay ? null : bottom,
          vay: isVay ? bottom : null,
          khan: isMu ? null : head,
          mu: isMu ? head : null,
          giay: foot,
          trang_suc: accs.filter((a) => a.category === 'Trang sức'),
          phu_kien: accs.filter((a) => a.category !== 'Trang sức'),
          head,
          top,
          bottom,
          footwear: foot,
          accessories: accs
        },
        locked_slots: ['ao', 'top']
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
  isClosetLoading: false,

  initPersonalCloset: async (uid) => {
    set({ isClosetLoading: true });
    try {
      const items = await fetchPersonalCloset(uid);
      set({ customClosetItems: items, isClosetLoading: false });
    } catch (err) {
      console.error('Failed to init personal closet:', err);
      set({ isClosetLoading: false });
    }
  },

  addPersonalGarment: async (payload) => {
    const res = await uploadAndSaveGarment(payload);
    if (res.success && res.item) {
      set((state) => ({
        customClosetItems: [res.item!, ...state.customClosetItems.filter((i) => i.id !== res.item!.id)]
      }));
    }
    return res;
  },

  deletePersonalGarmentItem: async (id, uid) => {
    await deleteGarmentFromStorage(id, uid);
    set((state) => ({
      customClosetItems: state.customClosetItems.filter((i) => i.id !== id)
    }));
  },

  filters: {
    ethnicGroup: 'all',
    subgroup: 'all',
    region: 'all',
    category: 'all',
    slot: 'all',
    ritualLevel: 'all',
    verificationStatus: 'all',
    outfitId: 'all',
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
        subgroup: 'all',
        region: 'all',
        category: 'all',
        slot: 'all',
        ritualLevel: 'all',
        verificationStatus: 'all',
        outfitId: 'all',
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
        if (item) {
          const isLocked = locked.includes(item.slot) || (item.category && locked.includes(item.category.toLowerCase()));
          if (!isLocked) {
            if (item.category === 'Áo') {
              newSlots.ao = item;
              newSlots.top = item;
            } else if (item.category === 'Quần') {
              newSlots.quan = item;
              newSlots.vay = null;
              newSlots.bottom = item;
            } else if (item.category === 'Váy') {
              newSlots.vay = item;
              newSlots.quan = null;
              newSlots.bottom = item;
            } else if (item.category === 'Khăn') {
              newSlots.khan = item;
              newSlots.mu = null;
              newSlots.head = item;
            } else if (item.category === 'Mũ') {
              newSlots.mu = item;
              newSlots.khan = null;
              newSlots.head = item;
            } else if (item.category === 'Giày') {
              newSlots.giay = item;
              newSlots.footwear = item;
            } else if (item.category === 'Trang sức') {
              if (!newSlots.trang_suc.some((a) => a.id === item.id)) {
                newSlots.trang_suc = [...newSlots.trang_suc, item];
              }
              newSlots.accessories = [...newSlots.trang_suc, ...newSlots.phu_kien];
            } else if (item.category === 'Phụ kiện') {
              if (!newSlots.phu_kien.some((a) => a.id === item.id)) {
                newSlots.phu_kien = [...newSlots.phu_kien, item];
              }
              newSlots.accessories = [...newSlots.trang_suc, ...newSlots.phu_kien];
            }
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
    if (!locked.includes('head') && !locked.includes('khan') && !locked.includes('mu') && result.slots.head?.item_name) {
      const found = findItemByNameOrId(result.slots.head.item_name, 'head');
      if (found) {
        newSlots.head = found;
        if (found.category === 'Mũ') { newSlots.mu = found; newSlots.khan = null; }
        else { newSlots.khan = found; newSlots.mu = null; }
      }
    }
    if (!locked.includes('top') && !locked.includes('ao') && result.slots.top?.item_name) {
      const found = findItemByNameOrId(result.slots.top.item_name, 'top');
      if (found) {
        newSlots.top = found;
        newSlots.ao = found;
      }
    }
    if (!locked.includes('bottom') && !locked.includes('quan') && !locked.includes('vay') && result.slots.bottom?.item_name) {
      const found = findItemByNameOrId(result.slots.bottom.item_name, 'bottom');
      if (found) {
        newSlots.bottom = found;
        if (found.category === 'Váy') { newSlots.vay = found; newSlots.quan = null; }
        else { newSlots.quan = found; newSlots.vay = null; }
      }
    }
    if (!locked.includes('footwear') && !locked.includes('giay') && result.slots.footwear?.item_name) {
      const found = findItemByNameOrId(result.slots.footwear.item_name, 'footwear');
      if (found) {
        newSlots.footwear = found;
        newSlots.giay = found;
      }
    }
    if (!locked.includes('accessories') && !locked.includes('trang_suc') && !locked.includes('phu_kien') && result.slots.accessories?.length > 0) {
      const accMatches = result.slots.accessories
        .map((acc) => findItemByNameOrId(acc.item_name, 'accessories'))
        .filter(Boolean) as CostumeItem[];
      if (accMatches.length > 0) {
        newSlots.accessories = accMatches;
        newSlots.trang_suc = accMatches.filter((a) => a.category === 'Trang sức');
        newSlots.phu_kien = accMatches.filter((a) => a.category !== 'Trang sức');
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
    const topName = current.slots.ao?.name || current.slots.top?.name || 'Trang phục Việt Cổ';
    const ethnic = current.slots.ao?.ethnic_group || current.slots.top?.ethnic_group || 'Kinh';

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
      curator_notes: customNotes || 'Lưu từ phòng phối đồ VIỆT PHỤC REMIX AI ARENA 2026.'
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
