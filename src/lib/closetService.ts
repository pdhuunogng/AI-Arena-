import { doc, getDocs, collection, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage, auth } from './firebase';
import { CostumeItem, GarmentCategory, CostumeSlot } from '../types/costume';

const LOCAL_STORAGE_KEY_PREFIX = 'viet_phuc_remix_closet_';

export interface UploadGarmentPayload {
  file?: File | null;
  base64Preview?: string;
  name: string;
  category: GarmentCategory;
  colorHex?: string;
  ethnicGroup?: string;
  subgroup?: string;
  material?: string;
  notes?: string;
  verifiedSource?: string;
  userUid?: string;
}

export interface UploadResult {
  success: boolean;
  item?: CostumeItem;
  error?: string;
  isCloudSynced: boolean;
}

/**
 * Validate image file format and file size
 */
export function validateGarmentFile(file: File): { valid: boolean; error?: string } {
  const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
  if (!validMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Định dạng tệp không hợp lệ. Vui lòng tải lên tệp ảnh PNG, JPG hoặc WEBP.'
    };
  }

  const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
  if (file.size > MAX_SIZE_BYTES) {
    return {
      valid: false,
      error: `Dung lượng tệp (${(file.size / (1024 * 1024)).toFixed(1)}MB) vượt quá giới hạn 5MB cho phép.`
    };
  }

  return { valid: true };
}

import { categoryToSlot as standardizedCategoryToSlot } from '../data/mockHeritageData';

/**
 * Map GarmentCategory to standardized CostumeSlot
 */
export function categoryToSlot(category: GarmentCategory, name = ''): CostumeSlot {
  return standardizedCategoryToSlot(category, name);
}

/**
 * Get items stored in LocalStorage for offline and instant cache
 */
export function getLocalClosetItems(uid?: string): CostumeItem[] {
  try {
    const key = `${LOCAL_STORAGE_KEY_PREFIX}${uid || 'guest'}`;
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read personal closet from localStorage:', err);
    return [];
  }
}

/**
 * Save items to LocalStorage
 */
export function saveLocalClosetItems(items: CostumeItem[], uid?: string): void {
  try {
    const key = `${LOCAL_STORAGE_KEY_PREFIX}${uid || 'guest'}`;
    localStorage.setItem(key, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to write personal closet to localStorage:', err);
  }
}

/**
 * Fetch personal closet items from Firestore (if user signed in), merging with local cache
 */
export async function fetchPersonalCloset(uid?: string): Promise<CostumeItem[]> {
  const localItems = getLocalClosetItems(uid);

  if (!uid) {
    return localItems;
  }

  try {
    const closetColRef = collection(db, 'users', uid, 'closet');
    const snapshot = await getDocs(closetColRef);
    const firestoreItems: CostumeItem[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      firestoreItems.push({
        id: docSnap.id,
        name: data.name || 'Trang phục cá nhân',
        image_url: data.image_url || '',
        slot: data.slot || categoryToSlot(data.category || 'Áo'),
        category: (data.category as GarmentCategory) || 'Áo',
        ethnic_group: data.ethnic_group || 'Chưa xác minh',
        subgroup: data.subgroup || 'Tủ đồ cá nhân',
        period_or_region: data.period_or_region || 'Đương đại',
        color_hex: data.color_hex || '#456B56',
        material: data.material || 'Vải tự do',
        pattern_description: data.pattern_description || '',
        cultural_significance: data.cultural_significance || 'Trang phục trong tủ đồ cá nhân người dùng.',
        source_verification: data.source_verification || 'Chưa có thông tin xác minh',
        ritual_level: 'daily',
        cross_cultural_flag: true,
        owner_uid: uid,
        is_personal: true,
        storage_path: data.storage_path,
        createdAt: data.createdAt ? Number(data.createdAt) : Date.now(),
        updatedAt: data.updatedAt ? Number(data.updatedAt) : Date.now()
      });
    });

    // Merge: union by id with firestoreItems taking precedence
    const firestoreIds = new Set(firestoreItems.map((i) => i.id));
    const merged = [...firestoreItems, ...localItems.filter((i) => !firestoreIds.has(i.id))];

    // Update local cache
    saveLocalClosetItems(merged, uid);
    return merged;
  } catch (err: any) {
    console.warn('Firestore closet read warning (falling back to local storage cache):', err?.message);
    return localItems;
  }
}

/**
 * Upload an image and save garment metadata persistently
 */
export async function uploadAndSaveGarment(payload: UploadGarmentPayload): Promise<UploadResult> {
  const {
    file,
    base64Preview,
    name,
    category,
    colorHex = '#456B56',
    ethnicGroup = 'Chưa xác minh',
    subgroup = 'Cá nhân',
    material = 'Vải tự dệt/thời trang',
    notes = '',
    verifiedSource = 'Chưa có thông tin xác minh',
    userUid
  } = payload;

  const itemId = `closet-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  let finalImageUrl = base64Preview || '';
  let storagePath: string | undefined = undefined;
  let isCloudSynced = false;

  // 1. Validate file if raw File was passed
  if (file) {
    const valResult = validateGarmentFile(file);
    if (!valResult.valid) {
      return { success: false, error: valResult.error, isCloudSynced: false };
    }
  }

  // 2. Cloud Upload to Firebase Storage if user is signed in and file exists
  if (userUid && file) {
    try {
      const ext = file.name.split('.').pop() || 'png';
      storagePath = `users/${userUid}/closet/${itemId}.${ext}`;
      const storageRef = ref(storage, storagePath);

      // Upload file bytes to Firebase Storage
      await uploadBytes(storageRef, file, {
        contentType: file.type,
        customMetadata: {
          ownerUid: userUid,
          garmentName: name,
          category
        }
      });

      // Retrieve permanent download URL
      finalImageUrl = await getDownloadURL(storageRef);
      isCloudSynced = true;
    } catch (storageErr: any) {
      console.warn('Firebase Storage upload warning:', storageErr);
      // If storage is not available or blocked, we do not lie:
      // We fall back to storing the item locally but flag that cloud storage failed
    }
  }

  if (!finalImageUrl) {
    return {
      success: false,
      error: 'Không tìm thấy hình ảnh trang phục để lưu.',
      isCloudSynced: false
    };
  }

  // 3. Construct Item Data
  const newItem: CostumeItem = {
    id: itemId,
    name: name.trim() || 'Trang phục mới',
    image_url: finalImageUrl,
    slot: categoryToSlot(category),
    category,
    ethnic_group: ethnicGroup.trim() || 'Chưa xác minh',
    subgroup: subgroup.trim() || undefined,
    period_or_region: 'Tủ đồ cá nhân',
    color_hex: colorHex,
    material: material.trim() || 'Vải tự do',
    pattern_description: notes.trim() || 'Món đồ cá nhân trong tủ đồ người dùng.',
    cultural_significance: 'Món đồ trong tủ đồ cá nhân người dùng.',
    source_verification: verifiedSource.trim() || 'Chưa có thông tin xác minh',
    ritual_level: 'daily',
    cross_cultural_flag: true,
    owner_uid: userUid,
    is_personal: true,
    storage_path: storagePath,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  // 4. Save to Firestore if user is authenticated
  if (userUid) {
    try {
      const docRef = doc(db, 'users', userUid, 'closet', itemId);
      await setDoc(docRef, {
        name: newItem.name,
        image_url: newItem.image_url,
        category: newItem.category,
        slot: newItem.slot,
        ethnic_group: newItem.ethnic_group,
        subgroup: newItem.subgroup || null,
        period_or_region: newItem.period_or_region,
        color_hex: newItem.color_hex,
        material: newItem.material,
        pattern_description: newItem.pattern_description,
        cultural_significance: newItem.cultural_significance,
        source_verification: newItem.source_verification,
        ritual_level: newItem.ritual_level,
        cross_cultural_flag: newItem.cross_cultural_flag,
        storage_path: storagePath || null,
        owner_uid: userUid,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      isCloudSynced = true;
    } catch (firestoreErr: any) {
      console.warn('Firestore write warning:', firestoreErr?.message);
    }
  }

  // 5. Always persist to localStorage cache so it's instantly available after page reload
  const existingLocal = getLocalClosetItems(userUid);
  const updatedLocal = [newItem, ...existingLocal];
  saveLocalClosetItems(updatedLocal, userUid);

  return {
    success: true,
    item: newItem,
    isCloudSynced
  };
}

/**
 * Delete a personal garment
 */
export async function deletePersonalGarment(itemId: string, userUid?: string): Promise<boolean> {
  // Remove from localStorage
  const localItems = getLocalClosetItems(userUid);
  const filtered = localItems.filter((i) => i.id !== itemId);
  saveLocalClosetItems(filtered, userUid);

  if (userUid) {
    try {
      const docRef = doc(db, 'users', userUid, 'closet', itemId);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('Failed to delete doc from Firestore:', err);
    }
  }

  return true;
}
