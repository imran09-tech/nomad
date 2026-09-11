import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StationSearchBox({ onSelectStation, placeholder = "Search live railway stations..." }) {
  const [inputValue, setInputValue] = useState('');
  const [suggestionsList, setSuggestionsList] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowDropdown(false);
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    if (inputValue.trim().length < 2) {
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const response = await axios.get('/api/v1/train/suggest', {
          params: { text: inputValue }
        });
        setSuggestionsList((response.data || []).slice(0, 4));
      } catch (error) {
        console.error('Error fetching station suggestions:', error);
        setSuggestionsList([]);
      }
    };

    const debounceTimeout = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [inputValue]);

  const handleSelect = (station) => {
    setInputValue(station.name);
    setSuggestionsList([]);
    setShowDropdown(false);
    setIsFocused(false);
    if (onSelectStation) {
      onSelectStation(station);
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto" ref={containerRef}>
      <motion.div 
        className={`relative rounded-2xl overflow-hidden transition-all duration-500 bg-white/[0.02] border backdrop-blur-2xl ${isFocused ? 'border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.15)]' : 'border-white/5'}`}
        initial={false}
        animate={{ scale: isFocused ? 1.02 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Search className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${isFocused ? 'text-amber-500' : 'text-slate-500'}`} />
        <input
          type="text"
          className="w-full bg-transparent text-white placeholder:text-slate-500 block pl-14 pr-5 py-4 text-base focus:outline-none"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => {
            const val = e.target.value;
            setInputValue(val);
            setShowDropdown(true);
            if (val.trim().length < 2) {
              setSuggestionsList([]);
            }
          }}
          onFocus={() => {
            setShowDropdown(true);
            setIsFocused(true);
          }}
        />
      </motion.div>

      {/* Floating Interactive Dropdown Menu */}
      <AnimatePresence>
        {showDropdown && suggestionsList.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="absolute z-50 w-full mt-3 overflow-hidden rounded-2xl bg-[#090d16]/90 border border-white/5 backdrop-blur-3xl shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
          >
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-2">
              {suggestionsList.map((station, idx) => (
                <motion.button
                  key={station.code}
                  type="button"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/[0.04] text-sm flex items-center justify-between transition-colors mb-1 last:mb-0 group"
                  onClick={() => handleSelect(station)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-white/[0.03] flex items-center justify-center border border-white/5 group-hover:border-amber-500/30 transition-colors">
                      <span className="text-lg">🚂</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-200 block text-base group-hover:text-white transition-colors">{station.name}</span>
                      <span className="text-xs text-slate-500">
                        {station.state ? `${station.state} • ` : ''}Railway Station
                      </span>
                    </div>
                  </div>
                  <span className="text-amber-500/90 font-bold bg-amber-500/10 px-3 py-1 rounded-full text-xs border border-amber-500/20">
                    {station.code}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
