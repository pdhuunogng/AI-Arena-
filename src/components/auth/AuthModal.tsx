import React, { useEffect, useRef } from 'react';
import { RecaptchaVerifier } from 'firebase/auth';
import { useAuthStore } from '../../store/useAuthStore';
import { useCostumeStore } from '../../store/useCostumeStore';
import { Gender } from '../../types/costume';
import { auth } from '../../lib/firebase';
import { Sparkles, Phone, Smartphone, Check, User, ShieldCheck, AlertCircle } from 'lucide-react';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

export const AuthModal: React.FC = () => {
  const {
    authModalOpen,
    authModalStep,
    setAuthModalOpen,
    signInWithGoogle,
    sendPhoneOTP,
    verifyPhoneOTP,
    completeOnboarding,
    authError,
    clearError,
    user
  } = useAuthStore();

  const { setGender } = useCostumeStore();

  const [phoneInput, setPhoneInput] = React.useState('');
  const [otpInput, setOtpInput] = React.useState('');
  const [nameInput, setNameInput] = React.useState(user?.displayName || '');
  const [selectedGender, setSelectedGender] = React.useState<Gender>(user?.gender || 'nu');
  const [recaptchaVerifier, setRecaptchaVerifier] = React.useState<RecaptchaVerifier | null>(null);

  const recaptchaContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (authModalOpen && authModalStep === 'signin') {
      try {
        if (!window.recaptchaVerifier && recaptchaContainerRef.current) {
          const verifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
            size: 'invisible',
            callback: () => {},
            'expired-callback': () => {}
          });
          verifier.render();
          setRecaptchaVerifier(verifier);
          window.recaptchaVerifier = verifier;
        }
      } catch (e) {
        console.error('Recaptcha init error:', e);
      }
    }

    return () => {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = undefined;
        } catch (e) {
          // ignore
        }
      }
    };
  }, [authModalOpen, authModalStep]);

  if (!authModalOpen) return null;

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!phoneInput || phoneInput.length < 9) return;
    if (recaptchaVerifier) {
      await sendPhoneOTP(phoneInput, recaptchaVerifier);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (otpInput.length === 6) {
      const success = await verifyPhoneOTP(otpInput);
      if (success) {
        setOtpInput('');
      }
    }
  };

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (nameInput.trim()) {
      await completeOnboarding(nameInput.trim(), selectedGender);
      setGender(selectedGender);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-[#FAF8F5] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-300 relative space-y-6">
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center transition-colors cursor-pointer"
        >
          ✕
        </button>

        {/* Hidden reCAPTCHA Container */}
        <div ref={recaptchaContainerRef} id="recaptcha-container" />

        {authError && (
          <div className="bg-red-50 border border-red-200 text-[#a03f30] px-4 py-3 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {/* STEP 1: SIGN IN CHOICE */}
        {authModalStep === 'signin' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#2d533f]/10 text-[#2d533f] flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-headline font-bold text-stone-900">Đăng Nhập Tài Khoản</h3>
              <p className="text-xs sm:text-sm text-stone-600">
                Kết nối tài khoản Việt Cổ Y Phong AI để lưu trữ các bộ sưu tập giám định di sản của bạn.
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={signInWithGoogle}
                className="w-full py-3.5 px-4 bg-white hover:bg-stone-50 border border-stone-300 rounded-2xl shadow-sm text-stone-800 text-sm font-semibold flex items-center justify-center gap-3 transition-all cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Tiếp tục với Google</span>
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-stone-300"></div>
                <span className="flex-shrink mx-4 text-xs text-stone-500 uppercase tracking-wider">hoặc số điện thoại</span>
                <div className="flex-grow border-t border-stone-300"></div>
              </div>

              <form onSubmit={handlePhoneSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Số điện thoại (+84)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-stone-400">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input
                      type="tel"
                      placeholder="Nhập số điện thoại (ví dụ: 0912345678)"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-[#2d533f] outline-none"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-white text-sm font-semibold rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Smartphone className="w-4 h-4 text-[#caa749]" />
                  <span>Gửi mã xác thực OTP</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* STEP 2: OTP VERIFICATION */}
        {authModalStep === 'otp' && (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#2d533f]/10 text-[#2d533f] flex items-center justify-center mx-auto">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-headline font-bold text-stone-900">Xác Thực Mã OTP</h3>
              <p className="text-xs sm:text-sm text-stone-600">
                Nhập mã xác thực 6 chữ số đã được gửi qua tin nhắn SMS tới số điện thoại của bạn.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="• • • • • •"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  className="w-full text-center tracking-[1em] text-2xl font-mono py-3.5 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#2d533f] outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#2d533f] hover:bg-[#456b56] text-white text-sm font-semibold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Xác nhận & Đăng nhập</span>
              </button>

              <button
                type="button"
                onClick={() => useAuthStore.setState({ authModalStep: 'signin' })}
                className="w-full py-2 text-xs text-stone-600 hover:text-stone-900 font-medium cursor-pointer"
              >
                ← Quay lại phương thức khác
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: FIRST-TIME USER ONBOARDING */}
        {authModalStep === 'onboarding' && (
          <form onSubmit={handleOnboardingSubmit} className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#2d533f]/10 text-[#2d533f] flex items-center justify-center mx-auto">
                <User className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-headline font-bold text-stone-900">Thiết Lập Hồ Sơ 3D</h3>
              <p className="text-xs sm:text-sm text-stone-600">
                Cá nhân hóa tên hiển thị và phom dáng ma-nơ-canh mặc định cho trải nghiệm phối đồ di sản.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Họ và tên hoặc Biệt danh</label>
                <input
                  type="text"
                  placeholder="Nhập tên của bạn..."
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-[#2d533f] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-2">Phom dáng ma-nơ-canh mặc định</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'nam', label: 'Nam', desc: 'Vóc dáng tuấn tú · Áo Tấc' },
                    { id: 'nu', label: 'Nữ', desc: 'Vóc dáng thanh tú · Nhật Bình' },
                    { id: 'nonbinary', label: 'Nonbinary', desc: 'Phom dáng linh hoạt' }
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setSelectedGender(g.id as Gender)}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                        selectedGender === g.id
                          ? 'bg-[#2d533f] text-white border-[#2d533f] shadow-md font-bold'
                          : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                      }`}
                    >
                      <span className="text-xs">{g.label}</span>
                      <span className={`text-[10px] mt-0.5 ${selectedGender === g.id ? 'text-amber-200' : 'text-stone-400'}`}>
                        {g.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#2d533f] hover:bg-[#456b56] text-white text-sm font-semibold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-[#caa749]" />
                <span>Hoàn tất & Khám phá</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
