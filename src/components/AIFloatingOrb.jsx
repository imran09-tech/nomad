import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, User, Bot, Maximize2, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AIFloatingOrb() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Welcome to IMXX Premium. I am your AI Travel Concierge. How may I elevate your travel arrangements today?',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const nextId = useRef(2);

  const quickPrompts = [
    { text: '🇯🇵 Plan Tokyo Odyssey', query: 'Plan a luxury 5-day itinerary for Tokyo' },
    { text: '🚄 Track Train PNR', query: 'Check train PNR 2737161856' },
    { text: '🏨 Search Bali Villas', query: 'Find the most exclusive luxury villas in Bali' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen]);

  const handleSend = (textToSend) => {
    if (!textToSend.trim()) return;

    const newUserMessage = { id: nextId.current++, sender: 'user', text: textToSend };
    setMessages((prev) => [...prev, newUserMessage]);
    setIsTyping(true);

    const queryLower = textToSend.toLowerCase();

    // Simulate luxury AI response with custom delay
    setTimeout(() => {
      let responseText =
        'IMXX Intelligence system is processing your inquiry. I can assist with booking flights, checking train telemetry, recommending curated stays, or crafting bespoke itineraries. Let me know how you would like to proceed.';

      if (queryLower.includes('tokyo') || queryLower.includes('japan')) {
        responseText =
          "Bespoke Tokyo Odyssey compiled successfully. We have reserved the Deluxe Suite at Aman Tokyo, arranged a private helicopter transfer over Mt. Fuji, and secured a VIP dining table at Den. We've also queued Shinkansen First Class (Gran Class) tickets to Kyoto. Would you like to sync this with your planner?";
      } else if (queryLower.includes('pnr') || queryLower.includes('train')) {
        responseText =
          'Querying live rail telemetry... Train PNR 2737161856: Rajdhani Express is running on-schedule, currently traveling at 120 km/h. AC First Class Coach H1 is confirmed, approaching next station. Your boarding credentials have been updated in your travel wallet.';
      } else if (
        queryLower.includes('bali') ||
        queryLower.includes('villa') ||
        queryLower.includes('resort')
      ) {
        responseText =
          'Retrieving IMXX Curated Portfolio: Mandapa, a Ritz-Carlton Reserve (River Front Pool Villa) and Bulgari Resort Bali (Ocean View Cliff Villa) are available with exclusive 15% platinum member upgrades. Private yacht charters from Denpasar are fully clear for booking.';
      }

      const newAiMessage = {
        id: nextId.current++,
        sender: 'ai',
        text: responseText,
      };

      setMessages((prev) => [...prev, newAiMessage]);
      setIsTyping(false);
    }, 1200);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    const msg = inputValue;
    setInputValue('');
    handleSend(msg);
  };

  const handleReset = () => {
    setMessages([
      {
        id: nextId.current++,
        sender: 'ai',
        text: 'System cache cleared. I am your AI Travel Concierge. How may I assist you with your luxury travel arrangements today?',
      },
    ]);
  };

  return (
    <div className="fixed bottom-24 right-6 md:bottom-12 md:right-12 z-[60] flex flex-col items-end pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto mb-4 w-[calc(100vw-32px)] sm:w-[400px] h-[520px] max-h-[calc(100vh-180px)] bg-[#080c14]/95 backdrop-blur-2xl border border-slate-800/80 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden relative"
          >
            {/* Ambient Lighting in Corner */}
            <div className="absolute -top-20 -right-20 w-44 h-44 bg-amber-500/10 blur-[60px] pointer-events-none rounded-full" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-indigo-500/10 blur-[50px] pointer-events-none rounded-full" />

            {/* Header */}
            <div className="h-16 border-b border-slate-800/60 flex items-center justify-between px-6 bg-[#020408]/60 relative z-10">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                    <Sparkles className="w-4 h-4 text-black" />
                  </div>
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#080c14] rounded-full animate-pulse" />
                </div>
                <div>
                  <h3 className="text-white font-black text-sm tracking-wide leading-none">
                    IMXX Intelligence
                  </h3>
                  <div className="text-[9px] text-emerald-400 font-mono tracking-widest uppercase mt-0.5">
                    Active Neural Link
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleReset}
                  title="Reset Chat"
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/contact');
                  }}
                  title="Open Fullscreen Support"
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close Panel"
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div
              className="flex-1 overflow-y-auto p-5 space-y-4 relative z-10"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end`}
                  >
                    {/* Avatar */}
                    <div
                      className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center mb-0.5
                      ${
                        msg.sender === 'user'
                          ? 'bg-slate-800 ml-2.5'
                          : 'bg-gradient-to-br from-amber-200 to-amber-500 mr-2.5 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
                      }`}
                    >
                      {msg.sender === 'user' ? (
                        <User className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <Bot className="w-3.5 h-3.5 text-black" />
                      )}
                    </div>

                    {/* Bubble */}
                    <div
                      className={`p-3.5 rounded-2xl border text-xs leading-relaxed font-medium
                      ${
                        msg.sender === 'user'
                          ? 'bg-[#121826] border-slate-800 text-white rounded-br-sm shadow-md'
                          : 'bg-slate-950/60 border-slate-800/80 text-slate-200 rounded-bl-sm backdrop-blur-md shadow-sm'
                      }`}
                    >
                      <p>{msg.text}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex max-w-[80%] flex-row items-end">
                    <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center mb-0.5 bg-gradient-to-br from-amber-200 to-amber-500 mr-2.5 shadow-[0_0_10px_rgba(245,158,11,0.25)]">
                      <Sparkles
                        className="w-3 h-3 text-black animate-spin"
                        style={{ animationDuration: '3s' }}
                      />
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 rounded-bl-sm backdrop-blur-md flex space-x-1.5 items-center h-[38px] shadow-sm">
                      <motion.div
                        animate={{ y: [0, -4, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                        className="w-1.5 h-1.5 bg-amber-500 rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -4, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }}
                        className="w-1.5 h-1.5 bg-amber-500 rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -4, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }}
                        className="w-1.5 h-1.5 bg-amber-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions Quick Prompts */}
            <div className="px-5 pb-1 relative z-10">
              <div
                className="flex space-x-2 overflow-x-auto pb-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt.text}
                    onClick={() => handleSend(prompt.query)}
                    className="shrink-0 px-3 py-1.5 bg-[#121826]/90 hover:bg-slate-800 border border-slate-800/60 rounded-full text-[10px] font-bold text-slate-300 transition-colors hover:text-white cursor-pointer"
                  >
                    {prompt.text}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Bar */}
            <div className="p-4 bg-[#020408]/85 backdrop-blur-md border-t border-slate-800/60 relative z-10">
              <form onSubmit={onSubmit} className="relative flex items-center">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask about flights, PNRs, villas..."
                  className="w-full bg-[#121826] border border-slate-800 focus:border-amber-500/50 text-white text-xs rounded-xl pl-4 pr-12 py-3.5 focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="absolute right-1.5 w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_12px_rgba(245,158,11,0.4)] transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-black" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Orb */}
      <motion.div
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
          {/* Glowing Auroras */}
          <motion.div
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full opacity-55 blur-xl pointer-events-none"
          />
          <motion.div
            animate={{ rotate: -360, scale: [1, 1.1, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-2 bg-gradient-to-tr from-amber-400 to-pink-500 rounded-full opacity-75 blur-md pointer-events-none"
          />

          {/* Core Orb */}
          <div className="relative z-10 w-12 h-12 md:w-14 md:h-14 bg-[#080c14] border border-white/20 rounded-full shadow-2xl flex items-center justify-center backdrop-blur-xl">
            {isOpen ? (
              <X className="w-5 h-5 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]" />
            ) : (
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
