import { create } from 'zustand';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { Gender } from '../types/costume';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  phoneNumber: string;
  gender: Gender;
  isNewUser: boolean;
  avatarUrl?: string;
}

interface AuthState {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  authError: string | null;
  confirmationResult: ConfirmationResult | null;
  authModalOpen: boolean;
  authModalStep: 'signin' | 'otp' | 'onboarding';

  setAuthModalOpen: (open: boolean, step?: 'signin' | 'otp' | 'onboarding') => void;
  clearError: () => void;
  initAuth: () => () => void;
  signInWithGoogle: () => Promise<void>;
  sendPhoneOTP: (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) => Promise<boolean>;
  verifyPhoneOTP: (otpCode: string) => Promise<boolean>;
  completeOnboarding: (name: string, gender: Gender) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  firebaseUser: null,
  isLoading: true,
  authError: null,
  confirmationResult: null,
  authModalOpen: false,
  authModalStep: 'signin',

  setAuthModalOpen: (open, step = 'signin') => set({ authModalOpen: open, authModalStep: step, authError: null }),
  clearError: () => set({ authError: null }),

  initAuth: () => {
    set({ isLoading: true });
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const userSnap = await getDoc(userDocRef);

          if (userSnap.exists()) {
            const data = userSnap.data();
            set({
              firebaseUser: fbUser,
              user: {
                uid: fbUser.uid,
                displayName: data.displayName || fbUser.displayName || 'Khách hàng Cố vấn',
                email: fbUser.email || '',
                phoneNumber: data.phoneNumber || fbUser.phoneNumber || '',
                gender: data.gender || 'nu',
                isNewUser: false,
                avatarUrl: fbUser.photoURL || undefined
              },
              isLoading: false
            });
          } else {
            // User exists in Auth but no Firestore profile yet -> New User Onboarding
            set({
              firebaseUser: fbUser,
              user: {
                uid: fbUser.uid,
                displayName: fbUser.displayName || '',
                email: fbUser.email || '',
                phoneNumber: fbUser.phoneNumber || '',
                gender: 'nu',
                isNewUser: true,
                avatarUrl: fbUser.photoURL || undefined
              },
              authModalOpen: true,
              authModalStep: 'onboarding',
              isLoading: false
            });
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
          set({ isLoading: false });
        }
      } else {
        set({ user: null, firebaseUser: null, isLoading: false });
      }
    });

    return unsubscribe;
  },

  signInWithGoogle: async () => {
    set({ isLoading: true, authError: null });
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;

      const userDocRef = doc(db, 'users', fbUser.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        set({
          firebaseUser: fbUser,
          user: {
            uid: fbUser.uid,
            displayName: data.displayName || fbUser.displayName || 'Khách hàng Cố vấn',
            email: fbUser.email || '',
            phoneNumber: data.phoneNumber || '',
            gender: data.gender || 'nu',
            isNewUser: false,
            avatarUrl: fbUser.photoURL || undefined
          },
          authModalOpen: false,
          isLoading: false
        });
      } else {
        // New user needs onboarding
        set({
          firebaseUser: fbUser,
          user: {
            uid: fbUser.uid,
            displayName: fbUser.displayName || '',
            email: fbUser.email || '',
            phoneNumber: '',
            gender: 'nu',
            isNewUser: true,
            avatarUrl: fbUser.photoURL || undefined
          },
          authModalStep: 'onboarding',
          authModalOpen: true,
          isLoading: false
        });
      }
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      let msg = 'Đăng nhập Google thất bại. Vui lòng thử lại.';
      if (error.code === 'auth/popup-closed-by-user') {
        msg = 'Cửa sổ đăng nhập đã bị đóng trước khi hoàn tất.';
      }
      set({ authError: msg, isLoading: false });
    }
  },

  sendPhoneOTP: async (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) => {
    set({ isLoading: true, authError: null });
    try {
      // Format phone number for Vietnam (+84)
      let formattedPhone = phoneNumber.trim();
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '+84' + formattedPhone.slice(1);
      } else if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+84' + formattedPhone;
      }

      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
      set({
        confirmationResult,
        authModalStep: 'otp',
        isLoading: false
      });
      return true;
    } catch (error: any) {
      console.error('Phone OTP Send Error:', error);
      let msg = 'Không thể gửi mã OTP. Vui lòng kiểm tra lại số điện thoại.';
      if (error.code === 'auth/invalid-phone-number') {
        msg = 'Số điện thoại không hợp lệ.';
      } else if (error.code === 'auth/too-many-requests') {
        msg = 'Quá nhiều yêu cầu. Vui lòng thử lại sau ít phút.';
      }
      set({ authError: msg, isLoading: false });
      return false;
    }
  },

  verifyPhoneOTP: async (otpCode: string) => {
    const { confirmationResult } = get();
    if (!confirmationResult) {
      set({ authError: 'Không tìm thấy phiên xác thực OTP.' });
      return false;
    }

    set({ isLoading: true, authError: null });
    try {
      const result = await confirmationResult.confirm(otpCode);
      const fbUser = result.user;

      const userDocRef = doc(db, 'users', fbUser.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        set({
          firebaseUser: fbUser,
          user: {
            uid: fbUser.uid,
            displayName: data.displayName || 'Khách hàng Cố vấn',
            email: fbUser.email || '',
            phoneNumber: fbUser.phoneNumber || fbUser.phoneNumber || '',
            gender: data.gender || 'nu',
            isNewUser: false
          },
          authModalOpen: false,
          authModalStep: 'signin',
          isLoading: false
        });
      } else {
        set({
          firebaseUser: fbUser,
          user: {
            uid: fbUser.uid,
            displayName: '',
            email: '',
            phoneNumber: fbUser.phoneNumber || '',
            gender: 'nu',
            isNewUser: true
          },
          authModalStep: 'onboarding',
          authModalOpen: true,
          isLoading: false
        });
      }
      return true;
    } catch (error: any) {
      console.error('OTP Verify Error:', error);
      let msg = 'Mã OTP không chính xác hoặc đã hết hạn.';
      if (error.code === 'auth/invalid-verification-code') {
        msg = 'Mã xác thực OTP không chính xác.';
      }
      set({ authError: msg, isLoading: false });
      return false;
    }
  },

  completeOnboarding: async (name: string, gender: Gender) => {
    const { firebaseUser } = get();
    if (!firebaseUser) return;

    set({ isLoading: true, authError: null });
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const profileData = {
        uid: firebaseUser.uid,
        displayName: name,
        email: firebaseUser.email || '',
        phoneNumber: firebaseUser.phoneNumber || '',
        gender: gender,
        updatedAt: serverTimestamp()
      };

      await setDoc(userDocRef, profileData, { merge: true });

      set({
        user: {
          uid: firebaseUser.uid,
          displayName: name,
          email: firebaseUser.email || '',
          phoneNumber: firebaseUser.phoneNumber || '',
          gender: gender,
          isNewUser: false,
          avatarUrl: firebaseUser.photoURL || ''
        },
        authModalOpen: false,
        authModalStep: 'signin',
        isLoading: false
      });
    } catch (error: any) {
      console.error('Onboarding Save Error:', error);
      set({ authError: 'Không thể lưu hồ sơ. Vui lòng thử lại.', isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await signOut(auth);
      set({ user: null, firebaseUser: null, isLoading: false, authModalOpen: false, authModalStep: 'signin' });
    } catch (error) {
      console.error('Logout error:', error);
      set({ isLoading: false });
    }
  }
}));
