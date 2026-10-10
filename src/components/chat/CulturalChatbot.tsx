import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useCostumeStore } from '../../store/useCostumeStore';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface Position {
  x: number;
  y: number;
}

export const CulturalChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Xin chào! Tôi là Việt Cổ Y Phong AI – Cố vấn phối đồ và giám định tri thức trang phục dân tộc & cổ phục Việt Nam. Bạn muốn tra cứu ý nghĩa hoa văn hay cần gợi ý phối đồ cho dịp nào?',
      timestamp: Date.now()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { outfit } = useCostumeStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const QUICK_TOPICS = [
    'Quy chế ngũ sắc thời Nguyễn là gì?',
    'Vì sao không được phối chân váy Mông với áo Tấc Kinh?',
    'Áo Nhật Bình mặc trong điển lễ nào?',
    'Ý nghĩa hoa văn vẽ sáp ong H\'Mông'
  ];

  // --- DRAGGABLE BUTTON STATE ---
  const btnRef = useRef<HTMLDivElement>(null);
  const [btnPos, setBtnPos] = useState<Position>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('viet_phuc_ai_advisor_pos');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
            return {
              x: Math.max(8, Math.min(window.innerWidth - 148, parsed.x)),
              y: Math.max(8, Math.min(window.innerHeight - 138, parsed.y))
            };
          }
        }
      } catch {}
      return {
        x: Math.max(8, window.innerWidth - 148),
        y: Math.max(8, window.innerHeight - 138)
      };
    }
    return { x: 240, y: 500 };
  });

  const [isBtnDragging, setIsBtnDragging] = useState(false);
  const btnDragRef = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    hasMoved: boolean;
  }>({ startX: 0, startY: 0, origX: 0, origY: 0, hasMoved: false });

  // --- DRAGGABLE MODAL WINDOW STATE ---
  const modalRef = useRef<HTMLDivElement>(null);
  const [modalPos, setModalPos] = useState<Position | null>(null);
  const [isModalDragging, setIsModalDragging] = useState(false);
  const modalDragRef = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    hasMoved: boolean;
  }>({ startX: 0, startY: 0, origX: 0, origY: 0, hasMoved: false });

  // Helper clamp functions
  const clamp = (val: number, min: number, max: number) => {
    if (min > max) return min;
    return Math.max(min, Math.min(max, val));
  };

  const clampBtn = useCallback((x: number, y: number) => {
    if (typeof window === 'undefined') return { x, y };
    const w = btnRef.current?.offsetWidth || 140;
    const h = btnRef.current?.offsetHeight || 44;
    const maxX = Math.max(8, window.innerWidth - w - 8);
    const maxY = Math.max(8, window.innerHeight - h - 75); // Safe area above bottom nav
    return {
      x: clamp(x, 8, maxX),
      y: clamp(y, 8, maxY)
    };
  }, []);

  const clampModal = useCallback((x: number, y: number) => {
    if (typeof window === 'undefined') return { x, y };
    const w = modalRef.current?.offsetWidth || Math.min(window.innerWidth - 16, 390);
    const h = modalRef.current?.offsetHeight || Math.min(window.innerHeight * 0.75, 540);
    const maxX = Math.max(8, window.innerWidth - w - 8);
    const maxY = Math.max(8, window.innerHeight - h - 75);
    return {
      x: clamp(x, 8, maxX),
      y: clamp(y, 8, maxY)
    };
  }, []);

  // Window resize handler to keep widget bounded on screen
  useEffect(() => {
    const handleResize = () => {
      setBtnPos((prev) => clampBtn(prev.x, prev.y));
      setModalPos((prev) => (prev ? clampModal(prev.x, prev.y) : null));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [clampBtn, clampModal]);

  // Open modal and compute initial placement near the button
  const toggleOpen = useCallback(() => {
    setIsOpen((prevOpen) => {
      const nextOpen = !prevOpen;
      if (nextOpen && !modalPos) {
        const modalW = Math.min(window.innerWidth - 16, 390);
        const modalH = Math.min(window.innerHeight * 0.75, 540);
        const targetX = clamp(btnPos.x + 130 - modalW, 8, window.innerWidth - modalW - 8);
        const targetY = clamp(btnPos.y - modalH - 12, 8, window.innerHeight - modalH - 75);
        setModalPos({ x: targetX, y: targetY });
      }
      return nextOpen;
    });
  }, [btnPos, modalPos]);

  const resetModalPosition = () => {
    const modalW = Math.min(window.innerWidth - 16, 390);
    const modalH = Math.min(window.innerHeight * 0.75, 540);
    const targetX = Math.max(8, window.innerWidth - modalW - 12);
    const targetY = Math.max(8, window.innerHeight - modalH - 75);
    setModalPos({ x: targetX, y: targetY });
  };

  // --- BUTTON MOUSE DRAG ---
  const handleBtnMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    btnDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: btnPos.x,
      origY: btnPos.y,
      hasMoved: false
    };

    const onMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - btnDragRef.current.startX;
      const dy = moveEvent.clientY - btnDragRef.current.startY;
      if (Math.hypot(dx, dy) > 4) {
        btnDragRef.current.hasMoved = true;
        setIsBtnDragging(true);
      }
      if (btnDragRef.current.hasMoved) {
        const next = clampBtn(btnDragRef.current.origX + dx, btnDragRef.current.origY + dy);
        setBtnPos(next);
      }
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      if (btnDragRef.current.hasMoved) {
        setIsBtnDragging(false);
        setBtnPos((curr) => {
          try {
            localStorage.setItem('viet_phuc_ai_advisor_pos', JSON.stringify(curr));
          } catch {}
          return curr;
        });
      } else {
        setIsBtnDragging(false);
        toggleOpen();
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // --- BUTTON TOUCH DRAG ---
  const handleBtnTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    btnDragRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      origX: btnPos.x,
      origY: btnPos.y,
      hasMoved: false
    };
  };

  const handleBtnTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const dx = touch.clientX - btnDragRef.current.startX;
    const dy = touch.clientY - btnDragRef.current.startY;
    if (Math.hypot(dx, dy) > 4) {
      btnDragRef.current.hasMoved = true;
      setIsBtnDragging(true);
    }
    if (btnDragRef.current.hasMoved) {
      const next = clampBtn(btnDragRef.current.origX + dx, btnDragRef.current.origY + dy);
      setBtnPos(next);
    }
  };

  const handleBtnTouchEnd = () => {
    if (btnDragRef.current.hasMoved) {
      setIsBtnDragging(false);
      setBtnPos((curr) => {
        try {
          localStorage.setItem('viet_phuc_ai_advisor_pos', JSON.stringify(curr));
        } catch {}
        return curr;
      });
    } else {
      setIsBtnDragging(false);
      toggleOpen();
    }
  };

  // --- MODAL HEADER MOUSE DRAG ---
  const handleModalMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    if (!modalPos) return;
    e.preventDefault();

    modalDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: modalPos.x,
      origY: modalPos.y,
      hasMoved: false
    };

    const onMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - modalDragRef.current.startX;
      const dy = moveEvent.clientY - modalDragRef.current.startY;
      if (Math.hypot(dx, dy) > 3) {
        modalDragRef.current.hasMoved = true;
        setIsModalDragging(true);
      }
      if (modalDragRef.current.hasMoved) {
        const next = clampModal(modalDragRef.current.origX + dx, modalDragRef.current.origY + dy);
        setModalPos(next);
      }
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      setIsModalDragging(false);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // --- MODAL HEADER TOUCH DRAG ---
  const handleModalTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    if (!modalPos) return;
    const touch = e.touches[0];
    modalDragRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      origX: modalPos.x,
      origY: modalPos.y,
      hasMoved: false
    };
  };

  const handleModalTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const dx = touch.clientX - modalDragRef.current.startX;
    const dy = touch.clientY - modalDragRef.current.startY;
    if (Math.hypot(dx, dy) > 3) {
      modalDragRef.current.hasMoved = true;
      setIsModalDragging(true);
    }
    if (modalDragRef.current.hasMoved) {
      const next = clampModal(modalDragRef.current.origX + dx, modalDragRef.current.origY + dy);
      setModalPos(next);
    }
  };

  const handleModalTouchEnd = () => {
    setIsModalDragging(false);
  };

  // --- CHAT LOGIC ---
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: Date.now()
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/advisor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            content: m.content
          })),
          currentOutfit: outfit.slots,
          gender: outfit.gender
        })
      });

      if (!response.ok) {
        throw new Error('Lỗi phản hồi từ Cố vấn AI');
      }

      const data = await response.json();
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'Cảm ơn quý khách đã gửi câu hỏi.',
        timestamp: Date.now()
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content:
          'Hệ thống đang đồng bộ kho tri thức di sản. Quý khách vui lòng thử lại trong giây lát hoặc tham khảo trực tiếp tại Kho Cổ Phục!',
        timestamp: Date.now()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content:
          'Đã làm mới cuộc hội thoại. Quý khách muốn cố vấn về phong cách hoặc điển chế di sản nào tiếp theo?',
        timestamp: Date.now()
      }
    ]);
  };

  return (
    <>
      {/* Freely Draggable Floating Chat Trigger Button */}
      <div
        ref={btnRef}
        onMouseDown={handleBtnMouseDown}
        onTouchStart={handleBtnTouchStart}
        onTouchMove={handleBtnTouchMove}
        onTouchEnd={handleBtnTouchEnd}
        style={{
          left: `${btnPos.x}px`,
          top: `${btnPos.y}px`,
          touchAction: 'none'
        }}
        className={`fixed z-40 select-none transition-shadow ${
          isBtnDragging ? 'cursor-grabbing scale-105 shadow-2xl ring-2 ring-[#D8B454]' : 'cursor-grab'
        }`}
        title="Nhấn để mở / Kéo để di chuyển tự do khắp màn hình"
      >
        <div className="flex items-center gap-2 pl-2 pr-3.5 py-2.5 rounded-full bg-[#2d533f] text-white shadow-xl hover:bg-[#3d6951] active:scale-95 transition-transform border border-white/20 backdrop-blur-md">
          {/* Grip dots handle indicating free movement */}
          <div
            className="flex items-center text-[#D8B454]/80 opacity-70 hover:opacity-100 cursor-grab active:cursor-grabbing px-0.5"
            title="Kéo tự do"
          >
            <svg viewBox="0 0 10 16" fill="currentColor" className="w-2.5 h-3.5">
              <circle cx="2" cy="2" r="1.3" />
              <circle cx="8" cy="2" r="1.3" />
              <circle cx="2" cy="8" r="1.3" />
              <circle cx="8" cy="8" r="1.3" />
              <circle cx="2" cy="14" r="1.3" />
              <circle cx="8" cy="14" r="1.3" />
            </svg>
          </div>

          {/* App heritage emblem */}
          <div className="w-5 h-5 rounded-md bg-[#D8B454]/20 flex items-center justify-center text-[#D8B454]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" />
              <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.4" stroke="currentColor" />
              <path d="M12 3v3 M12 18v3 M3 12h3 M18 12h3" stroke="currentColor" />
            </svg>
          </div>

          <span className="font-semibold text-xs sm:text-sm tracking-wide">Cố vấn AI</span>

          {/* Online status indicator */}
          <span className="w-2 h-2 rounded-full bg-[#70F59C] shadow-[0_0_8px_#70F59C]" />
        </div>
      </div>

      {/* Freely Draggable Floating Chat Modal / Drawer */}
      {isOpen && (
        <div
          ref={modalRef}
          style={{
            left: modalPos ? `${modalPos.x}px` : undefined,
            top: modalPos ? `${modalPos.y}px` : undefined,
            ...(modalPos
              ? {}
              : {
                  right: '16px',
                  bottom: '96px'
                })
          }}
          className={`fixed z-50 w-[calc(100vw-1rem)] sm:w-[390px] max-h-[560px] h-[75vh] flex flex-col rounded-3xl bg-[#fbf9f4] border border-[#e9e8e3] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 ${
            isModalDragging ? 'ring-2 ring-[#D8B454] shadow-2xl' : ''
          }`}
        >
          {/* Draggable Header Bar */}
          <div
            onMouseDown={handleModalMouseDown}
            onTouchStart={handleModalTouchStart}
            onTouchMove={handleModalTouchMove}
            onTouchEnd={handleModalTouchEnd}
            style={{ touchAction: 'none' }}
            className={`p-3 bg-gradient-to-r from-[#1a1c1a] to-[#2d533f] text-white flex items-center justify-between select-none ${
              isModalDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            title="Nhấn giữ và kéo thanh tiêu đề này để di chuyển cửa sổ chat tự do"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#D8B454] flex items-center justify-center text-[#2d533f] shadow-xs">
                {/* App emblem */}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" />
                  <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.4" />
                </svg>
              </div>
              <div>
                <h3 className="font-headline font-bold text-xs tracking-wide flex items-center gap-1.5">
                  Cố Vấn Di Sản AI
                </h3>
                <span className="text-[10px] text-stone-300 block">
                  54 dân tộc & triều đại Việt
                </span>
              </div>
            </div>

            {/* Header controls & drag indicator badge */}
            <div className="flex items-center gap-1.5">
              {/* Grip badge indicator */}
              <div
                className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-stone-200 text-[10px] font-medium"
                title="Kéo thanh này để di chuyển vị trí"
              >
                <svg viewBox="0 0 10 16" fill="currentColor" className="w-2 h-2.5">
                  <circle cx="2" cy="2" r="1.3" />
                  <circle cx="8" cy="2" r="1.3" />
                  <circle cx="2" cy="8" r="1.3" />
                  <circle cx="8" cy="8" r="1.3" />
                  <circle cx="2" cy="14" r="1.3" />
                  <circle cx="8" cy="14" r="1.3" />
                </svg>
                <span>Kéo di chuyển</span>
              </div>

              {/* Reset to bottom-right position button */}
              <button
                onClick={resetModalPosition}
                className="p-1 rounded-lg text-stone-300 hover:text-white hover:bg-white/15 transition-colors cursor-pointer text-xs"
                title="Đặt lại vị trí góc dưới"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
              </button>

              <button
                onClick={handleClearHistory}
                className="px-2 py-1 rounded-lg text-[11px] text-stone-300 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
                title="Làm mới cuộc trò chuyện"
              >
                Làm mới
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:text-white hover:bg-white/15 transition-colors cursor-pointer text-sm font-bold"
                title="Thu nhỏ / Đóng"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Scrollable Message Thread */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 text-xs font-body-sm">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-[#2d533f] text-white rounded-br-xs'
                      : 'bg-white text-stone-800 border border-[#e9e8e3] shadow-2xs rounded-bl-xs text-xs'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 justify-start">
                <div className="bg-white p-3 rounded-2xl border border-[#e9e8e3] shadow-2xs text-stone-500 italic flex items-center gap-1.5 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2d533f] animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2d533f] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2d533f] animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-1 text-[11px]">Đang tra cứu tư liệu di sản...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-3 py-2 bg-stone-100/70 border-t border-[#e9e8e3] overflow-x-auto whitespace-nowrap flex gap-1.5 text-[11px]">
            {QUICK_TOPICS.map((topic, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(topic)}
                className="px-2.5 py-1 rounded-full bg-white border border-[#e9e8e3] hover:border-[#2d533f] text-stone-700 hover:text-[#2d533f] transition-colors shrink-0 cursor-pointer"
              >
                {topic}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-2.5 bg-white border-t border-[#e9e8e3] flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              placeholder="Hỏi về hoa văn, điển chế, chất liệu..."
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-[#f5f4ef] border border-[#e9e8e3] focus:outline-hidden focus:ring-1 focus:ring-[#2d533f]"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputMessage.trim()}
              className="px-3.5 py-2 rounded-xl bg-[#2d533f] text-white text-xs font-semibold hover:bg-[#456b56] disabled:opacity-40 transition-colors cursor-pointer shrink-0 shadow-2xs"
            >
              Gửi
            </button>
          </div>
        </div>
      )}
    </>
  );
};
