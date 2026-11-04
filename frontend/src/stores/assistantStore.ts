import { create } from 'zustand';
import { ConversationMessage } from '@/types';

interface AssistantState {
  messages: ConversationMessage[];
  isListening: boolean;
  isThinking: boolean;
  isSpeaking: boolean;

  startListening: () => void;
  stopListening: () => void;
  sendMessage: (text: string, currentPoiId?: number, langCode?: string) => Promise<void>;
  clearConversation: () => void;
}

export const useAssistantStore = create<AssistantState>((set, get) => ({
  messages: [
    {
      id: 1,
      sessionId: 1,
      senderType: 'ASSISTANT',
      inputType: 'TEXT',
      content: 'Xin chào! Tôi là Trợ lý du lịch ảo của bạn. Hãy chạm vào micro hoặc gõ câu hỏi, tôi sẽ trả lời và đối đáp bằng giọng nói với bạn nhé!',
      createdAt: new Date().toISOString(),
    },
  ],
  isListening: false,
  isThinking: false,
  isSpeaking: false,

  startListening: () => set({ isListening: true }),
  stopListening: () => set({ isListening: false }),

  sendMessage: async (text: string, currentPoiId?: number, langCode = 'vi') => {
    if (!text.trim()) return;

    const userMsg: ConversationMessage = {
      id: Date.now(),
      sessionId: 1,
      senderType: 'USER',
      inputType: 'VOICE',
      content: text,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, userMsg],
      isThinking: true,
      isListening: false,
    }));

    // Giả lập xử lý AI contextual RAG + TTS
    setTimeout(() => {
      let aiResponseText = '';
      if (currentPoiId === 1) {
        aiResponseText = 'Bến Nhà Rồng được khởi công xây dựng vào năm 1863 bởi hãng vận tải Pháp Messageries Impériales. Nơi đây mở cửa đón khách từ 7h30 đến 17h00 từ Thứ 3 đến Chủ Nhật.';
      } else if (currentPoiId === 2) {
        aiResponseText = 'Chợ Xóm Chiếu (Chợ 200) nổi tiếng với các món ốc, phá lấu, súp cua và đồ ăn vặt Nam Bộ. Khu ẩm thực hoạt động nhộn nhịp nhất từ 15h chiều đến nửa đêm!';
      } else if (text.toLowerCase().includes('ăn') || text.toLowerCase().includes('ngon')) {
        aiResponseText = 'Gần khu vực Quận 4, bạn không nên bỏ lỡ Phá Lấu bò đường Tôn Đản, ốc Oanh trên đường Vĩnh Khánh và khu ẩm thực Chợ Xóm Chiếu nhé!';
      } else {
        aiResponseText = `Cảm ơn bạn đã hỏi về "${text}". Khu vực Khánh Hội - Vĩnh Hội - Xóm Chiếu có bề dày lịch sử và văn hóa ẩm thực phong phú. Bạn có muốn tôi giới thiệu tour tham quan phù hợp không?`;
      }

      const aiMsg: ConversationMessage = {
        id: Date.now() + 1,
        sessionId: 1,
        senderType: 'ASSISTANT',
        inputType: 'VOICE',
        content: aiResponseText,
        createdAt: new Date().toISOString(),
      };

      set((state) => ({
        messages: [...state.messages, aiMsg],
        isThinking: false,
        isSpeaking: true,
      }));

      // Kích hoạt giọng nói trên trình duyệt (Web Speech API)
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(aiResponseText);
        utterance.lang = langCode === 'vi' ? 'vi-VN' : 'en-US';
        utterance.onend = () => set({ isSpeaking: false });
        utterance.onerror = () => set({ isSpeaking: false });
        window.speechSynthesis.speak(utterance);
      } else {
        setTimeout(() => set({ isSpeaking: false }), 4000);
      }
    }, 1200);
  },

  clearConversation: () => set({ messages: [] }),
}));
