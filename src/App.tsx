/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { useCostumeStore } from './store/useCostumeStore';
import { useAuthStore } from './store/useAuthStore';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { RunwayShowcase } from './components/showcase/RunwayShowcase';
import { StylingStudio } from './components/studio/StylingStudio';
import { HeritageCatalog } from './components/wardrobe/HeritageCatalog';
import { AccountView } from './components/lookbook/AccountView';
import { CulturalDetailModal } from './components/modals/CulturalDetailModal';
import { CulturalChatbot } from './components/chat/CulturalChatbot';
import { AuthModal } from './components/auth/AuthModal';
import { BottomNav } from './components/common/BottomNav';

export default function App() {
  const { activeTab, initPersonalCloset } = useCostumeStore();
  const { initAuth, user } = useAuthStore();

  useEffect(() => {
    const unsubscribe = initAuth();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [initAuth]);

  useEffect(() => {
    initPersonalCloset(user?.uid);
  }, [user?.uid, initPersonalCloset]);

  return (
    <div className="min-h-screen flex flex-col relative bg-gradient-to-br from-[#184230] via-[#85251e] to-[#4d1842] bg-fixed text-white font-sans pb-24 md:pb-0 overflow-x-hidden">
      {/* Subtle traditional royal watermark lattice overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-10 z-0">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="full-screen-bg-lattice" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M20 2 L38 20 L20 38 L2 20 Z" fill="none" stroke="#FFFDF8" strokeWidth="1" strokeOpacity="0.4" />
              <circle cx="20" cy="20" r="4" fill="#D8B454" fillOpacity="0.35" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#full-screen-bg-lattice)" />
        </svg>
      </div>

      <main className="flex-1 w-full relative z-10">
        {activeTab === 'showcase' && <RunwayShowcase />}
        {activeTab === 'studio' && <StylingStudio />}
        {activeTab === 'archive' && <HeritageCatalog />}
        {activeTab === 'lookbook' && <AccountView />}
      </main>

      <Footer />

      {/* Fixed Native Bottom Navigation */}
      <BottomNav />

      {/* Global Cultural Heritage Detail Card Modal */}
      <CulturalDetailModal />

      {/* Multi-Turn AI Cultural Advisor Chatbot */}
      <CulturalChatbot />

      {/* Firebase Auth & Onboarding Modal */}
      <AuthModal />
    </div>
  );
}
