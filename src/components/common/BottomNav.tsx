import React from 'react';
import { useCostumeStore, ScreenTab } from '../../store/useCostumeStore';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useCostumeStore();

  const tabs: {
    id: ScreenTab;
    label: string;
    renderIcon: (isActive: boolean) => React.ReactNode;
  }[] = [
    {
      id: 'showcase',
      label: 'Trang chủ',
      renderIcon: () => (
        /* Biểu tượng Trống đồng / Mặt trời di sản của app */
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" />
          <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.4" stroke="currentColor" />
          <path d="M12 3v3 M12 18v3 M3 12h3 M18 12h3" stroke="currentColor" />
        </svg>
      )
    },
    {
      id: 'studio',
      label: 'Phối đồ',
      renderIcon: () => (
        /* Biểu tượng Thoi dệt vải / Nút ngọc áo tấc */
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
          <path d="M12 2.5L21.5 12 12 21.5 2.5 12 12 2.5z" stroke="currentColor" />
          <circle cx="12" cy="12" r="2.5" fill="currentColor" fillOpacity="0.3" stroke="currentColor" />
        </svg>
      )
    },
    {
      id: 'archive',
      label: 'Tủ đồ',
      renderIcon: () => (
        /* Biểu tượng Rương tráp gấm / Kho trang phục */
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
          <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" />
          <path d="M3 10h18 M9 10v4 M15 10v4" stroke="currentColor" />
        </svg>
      )
    },
    {
      id: 'lookbook',
      label: 'Lookbook',
      renderIcon: () => (
        /* Biểu tượng Ấn triện hoàng gia / Thẻ bài di sản */
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
          <circle cx="12" cy="12" r="9" stroke="currentColor" />
          <rect x="8.5" y="8.5" width="7" height="7" rx="1" fill="currentColor" fillOpacity="0.3" stroke="currentColor" />
          <path d="M12 8.5v7 M8.5 12h7" stroke="currentColor" />
        </svg>
      )
    }
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-[#121c16]/90 backdrop-blur-2xl border-t border-white/15 shadow-[0_-4px_24px_rgba(0,0,0,0.5)] pb-[env(safe-area-inset-bottom,0px)]">
      {/* Dải hoa văn gạch bông 6px chạy dọc mép trên bottom bar */}
      <div className="w-full h-[6px] overflow-hidden opacity-40 text-[#D8B454]">
        <svg className="w-full h-[6px]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="bottom-nav-lattice" width="6" height="6" patternUnits="userSpaceOnUse">
              <path d="M3 0 L6 3 L3 6 L0 3 Z" fill="none" stroke="currentColor" strokeWidth="0.75" />
            </pattern>
          </defs>
          <rect width="100%" height="6" fill="url(#bottom-nav-lattice)" />
        </svg>
      </div>

      <div className="max-w-md md:max-w-xl mx-auto flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const activeBg = tab.id === 'studio' ? 'bg-[#A03F30]' : tab.id === 'lookbook' ? 'bg-[#5C2B4E]' : 'bg-[#2d533f]';
          const activeText = tab.id === 'studio' ? 'text-[#FFDAD4]' : tab.id === 'lookbook' ? 'text-[#f5d9ec]' : 'text-[#D8B454]';

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
                isActive ? activeText : 'text-stone-300 hover:text-white'
              }`}
            >
              {isActive ? (
                /* Huy hiệu vòm cong cho Tab đang chọn */
                <div className={`w-10 h-8 rounded-t-full rounded-b-sm ${activeBg} text-[#D8B454] flex items-center justify-center shadow-xs -mt-1`}>
                  {tab.renderIcon(true)}
                </div>
              ) : (
                <div className="w-10 h-8 flex items-center justify-center">
                  {tab.renderIcon(false)}
                </div>
              )}
              <span className={`text-[10px] mt-0.5 leading-none ${isActive ? `font-bold font-label-sm ${activeText}` : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};