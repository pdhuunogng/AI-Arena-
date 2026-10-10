import React, { useState, useRef, useEffect } from 'react';
import { useCostumeStore } from '../../store/useCostumeStore';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  BookOpen
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export const CulturalChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Kính chào quý khách! Tôi là Cố Vấn Văn Hóa & Phong Cách Việt Cổ Y Phong AI tại sự kiện AI ARENA 2026. Quý khách cần tra cứu điển chế trang phục triều đại, ý nghĩa hoa văn thổ cẩm 54 dân tộc, hay cần lời khuyên phối đồ cho sự kiện cụ thể nào?',
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
    } catch (err: any) {
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
      {/* Floating Chat Trigger Button */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#2d533f] text-white shadow-xl hover:bg-[#456b56] hover:scale-105 active:scale-95 transition-all cursor-pointer font-label-md font-semibold text-xs sm:text-sm border border-white/20"
          title="Trò chuyện với Cố Vấn Văn Hóa AI"
        >
          <Sparkles className="w-4 h-4 animate-pulse text-[#caa749]" />
          <span className="hidden sm:inline">Cố Vấn AI Y Phong</span>
          <span className="sm:hidden">Hỏi AI</span>
        </button>
      </div>

      {/* Floating Chat Modal / Drawer */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] max-h-[600px] h-[80vh] flex flex-col rounded-3xl bg-[#fbf9f4] border border-[#e9e8e3] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#1a1c1a] to-[#2d533f] text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#2d533f] flex items-center justify-center text-white shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-headline font-bold text-sm tracking-wide">
                  Cố Vấn Việt Cổ Y Phong AI
                </h3>
                <span className="text-[11px] text-stone-300 block font-body-sm">
                  Hỏi đáp văn hóa & Điển chế 54 dân tộc
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearHistory}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Làm mới cuộc trò chuyện"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Đóng cửa sổ"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scrollable Message Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs font-body-sm">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-[#2d533f]/15 text-[#2d533f] flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] p-3 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-[#2d533f] text-white rounded-br-xs'
                      : 'bg-white text-stone-800 border border-[#e9e8e3] shadow-2xs rounded-bl-xs font-body-sm text-[13px]'
                  }`}
                >
                  {msg.content}
                </div>

                {msg.role === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-stone-300 text-stone-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-6 h-6 rounded-full bg-[#2d533f]/15 text-[#2d533f] flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white p-3 rounded-2xl border border-[#e9e8e3] shadow-2xs text-stone-500 italic flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2d533f] animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2d533f] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2d533f] animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-1 text-[11px]">Đang tra cứu tư liệu khảo cứu...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-3 py-2 bg-stone-100/70 border-t border-[#e9e8e3] overflow-x-auto whitespace-nowrap flex gap-1.5 text-[11px] no-scrollbar">
            {QUICK_TOPICS.map((topic, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(topic)}
                className="px-2.5 py-1 rounded-full bg-white border border-[#e9e8e3] hover:border-[#2d533f] text-stone-700 hover:text-[#2d533f] transition-colors shrink-0 cursor-pointer font-label-sm"
              >
                {topic}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-[#e9e8e3] flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              placeholder="Nhập câu hỏi về cổ phục & văn hóa..."
              className="flex-1 p-2 text-xs rounded-xl bg-[#f5f4ef] border border-[#e9e8e3] focus:outline-hidden focus:ring-1 focus:ring-[#2d533f]"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputMessage.trim()}
              className="p-2 rounded-xl bg-[#2d533f] text-white hover:bg-[#456b56] disabled:opacity-40 transition-colors cursor-pointer shrink-0 shadow-2xs"
              title="Gửi câu hỏi"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
