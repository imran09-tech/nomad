import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Utensils, Star, ChevronDown } from 'lucide-react';

export default function PremiumTrainCard({
  train,
  originCity,
  destinationCity,
  isSelected,
  onSelect,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Extract times
  const depTime = new Date(train.departureTime || new Date()).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  const arrTime = new Date(train.arrivalTime || new Date()).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  const originCode = (originCity || 'ORG').substring(0, 4).toUpperCase();
  const destCode = (destinationCity || 'DST').substring(0, 4).toUpperCase();

  const handleCardClick = () => {
    setIsExpanded(!isExpanded);
  };

  const handleClassSelect = (e, className, price) => {
    e.stopPropagation();
    onSelect(train, className, price);
  };

  return (
    <motion.div
      layout
      transition={{ layout: { type: 'spring', stiffness: 300, damping: 30 } }}
      className={`group relative rounded-3xl overflow-hidden cursor-pointer backdrop-blur-3xl transition-colors duration-500 border ${isSelected ? 'border-amber-500/50 bg-[#090d16]' : 'border-white/5 bg-[#090d16]/60 hover:bg-[#0d111a]/80'}`}
      onClick={handleCardClick}
    >
      {/* Selection Glow */}
      {isSelected && (
        <motion.div
          layoutId={`selection-glow-${train.id}`}
          className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent pointer-events-none"
        />
      )}

      <div className="p-6">
        {/* Header */}
        <motion.div layout className="flex justify-between items-center mb-6">
          <div className="font-bold text-white text-lg tracking-tight">
            {train.routeIdentifier || train.id}{' '}
            <span className="text-slate-400 font-medium ml-2">
              {train.operatorName || 'Express'}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <Utensils className="w-4 h-4 text-slate-500" />
            <div className="bg-white/[0.03] border border-white/5 rounded-full px-3 py-1 text-xs text-amber-500 font-bold flex items-center shadow-[0_0_15px_rgba(245,158,11,0.1)]">
              <Star className="w-3 h-3 mr-1.5 fill-amber-500" /> 4.3
            </div>
          </div>
        </motion.div>

        {/* Timeline Row */}
        <motion.div layout className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="text-2xl text-white font-black tracking-tight">{depTime}</span>
            <span className="text-sm text-slate-500 font-semibold">{originCode}</span>
          </div>

          <div className="flex flex-col items-center flex-1 px-8 relative">
            <span className="text-xs text-slate-500 font-medium mb-2 tracking-widest uppercase">
              {train.durationString || '4h 30m'}
            </span>

            {/* Glowing Trace Light Timeline */}
            <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-slate-700 to-transparent rounded-full relative overflow-hidden">
              <motion.div
                className="absolute top-0 bottom-0 w-24 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_15px_rgba(245,158,11,0.8)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                animate={{ left: ['-30%', '130%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-2xl text-white font-black tracking-tight">{arrTime}</span>
            <span className="text-sm text-slate-500 font-semibold">{destCode}</span>
          </div>
        </motion.div>

        {/* Expand Icon */}
        <motion.div layout className="mt-4 flex justify-center items-center opacity-50">
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <ChevronDown className="w-5 h-5 text-slate-400" />
          </motion.div>
        </motion.div>
      </div>

      {/* Accordion Classes */}
      <AnimatePresence>
        {isExpanded && train.classes && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{
              opacity: { duration: 0.2 },
              height: { type: 'spring', stiffness: 300, damping: 30 },
            }}
            className="overflow-hidden bg-[#05080f]/50 border-t border-white/5"
          >
            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(train.classes).map(([className, price], idx) => {
                const isClassSelected = isSelected && train.chosenClass === className;
                return (
                  <motion.div
                    key={className}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: isClassSelected ? 1.02 : 1,
                    }}
                    whileHover={{ scale: isClassSelected ? 1.02 : 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ delay: idx * 0.05, type: 'spring', stiffness: 300 }}
                    onClick={(e) => handleClassSelect(e, className, price)}
                    className={`relative rounded-2xl p-4 transition-all duration-300 border ${
                      isClassSelected
                        ? 'border-amber-500 bg-slate-900 shadow-[0_0_20px_rgba(245,158,11,0.3)] ring-1 ring-amber-500/20'
                        : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'
                    }`}
                  >
                    {isClassSelected && (
                      <motion.div
                        layoutId={`class-indicator-${train.id}`}
                        className="absolute inset-0 rounded-2xl border-2 border-amber-500 pointer-events-none"
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      />
                    )}
                    <div className="text-xs text-slate-400 font-bold tracking-wider mb-1 uppercase">
                      {className}
                    </div>
                    <div className="text-lg font-black text-white">₹{price}</div>
                    <div
                      className={`text-[10px] mt-2 font-bold uppercase ${
                        ['1A', '2A'].includes(className) ? 'text-emerald-500' : 'text-amber-500'
                      }`}
                    >
                      {['1A', '2A'].includes(className) ? 'Available' : 'Waitlist'}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
