'use client';

import { useState, useRef, useEffect } from 'react';
import { useAssistantStore } from '@/stores/assistantStore';
import { useLanguageStore } from '@/stores/languageStore';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  Trash2,
  Sparkles,
  Languages,
  MessageSquare,
  ArrowRightLeft,
  VolumeX,
  Compass,
  CheckCircle2,
  HelpCircle,
  ChevronRight,
  Bot,
  User,
} from 'lucide-react';

export default function AssistantPage() {
  const [activeTab, setActiveTab] = useState<'CHAT' | 'TRANSLATE'>('CHAT');
  const [inputText, setInputText] = useState('');
  const [translateSource, setTranslateSource] = useState('vi');
  const [translateTarget, setTranslateTarget] = useState('en');
  const [sourceText, setSourceText] = useState('');
  const [translatedResult, setTranslatedResult] = useState('');

  const {
    messages,
    isListening,
    isThinking,
    isSpeaking,
    sendMessage,
    startListening,
    stopListening,
    clearConversation,
  } = useAssistantStore();

  const { getActiveLanguages } = useLanguageStore();
  const languages = getActiveLanguages();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendText = () => {
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText('');
  };

  const toggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
      // Mô phỏng nhận diện giọng nói
      setTimeout(() => {
        const sampleVoices = [
          'Bến Nhà Rồng có mở cửa vào buổi tối không?',
          'Quanh đây có quán cà phê nào view đẹp ngắm sông?',
          'Chợ Xóm Chiếu có những món ăn vặt gì đặc sắc?',
          'Làm sao để đi xe buýt từ đây về Quận 1?',
        ];
        const randomVoice = sampleVoices[Math.floor(Math.random() * sampleVoices.length)];
        sendMessage(randomVoice);
      }, 2200);
    }
  };

  const handleSimulateTranslate = (text: string) => {
    setSourceText(text);
    if (text.includes('xin chào') || text.includes('hello')) {
      setTranslatedResult('Hello! Welcome to District 4, Ho Chi Minh City.');
    } else if (text.includes('bao nhiêu tiền') || text.includes('how much')) {
      setTranslatedResult('How much does this dish cost?');
    } else if (text.includes('đường nào') || text.includes('way')) {
      setTranslatedResult('Which way to Nha Rong Port?');
    } else {
      setTranslatedResult(`[Dịch sang ${translateTarget}]: ${text}`);
    }
  };

  const topicPrompts = [
    { title: 'Lịch sử Bến Nhà Rồng', prompt: 'Kể cho tôi nghe về lịch sử Bến Nhà Rồng và Bác Hồ ra đi tìm đường cứu nước' },
    { title: 'Ẩm thực Chợ Xóm Chiếu', prompt: 'Chợ Xóm Chiếu có những quán ốc và món ăn vặt nào ngon nổi tiếng?' },
    { title: 'Tuyến xe buýt Quận 4', prompt: 'Những tuyến xe buýt nào kết nối qua các di tích tại Quận 4?' },
    { title: 'Điểm tham quan gần đây', prompt: 'Quanh vị trí của tôi có điểm tham quan nào trong bán kính 500m?' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-28 pt-2 md:pt-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header with Mode Switcher */}
        <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 pb-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-2xl border border-slate-700">
            <button
              onClick={() => setActiveTab('CHAT')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'CHAT'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hỏi đáp Voice AI</span>
            </button>

            <button
              onClick={() => setActiveTab('TRANSLATE')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'TRANSLATE'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Languages className="w-3.5 h-3.5" />
              <span>Dịch đàm thoại 2 chiều</span>
            </button>
          </div>

          {activeTab === 'CHAT' && (
            <button
              onClick={clearConversation}
              className="p-2 text-slate-400 hover:text-rose-400 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Xóa cuộc trò chuyện"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Làm mới hội thoại</span>
            </button>
          )}
        </header>

        {/* Tab 1: Voice AI Travel Companion */}
        {activeTab === 'CHAT' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Desktop Left Sidebar: Prompts & Persona Info (4 cols) */}
            <div className="hidden md:flex md:col-span-4 flex-col space-y-4">
              {/* Persona Card */}
              <div className="bg-slate-800/80 rounded-3xl p-5 border border-slate-700 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-md">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Hướng dẫn viên AI Quận 4</h3>
                    <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      Trợ lý giọng nói trực tuyến
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Được huấn luyện sâu với dữ liệu lịch sử, văn hóa, ẩm thực và lộ trình xe buýt 3 phường Khánh Hội, Vĩnh Hội, Xóm Chiếu.
                </p>
              </div>

              {/* Suggested Topics Card */}
              <div className="bg-slate-800/80 rounded-3xl p-5 border border-slate-700 space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Chủ đề thường hỏi:
                </span>
                <div className="space-y-2">
                  {topicPrompts.map((topic, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendMessage(topic.prompt)}
                      className="w-full text-left p-3 rounded-2xl bg-slate-900/60 hover:bg-slate-900 text-slate-200 hover:text-white border border-slate-800 hover:border-emerald-500/50 transition-all text-xs flex items-center justify-between group"
                    >
                      <span className="truncate">{topic.title}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Chat Area (8 cols on md, 12 cols on mobile) */}
            <div className="md:col-span-8 bg-slate-800/50 rounded-3xl border border-slate-800 p-4 sm:p-6 flex flex-col h-[650px] shadow-xl">
              {/* Chat Messages Feed */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
                {messages.map((msg) => {
                  const isAi = msg.senderType === 'ASSISTANT';
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${isAi ? 'justify-start' : 'justify-end'}`}
                    >
                      {isAi && (
                        <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shrink-0 shadow-md">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                      )}

                      <div
                        className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 text-xs sm:text-sm leading-relaxed shadow-sm ${
                          isAi
                            ? 'bg-slate-800 text-slate-100 border border-slate-700/80 rounded-tl-sm'
                            : 'bg-emerald-600 text-white rounded-tr-sm'
                        }`}
                      >
                        <p>{msg.content}</p>
                        {isAi && (
                          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-700/50 text-[10px] text-emerald-400">
                            <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                            <span>Đã phát âm thanh giọng nói</span>
                          </div>
                        )}
                      </div>

                      {!isAi && (
                        <div className="w-9 h-9 rounded-2xl bg-slate-700 flex items-center justify-center shrink-0 shadow-md">
                          <User className="w-4 h-4 text-slate-300" />
                        </div>
                      )}
                    </div>
                  );
                })}

                {isThinking && (
                  <div className="flex gap-3 items-center text-slate-400 text-xs py-2">
                    <div className="w-9 h-9 rounded-2xl bg-slate-800 flex items-center justify-center animate-pulse">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="animate-pulse">Trợ lý AI đang suy nghĩ & sinh âm thanh thuyết minh...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Bottom Microphone Waveform Visualizer & Input Bar */}
              <div className="pt-4 border-t border-slate-800 flex flex-col items-center">
                {/* Waveform Animation */}
                <div className="h-10 flex items-center gap-1.5 mb-3">
                  {isListening || isSpeaking ? (
                    <>
                      <span className="w-1.5 bg-emerald-400 h-6 animate-bounce rounded-full"></span>
                      <span className="w-1.5 bg-cyan-400 h-10 animate-bounce delay-75 rounded-full"></span>
                      <span className="w-1.5 bg-emerald-500 h-8 animate-bounce delay-150 rounded-full"></span>
                      <span className="w-1.5 bg-teal-400 h-4 animate-bounce delay-100 rounded-full"></span>
                      <span className="w-1.5 bg-emerald-400 h-7 animate-bounce delay-200 rounded-full"></span>
                      <span className="w-1.5 bg-cyan-300 h-9 animate-bounce delay-300 rounded-full"></span>
                    </>
                  ) : (
                    <span className="text-[11px] text-slate-500 font-medium">
                      Nhấn giữ hoặc chạm Micro để nói chuyện trực tiếp với AI
                    </span>
                  )}
                </div>

                {/* Central Push-to-Talk Mic Button */}
                <div className="mb-4">
                  <button
                    onClick={toggleMic}
                    className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                      isListening
                        ? 'bg-rose-600 text-white shadow-xl shadow-rose-600/40 scale-110'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-600/30 active:scale-95'
                    }`}
                  >
                    {isListening && (
                      <span className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-50"></span>
                    )}
                    {isListening ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
                  </button>
                </div>

                {/* Fallback Text Input */}
                <div className="w-full flex items-center gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
                    placeholder="Hoặc nhập câu hỏi văn bản tại đây..."
                    className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  <button
                    onClick={handleSendText}
                    className="p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl transition-colors shrink-0 shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Conversational Live Translator */}
        {activeTab === 'TRANSLATE' && (
          <div className="space-y-6">
            {/* Language pair bar */}
            <div className="bg-slate-800/80 rounded-3xl p-5 border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex-1 w-full sm:w-auto">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Ngôn ngữ Du khách (Nói vào):
                </label>
                <select
                  value={translateSource}
                  onChange={(e) => setTranslateSource(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {languages.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.nativeName} ({l.name})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => {
                  const temp = translateSource;
                  setTranslateSource(translateTarget);
                  setTranslateTarget(temp);
                }}
                className="w-10 h-10 rounded-2xl bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center transition-colors shrink-0"
                title="Đổi chiều ngôn ngữ"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>

              <div className="flex-1 w-full sm:w-auto">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Ngôn ngữ Bản địa (Dịch ra & phát loa):
                </label>
                <select
                  value={translateTarget}
                  onChange={(e) => setTranslateTarget(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {languages.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.nativeName} ({l.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Side-by-Side Dual Station Cards on Desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Station 1: Source Language Input */}
              <div className="bg-slate-800/80 rounded-3xl p-6 border border-slate-700 flex flex-col justify-between h-80 shadow-md">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      Du khách phát biểu:
                    </span>
                    <span className="text-xs text-slate-400">{translateSource.toUpperCase()}</span>
                  </div>
                  <p className="text-sm text-slate-200 min-h-[60px] italic">
                    {sourceText ? `"${sourceText}"` : 'Nhấn Micro bên dưới hoặc chọn câu thoại mẫu để dịch...'}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-700/60 flex items-center justify-center">
                  <button
                    onClick={() => handleSimulateTranslate('Xin chào, đĩa cơm tấm này bao nhiêu tiền?')}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 active:scale-95 transition-all"
                  >
                    <Mic className="w-4 h-4" />
                    <span>Nói câu tiếng Việt</span>
                  </button>
                </div>
              </div>

              {/* Station 2: Target Translation Output */}
              <div className="bg-slate-800/80 rounded-3xl p-6 border border-slate-700 flex flex-col justify-between h-80 shadow-md">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                      Kết quả dịch & Phát loa:
                    </span>
                    <span className="text-xs text-slate-400">{translateTarget.toUpperCase()}</span>
                  </div>
                  <p className="text-base text-white font-medium min-h-[60px]">
                    {translatedResult || 'Bản dịch giọng nói sẽ hiển thị tại đây và tự động phát âm thanh...'}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-700/60 flex items-center justify-between">
                  <button
                    onClick={() => {
                      if (translatedResult) alert(`[TTS]: Đang phát loa kết quả: "${translatedResult}"`);
                    }}
                    disabled={!translatedResult}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white text-xs font-semibold transition-colors"
                  >
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    <span>Phát lại âm thanh</span>
                  </button>

                  <span className="text-[10px] text-slate-400">
                    Auto-TTS Enabled
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Travel Phrases Cards */}
            <div className="bg-slate-800/40 rounded-3xl p-6 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Mẫu hội thoại thường dùng khi đi du lịch:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {[
                  'Xin chào, món này bao nhiêu tiền một phần?',
                  'Làm ơn cho tôi hỏi đường đi Bến Nhà Rồng?',
                  'Xe buýt mấy giờ có chuyến kế tiếp?',
                  'Chùa Vĩnh Hội mở cửa đến mấy giờ?',
                  'Cho tôi xin hóa đơn thanh toán.',
                  'Quanh đây có nhà vệ sinh công cộng không?',
                ].map((phrase, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSimulateTranslate(phrase)}
                    className="text-left text-xs bg-slate-800 hover:bg-slate-700/80 text-slate-300 hover:text-white p-3 rounded-2xl border border-slate-700 transition-colors"
                  >
                    💬 {phrase}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}