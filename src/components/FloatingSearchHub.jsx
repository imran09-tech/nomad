import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Calendar, Users } from 'lucide-react';

export default function FloatingSearchHub() {
  const [activeTab, setActiveTab] = useState('flights');

  const tabs = [
    { id: 'flights', label: 'Flights' },
    { id: 'hotels', label: 'Hotels' },
    { id: 'trains', label: 'Trains' },
    { id: 'tours', label: 'Tours' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-4xl mx-auto bg-slate-900/20 backdrop-blur-2xl border border-slate-800/40 rounded-3xl p-6 shadow-2xl relative z-20"
    >
      {/* Tabs */}
      <div className="flex space-x-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-5 py-2.5 rounded-xl text-[11px] uppercase tracking-widest font-bold transition-colors ${
              activeTab === tab.id ? 'text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="search-hub-active-tab"
                className="absolute inset-0 bg-slate-800/80 border border-slate-700/50 rounded-xl"
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Input: Origin */}
        <div className="relative col-span-1 md:col-span-1">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="From where?"
            className="w-full bg-[#05080f] shadow-inner text-white placeholder:text-slate-600 rounded-2xl pl-11 pr-4 py-4 text-sm focus:outline-none focus:border-amber-500/80 focus:ring-4 focus:ring-amber-500/10 border border-slate-800/60 transition-all duration-500 font-medium tracking-wide"
          />
        </div>

        {/* Input: Destination */}
        <div className="relative col-span-1 md:col-span-1">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Where to?"
            className="w-full bg-[#05080f] shadow-inner text-white placeholder:text-slate-600 rounded-2xl pl-11 pr-4 py-4 text-sm focus:outline-none focus:border-amber-500/80 focus:ring-4 focus:ring-amber-500/10 border border-slate-800/60 transition-all duration-500 font-medium tracking-wide"
          />
        </div>

        {/* Input: Date */}
        <div className="relative col-span-1 md:col-span-1">
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Dates"
            className="w-full bg-[#05080f] shadow-inner text-white placeholder:text-slate-600 rounded-2xl pl-11 pr-4 py-4 text-sm focus:outline-none focus:border-amber-500/80 focus:ring-4 focus:ring-amber-500/10 border border-slate-800/60 transition-all duration-500 font-medium tracking-wide"
          />
        </div>

        {/* Input: Guests */}
        <div className="relative col-span-1 md:col-span-1 flex space-x-3">
          <div className="relative flex-1">
            <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Travelers"
              className="w-full bg-[#05080f] shadow-inner text-white placeholder:text-slate-600 rounded-2xl pl-11 pr-4 py-4 text-sm focus:outline-none focus:border-amber-500/80 focus:ring-4 focus:ring-amber-500/10 border border-slate-800/60 transition-all duration-500 font-medium tracking-wide"
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="bg-amber-500 hover:bg-amber-400 text-black px-5 rounded-2xl flex items-center justify-center transition-colors shadow-[0_0_15px_rgba(245,158,11,0.3)]"
          >
            <Search className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
