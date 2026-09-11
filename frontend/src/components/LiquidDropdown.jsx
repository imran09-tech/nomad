import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function LiquidDropdown({ options, selected, onSelect, placeholder = "Select option" }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between px-5 py-4 rounded-2xl 
          bg-[#05080f] shadow-inner border transition-all duration-300
          ${isOpen ? 'border-amber-500/80 ring-4 ring-amber-500/10' : 'border-slate-800/60'}
        `}
      >
        <span className={`font-medium tracking-wide ${selected ? 'text-white' : 'text-slate-500'}`}>
          {selected ? selected.label : placeholder}
        </span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
          <ChevronDown className="w-4 h-4 text-slate-500" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            transition={{ type: "spring", mass: 0.6, stiffness: 300, damping: 20 }}
            className="absolute z-50 w-full mt-3 overflow-hidden rounded-2xl bg-[#080c14]/95 border border-slate-800/60 backdrop-blur-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)]"
          >
            <div className="max-h-[250px] overflow-y-auto custom-scrollbar p-2">
              {options.map((opt, idx) => (
                <motion.button
                  key={opt.value}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  onClick={() => { onSelect(opt); setIsOpen(false); }}
                  className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/[0.04] text-sm text-slate-300 hover:text-white transition-colors flex items-center mb-1 last:mb-0"
                >
                  {opt.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
