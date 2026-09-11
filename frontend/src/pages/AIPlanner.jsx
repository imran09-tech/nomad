import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MapPin, Calendar, DollarSign, Clock, Map } from 'lucide-react';
import ShimmerButton from '../components/ShimmerButton';
import { AsymmetricBento, AsymmetricBentoItem } from '../components/AsymmetricBento';

export default function AIPlanner() {
  const [step, setStep] = useState(1); // 1: Input, 2: Loading, 3: Result
  
  const generateTrip = () => {
    setStep(2);
    setTimeout(() => {
      setStep(3);
    }, 2500); // Simulate AI thinking
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen relative pt-24 px-6 md:px-12 pb-24 overflow-hidden"
    >
      {/* Ambient Pink Glow */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-pink-500/10 to-transparent blur-[100px] pointer-events-none -z-10 rounded-full" />

      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-pink-500 to-indigo-500 mb-6 shadow-[0_0_30px_rgba(236,72,153,0.3)]"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-4">
            IMXX AI Travel Architect
          </h1>
          <p className="text-slate-400 font-medium tracking-wide">Enter your parameters. The intelligence constructs the perfect odyssey.</p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#080c14]/80 backdrop-blur-2xl border border-slate-800/40 rounded-3xl p-8 md:p-12 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)]"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input type="text" defaultValue="Kyoto, Japan" className="w-full bg-[#020408] shadow-inner text-white rounded-2xl pl-12 pr-4 py-5 font-bold tracking-wide focus:outline-none focus:ring-2 focus:ring-pink-500/50 border border-slate-800/60 transition-all" />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input type="text" defaultValue="7 Days" className="w-full bg-[#020408] shadow-inner text-white rounded-2xl pl-12 pr-4 py-5 font-bold tracking-wide focus:outline-none focus:ring-2 focus:ring-pink-500/50 border border-slate-800/60 transition-all" />
                </div>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input type="text" defaultValue="$12,000" className="w-full bg-[#020408] shadow-inner text-white rounded-2xl pl-12 pr-4 py-5 font-bold tracking-wide focus:outline-none focus:ring-2 focus:ring-pink-500/50 border border-slate-800/60 transition-all" />
                </div>
              </div>
              <div className="flex justify-center">
                <ShimmerButton onClick={generateTrip} className="!w-full md:!w-auto !px-16 !py-5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white shadow-[0_0_20px_rgba(236,72,153,0.3)]">
                  Generate Masterpiece
                </ShimmerButton>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 border-4 border-slate-800/40 border-t-pink-500 rounded-full mb-8 shadow-[0_0_30px_rgba(236,72,153,0.4)]"
              />
              <motion.h3 
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-xl font-bold tracking-widest uppercase text-pink-400 font-mono"
              >
                Synthesizing Itinerary...
              </motion.h3>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Cost Breakdown */}
              <div className="flex justify-between items-end mb-4">
                <h3 className="text-2xl font-black text-white">Projected Architecture</h3>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-mono font-bold tracking-widest uppercase">Total Estimate</div>
                  <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400">$11,850</div>
                </div>
              </div>

              {/* Timeline Items */}
              <div className="relative border-l-2 border-dashed border-slate-800/80 ml-6 pl-10 space-y-12">
                 
                 {/* Item 1 */}
                 <div className="relative group">
                   <div className="absolute -left-[45px] top-1 w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                     <div className="w-2 h-2 bg-indigo-400 rounded-full" />
                   </div>
                   <div className="text-[10px] text-indigo-400 font-mono font-bold tracking-widest uppercase mb-1">Day 1 • Arrival</div>
                   <h4 className="text-2xl font-black text-white mb-4">Aman Kyoto Sanctuary</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="bg-[#080c14] border border-slate-800/60 p-4 rounded-2xl flex items-center space-x-4 transition-colors hover:border-slate-700">
                       <div className="w-12 h-12 rounded-xl bg-slate-800 overflow-hidden"><img src="https://images.unsplash.com/photo-1542314831-c6a4d14d8c85?q=80&w=100" className="w-full h-full object-cover"/></div>
                       <div>
                         <div className="text-white font-bold tracking-wide">Suite Check-in</div>
                         <div className="text-xs text-slate-500 font-mono tracking-widest mt-1 uppercase">14:00</div>
                       </div>
                     </div>
                   </div>
                 </div>

                 {/* Item 2 */}
                 <div className="relative group">
                   <div className="absolute -left-[45px] top-1 w-6 h-6 rounded-full bg-pink-500/20 border border-pink-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(236,72,153,0.3)]">
                     <div className="w-2 h-2 bg-pink-400 rounded-full" />
                   </div>
                   <div className="text-[10px] text-pink-400 font-mono font-bold tracking-widest uppercase mb-1">Day 2 • Culture</div>
                   <h4 className="text-2xl font-black text-white mb-4">Private Kinkaku-ji Viewing</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="bg-[#080c14] border border-slate-800/60 p-4 rounded-2xl flex items-center space-x-4 transition-colors hover:border-slate-700">
                       <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center"><Map className="w-5 h-5 text-slate-400" /></div>
                       <div>
                         <div className="text-white font-bold tracking-wide">Guided Tour</div>
                         <div className="text-xs text-slate-500 font-mono tracking-widest mt-1 uppercase">09:00</div>
                       </div>
                     </div>
                     <div className="bg-[#080c14] border border-slate-800/60 p-4 rounded-2xl flex items-center space-x-4 transition-colors hover:border-slate-700">
                       <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center"><Clock className="w-5 h-5 text-slate-400" /></div>
                       <div>
                         <div className="text-white font-bold tracking-wide">Michelin Kaiseki</div>
                         <div className="text-xs text-slate-500 font-mono tracking-widest mt-1 uppercase">19:30</div>
                       </div>
                     </div>
                   </div>
                 </div>

              </div>
              
              <div className="pt-8 flex justify-end">
                 <ShimmerButton className="!px-8 !py-4 bg-gradient-to-r from-emerald-500 to-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                   Lock & Book Itinerary
                 </ShimmerButton>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </motion.div>
  );
}
