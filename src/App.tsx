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

export default function App() {
  const { activeTab } = useCostumeStore();
  const { initAuth } = useAuthStore();

  useEffect(() => {
    const unsubscribe = initAuth();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [initAuth]);

  return (
    <div className="min-h-screen flex flex-col bg-[#fbf9f4] text-[#1a1c1a] font-sans">
      <Header />

      <main className="flex-1">
        {activeTab === 'showcase' && <RunwayShowcase />}
        {activeTab === 'studio' && <StylingStudio />}
        {activeTab === 'archive' && <HeritageCatalog />}
        {activeTab === 'lookbook' && <AccountView />}
      </main>

      <Footer />

      {/* Global Cultural Heritage Detail Card Modal */}
      <CulturalDetailModal />

      {/* Multi-Turn AI Cultural Advisor Chatbot */}
      <CulturalChatbot />

      {/* Firebase Auth & Onboarding Modal */}
      <AuthModal />
    </div>
  );
}
