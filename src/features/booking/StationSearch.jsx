import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search } from 'lucide-react';

export default function StationSearch({ onSelectStation, placeholder = "Search live railway stations (e.g., NDLS, HWH)..." }) {
  const [inputValue, setInputValue] = useState('');
  const [suggestionsList, setSuggestionsList] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown when clicking outside the component
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // 300ms Keystroke Debounce Engine
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
    if (onSelectStation) {
      onSelectStation(station);
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          className="w-full bg-[#0d111a] border border-slate-800 text-white rounded-xl focus:border-amber-500 block pl-12 pr-4 py-3 text-sm focus:outline-none transition-colors"
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
          onFocus={() => setShowDropdown(true)}
          onClick={() => setShowDropdown(true)}
        />
      </div>

      {/* Floating Interactive Dropdown Menu */}
      {showDropdown && suggestionsList.length > 0 && (
        <div className="absolute z-50 w-full bg-[#121824] border border-slate-800 rounded-xl mt-2 overflow-hidden shadow-2xl max-h-[300px] overflow-y-auto">
          {suggestionsList.map((station) => (
            <button
              key={station.code}
              type="button"
              className="w-full text-left px-5 py-3.5 hover:bg-slate-800/60 text-sm text-gray-300 flex items-center justify-between transition-colors border-b border-slate-800/40 last:border-0"
              onClick={() => handleSelect(station)}
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">🚂</span>
                <div>
                  <span className="font-semibold text-white block">{station.name}</span>
                  <span className="text-xs text-gray-500">
                    {station.state ? `${station.state} • ` : ''}Railway Station
                  </span>
                </div>
              </div>
              <span className="text-amber-500 font-bold bg-[#0d111a] px-2 py-0.5 rounded text-xs border border-slate-800">
                {station.code}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

