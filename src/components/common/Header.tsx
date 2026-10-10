import React from 'react';
import { useCostumeStore, ScreenTab } from '../../store/useCostumeStore';
import { Sparkles, Home, Wand2, Layers, BookmarkCheck, User } from 'lucide-react';

export const Header: React.FC = () => {
  const { activeTab, setActiveTab } = useCostumeStore();

  const navLinks: {
    id: ScreenTab;
    label: string;
    fullTitle: string;
    color: string;
    bgPill: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'showcase', label: 'Trang chủ', fullTitle: 'Trang chủ (Khám Phá Di Sản)', color: '#456B56', bgPill: 'bg-[#456B56]/10 text-[#456B56]', icon: Home },
    { id: 'studio', label: 'Phối đồ – Studio', fullTitle: 'Phối đồ – Styling Studio (Lõi Tương Tác & AI)', color: '#CE6250', bgPill: 'bg-[#CE6250]/10 text-[#CE6250]', icon: Wand2 },
    { id: 'archive', label: 'Tủ đồ & Thư viện', fullTitle: 'Tủ đồ & Thư viện Di sản', color: '#1E3B5C', bgPill: 'bg-[#1E3B5C]/10 text-[#1E3B5C]', icon: Layers },
    { id: 'lookbook', label: 'Tài khoản & Lookbook', fullTitle: 'Tài khoản & Xuất Thẻ Lookbook', color: '#5C2B4E', bgPill: 'bg-[#5C2B4E]/10 text-[#5C2B4E]', icon: BookmarkCheck }
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#fbf9f4]/95 backdrop-blur-md border-b border-[#e9e8e3] transition-all">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Zone 1: Brand title wordmark */}
        <button
          onClick={() => setActiveTab('showcase')}
          className="text-lg sm:text-xl font-serif font-extrabold tracking-tight text-[#1a1c1a] hover:text-[#456B56] transition-colors cursor-pointer text-left flex items-center gap-2.5"
        >
          <div className="w-8 h-8 rounded-xl bg-[#456B56] text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4 text-[#D8B454]" />
          </div>
          <div>
            <span className="block text-[10px] font-label-md tracking-widest text-[#755b00] uppercase font-semibold leading-none">AI STYLING · GEN Z</span>
            <span className="font-headline font-bold text-base sm:text-lg text-[#1a1c1a] leading-tight">VIỆT PHỤC REMIX</span>
          </div>
        </button>

        {/* Zone 2: Navigation links */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-medium text-[#414942]">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`relative py-1 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isActive ? 'font-bold' : 'hover:text-[#1a1c1a]'
                }`}
                style={{ color: isActive ? link.color : undefined }}
                title={link.fullTitle}
              >
                <span>{link.label}</span>
                {isActive && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                    style={{ backgroundColor: link.color }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary CTA */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setActiveTab('studio')}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs font-semibold text-white bg-[#CE6250] hover:bg-[#B84D3C] rounded-xl transition-all shadow-sm shadow-[#CE6250]/20 whitespace-nowrap cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FFDAD4]" />
            <span>Phối Cùng AI</span>
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Responsive Navigation Bar */}
      <div className="lg:hidden flex items-center justify-around border-t border-[#e9e8e3] bg-[#fbf9f4] py-1.5 px-2 text-[11px] font-medium overflow-x-auto">
        {navLinks.map((link) => {
          const isActive = activeTab === link.id;
          const Icon = link.icon;
          return (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              className={`flex flex-col sm:flex-row items-center gap-1 py-1 px-2.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                isActive ? 'font-bold shadow-2xs' : 'text-[#414942] hover:text-[#1a1c1a]'
              }`}
              style={
                isActive
                  ? { backgroundColor: `${link.color}18`, color: link.color }
                  : undefined
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{link.label.split('–')[0].trim()}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};

