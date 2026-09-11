import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Train, ChevronDown } from 'lucide-react';
import NeonBadge from './NeonBadge';

export default function KineticTransitCard({ transit, originCity, destinationCity, type = 'flight', isSelected, onSelect }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const depTime = new Date(transit.departureTime || new Date()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  const arrTime = new Date(transit.arrivalTime || new Date()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  const originCode = (originCity || 'ORG').substring(0,4).toUpperCase();
  const destCode = (destinationCity || 'DST').substring(0,4).toUpperCase();

  const handleCardClick = () => setIsExpanded(!isExpanded);
  
  const baseColor = type === 'flight' ? 'blue' : 'amber';
  const Icon = type === 'flight' ? Plane : Train;

  return (
    <motion.div 
      layout
      transition={{ layout: { type: "spring", stiffness: 300, damping: 30 } }}
      className={`group relative rounded-3xl overflow-hidden cursor-pointer backdrop-blur-3xl transition-all duration-500 border ${
        isSelected 
          ? `border-${baseColor}-500/50 bg-[#090d16] shadow-2xl shadow-${baseColor}-500/10` 
          : 'border-slate-800/40 bg-slate-900/20 hover:bg-slate-900/40 hover:border-slate-700/60'
      }`}
      onClick={handleCardClick}
    >
      {isSelected && (
        <motion.div 
          layoutId={`transit-selection-glow-${transit.id}`}
          className={`absolute inset-0 bg-gradient-to-r from-${baseColor}-500/10 to-transparent pointer-events-none`}
        />
      )}

      <div className="p-6">
        {/* Header */}
        <motion.div layout className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full bg-${baseColor}-500/10 flex items-center justify-center border border-${baseColor}-500/20`}>
              <Icon className={`w-4 h-4 text-${baseColor}-500`} />
            </div>
            <div className="font-extrabold text-white text-lg tracking-wide">
              {transit.operatorName || 'SkyLux Airlines'} <span className="text-slate-500 font-mono text-sm ml-2">{transit.routeIdentifier || 'FL-492'}</span>
            </div>
          </div>
          <NeonBadge variant={baseColor}>Fastest</NeonBadge>
        </motion.div>

        {/* Kinetic Timeline Row */}
        <motion.div layout className="flex justify-between items-center">
          <div className="flex flex-col items-start w-24">
            <span className="text-3xl text-white font-black tracking-tighter">{depTime}</span>
            <span className="text-xs text-slate-500 font-bold tracking-widest uppercase mt-1">{originCode}</span>
          </div>
          
          <div className="flex flex-col items-center flex-1 px-6 relative group/timeline">
            <span className="text-[10px] text-slate-400 font-mono font-bold tracking-widest uppercase mb-3">
              {transit.durationString || '02H 45M'}
            </span>
            
            {/* Kinetic Vector Line */}
            <div className="w-full h-[2px] bg-slate-800/60 rounded-full relative overflow-hidden flex items-center">
              <div className="absolute left-0 w-1.5 h-1.5 rounded-full bg-slate-600"></div>
              <div className="absolute right-0 w-1.5 h-1.5 rounded-full bg-slate-600"></div>
              
              {/* Neon Tracer Particle */}
              <motion.div 
                className={`absolute w-32 h-[2px] bg-gradient-to-r from-transparent via-${baseColor}-400 to-transparent ${baseColor === 'blue' ? 'shadow-[0_0_15px_rgba(59,130,246,0.8)]' : 'shadow-[0_0_15px_rgba(245,158,11,0.8)]'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                animate={{ left: ["-50%", "150%"] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </div>

          <div className="flex flex-col items-end w-24">
            <span className="text-3xl text-white font-black tracking-tighter">{arrTime}</span>
            <span className="text-xs text-slate-500 font-bold tracking-widest uppercase mt-1">{destCode}</span>
          </div>
        </motion.div>
      </div>

      {/* Accordion Expansion */}
      <AnimatePresence>
        {isExpanded && transit.classes && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ opacity: { duration: 0.2 }, height: { type: "spring", stiffness: 300, damping: 30 } }}
            className="overflow-hidden bg-[#03050a]/40 border-t border-slate-800/40"
          >
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(transit.classes).map(([className, price], idx) => {
                const isClassSelected = isSelected && transit.chosenClass === className;
                return (
                  <motion.div
                    key={className}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: isClassSelected ? 1.02 : 1 }}
                    whileHover={{ scale: isClassSelected ? 1.02 : 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ delay: idx * 0.05, type: 'spring', stiffness: 300 }}
                    onClick={(e) => { e.stopPropagation(); onSelect(transit, className, price); }}
                    className={`relative rounded-2xl p-5 transition-all duration-300 border ${
                      isClassSelected 
                        ? `border-${baseColor}-500 bg-[#090d16] shadow-[0_0_25px_rgba(59,130,246,0.2)] ring-1 ring-${baseColor}-500/20` 
                        : 'border-slate-800/40 bg-slate-900/20 hover:bg-slate-800/60'
                    }`}
                  >
                    {isClassSelected && (
                       <motion.div 
                         layoutId={`transit-class-indicator-${transit.id}`}
                         className={`absolute inset-0 rounded-2xl border border-${baseColor}-500/50 pointer-events-none`}
                         transition={{ type: "spring", stiffness: 300, damping: 25 }}
                       />
                    )}
                    <div className="text-[10px] text-slate-400 font-mono font-bold tracking-widest mb-2 uppercase">{className}</div>
                    <div className="text-2xl font-black text-white tracking-tighter">${price}</div>
                    <div className="mt-4 flex justify-between items-center">
                       <NeonBadge variant="emerald" className="!px-1.5 !py-0.5 !text-[8px]">Available</NeonBadge>
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
