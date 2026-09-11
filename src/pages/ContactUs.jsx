import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Send, User, Bot, Phone, Mail, MapPin } from 'lucide-react';
import ShimmerButton from '../components/ShimmerButton';

export default function ContactUs() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Welcome to IMXX Premium Support. I am your Digital Concierge. How may I assist you with your luxury travel arrangements today?',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newUserMessage = { id: Date.now(), sender: 'user', text: inputValue };
    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI Response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        sender: 'ai',
        text: 'I understand you have an inquiry. Connecting you to our global intelligence network to construct the optimal solution...',
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-24 pb-20 px-6 md:px-12 relative overflow-hidden"
    >
      {/* Ambient Lighting */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-amber-500/10 via-amber-500/5 to-transparent blur-[120px] pointer-events-none -z-10 rounded-full" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-500/10 to-transparent blur-[120px] pointer-events-none -z-10 rounded-full" />

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-4">
            Digital{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">
              Concierge
            </span>
          </h1>
          <p className="text-slate-400 font-medium tracking-wide max-w-2xl mx-auto">
            Connect directly with our elite support architects or query our intelligence engine for
            immediate assistance.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[600px]">
          {/* Left Column: Direct Contact Info (4 Cols) */}
          <div className="lg:col-span-4 space-y-6 flex flex-col">
            <div className="bg-[#080c14]/80 backdrop-blur-2xl border border-slate-800/60 rounded-3xl p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] flex-1">
              <h3 className="text-2xl font-black text-white mb-8">Priority Channels</h3>

              <div className="space-y-8">
                <div className="flex items-start space-x-4 group cursor-pointer">
                  <div className="w-12 h-12 rounded-2xl bg-[#020408] border border-slate-800 flex items-center justify-center shrink-0 group-hover:border-amber-500 transition-colors">
                    <Phone className="w-5 h-5 text-slate-400 group-hover:text-amber-500 transition-colors" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mb-1">
                      Global Hotline
                    </div>
                    <div className="text-white font-bold tracking-wide">+1 (800) 555-IMXX</div>
                  </div>
                </div>

                <div className="flex items-start space-x-4 group cursor-pointer">
                  <div className="w-12 h-12 rounded-2xl bg-[#020408] border border-slate-800 flex items-center justify-center shrink-0 group-hover:border-amber-500 transition-colors">
                    <Mail className="w-5 h-5 text-slate-400 group-hover:text-amber-500 transition-colors" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mb-1">
                      Priority Desk
                    </div>
                    <div className="text-white font-bold tracking-wide">concierge@imxx.com</div>
                  </div>
                </div>

                <div className="flex items-start space-x-4 group cursor-pointer">
                  <div className="w-12 h-12 rounded-2xl bg-[#020408] border border-slate-800 flex items-center justify-center shrink-0 group-hover:border-amber-500 transition-colors">
                    <MapPin className="w-5 h-5 text-slate-400 group-hover:text-amber-500 transition-colors" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mb-1">
                      Headquarters
                    </div>
                    <div className="text-white font-bold tracking-wide">
                      One World Trade Center
                      <br />
                      Suite 8500, NY
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: AI Chat Interface (8 Cols) */}
          <div className="lg:col-span-8 bg-[#080c14]/80 backdrop-blur-2xl border border-slate-800/60 rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden relative">
            {/* Header */}
            <div className="h-20 border-b border-slate-800/60 flex items-center justify-between px-8 bg-[#020408]/50 relative z-10">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                    <Sparkles className="w-5 h-5 text-black" />
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#080c14] rounded-full" />
                </div>
                <div>
                  <h3 className="text-white font-bold tracking-wide leading-tight">
                    IMXX Intelligence
                  </h3>
                  <div className="text-[10px] text-emerald-400 font-mono tracking-widest uppercase">
                    Systems Online
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar relative z-10">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end`}
                  >
                    {/* Avatar */}
                    <div
                      className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center mb-1
                      ${
                        msg.sender === 'user'
                          ? 'bg-slate-800 ml-3'
                          : 'bg-gradient-to-br from-amber-200 to-amber-500 mr-3 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                      }`}
                    >
                      {msg.sender === 'user' ? (
                        <User className="w-4 h-4 text-slate-400" />
                      ) : (
                        <Bot className="w-4 h-4 text-black" />
                      )}
                    </div>

                    {/* Bubble */}
                    <div
                      className={`p-4 rounded-2xl border
                      ${
                        msg.sender === 'user'
                          ? 'bg-[#121826] border-slate-800 rounded-br-sm'
                          : 'bg-[#020408]/80 border-slate-800/80 rounded-bl-sm backdrop-blur-md'
                      }`}
                    >
                      <p className="text-sm text-slate-200 leading-relaxed font-medium">
                        {msg.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex max-w-[80%] flex-row items-end">
                    <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center mb-1 bg-gradient-to-br from-amber-200 to-amber-500 mr-3 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                      <Sparkles
                        className="w-4 h-4 text-black animate-spin"
                        style={{ animationDuration: '3s' }}
                      />
                    </div>
                    <div className="p-4 rounded-2xl bg-[#020408]/80 border border-slate-800/80 rounded-bl-sm backdrop-blur-md flex space-x-1 items-center h-[52px]">
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                        className="w-1.5 h-1.5 bg-amber-500 rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                        className="w-1.5 h-1.5 bg-amber-500 rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                        className="w-1.5 h-1.5 bg-amber-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-[#020408]/80 backdrop-blur-md border-t border-slate-800/60 relative z-10">
              <form onSubmit={handleSend} className="relative flex items-center">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Initiate secure transmission..."
                  className="w-full bg-[#121826] border border-slate-800 text-white text-sm rounded-xl pl-6 pr-16 py-4 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-shadow"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="absolute right-2 w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all"
                >
                  <Send className="w-4 h-4 text-black -ml-0.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
