'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrainFront, Search, History, Star } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';

interface HeroSearchProps {
  onSearch: (stationCode: string, hours: string) => void;
  isLoading: boolean;
}

export function HeroSearch({ onSearch, isLoading }: HeroSearchProps) {
  const [station, setStation] = useState('');
  const [hours, setHours] = useState('4');
  const [history, setHistory] = useLocalStorage<string[]>('search-history', []);
  const [favorites, setFavorites] = useLocalStorage<string[]>('favorite-stations', []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!station.trim()) return;
    
    const cleanStation = station.trim().toUpperCase();
    
    // update history
    const newHistory = [cleanStation, ...history.filter(s => s !== cleanStation)].slice(0, 10);
    setHistory(newHistory);
    
    onSearch(cleanStation, hours);
  };

  const toggleFavorite = () => {
    const cleanStation = station.trim().toUpperCase();
    if (!cleanStation) return;
    if (favorites.includes(cleanStation)) {
      setFavorites(favorites.filter(s => s !== cleanStation));
    } else {
      setFavorites([...favorites, cleanStation]);
    }
  };

  return (
    <div className="w-full relative overflow-hidden bg-zinc-950 text-zinc-50 py-20 px-6 sm:px-12 flex flex-col items-center">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 opacity-20">
         <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[150%] bg-blue-600 rounded-full blur-[120px] mix-blend-screen" />
         <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[150%] bg-emerald-600 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="p-3 bg-zinc-800/50 rounded-xl backdrop-blur-sm border border-zinc-700/50">
             <TrainFront className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            IRCTC Live Tracker
          </h1>
        </motion.div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-zinc-400 text-lg md:text-xl text-center max-w-2xl mb-10"
        >
          Enter a station code to view real-time arrivals, departures, and delays across the Indian Railway network.
        </motion.p>

        <motion.form 
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-2xl flex flex-col sm:flex-row gap-3 bg-zinc-900/50 p-2 rounded-2xl backdrop-blur-md border border-zinc-800/80 shadow-2xl"
        >
          <div className="relative flex-1 flex items-center">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
             <Input 
               placeholder="Station Code (e.g. NDLS)" 
               value={station}
               onChange={(e) => setStation(e.target.value.toUpperCase())}
               className="w-full pl-12 pr-12 h-14 bg-zinc-950/50 border-zinc-800 text-lg rounded-xl focus-visible:ring-blue-500/50"
               maxLength={10}
             />
             {station.trim() && (
               <button
                 type="button"
                 onClick={toggleFavorite}
                 className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-amber-400 transition-colors focus:outline-none"
                 title={favorites.includes(station.trim().toUpperCase()) ? "Remove from Favorites" : "Add to Favorites"}
               >
                 <Star className={`w-5 h-5 ${favorites.includes(station.trim().toUpperCase()) ? 'fill-amber-400 text-amber-400' : ''}`} />
               </button>
             )}
          </div>
          
          <Select value={hours} onValueChange={(val) => setHours(val || '4')}>
            <SelectTrigger className="w-full sm:w-[140px] h-14 bg-zinc-950/50 border-zinc-800 rounded-xl">
              <SelectValue placeholder="Hours" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Next 1 Hour</SelectItem>
              <SelectItem value="2">Next 2 Hours</SelectItem>
              <SelectItem value="4">Next 4 Hours</SelectItem>
              <SelectItem value="8">Next 8 Hours</SelectItem>
              <SelectItem value="12">Next 12 Hours</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            type="submit" 
            disabled={isLoading || !station.trim()}
            className="h-14 px-8 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-lg transition-colors shadow-lg shadow-blue-900/20"
          >
            {isLoading ? 'Searching...' : 'Track Live'}
          </Button>
        </motion.form>

        {/* Quick Links */}
        <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.4 }}
           className="mt-8 flex flex-wrap justify-center gap-2"
        >
          {favorites.length > 0 && favorites.slice(0,3).map(fav => (
             <Button key={fav} variant="secondary" size="sm" onClick={() => {setStation(fav); onSearch(fav, hours);}} className="rounded-full bg-zinc-800/80 hover:bg-zinc-700">
               <Star className="w-3 h-3 mr-1.5 text-amber-400" /> {fav}
             </Button>
          ))}
          {history.length > 0 && history.slice(0,3).map(h => (
             <Button key={h} variant="secondary" size="sm" onClick={() => {setStation(h); onSearch(h, hours);}} className="rounded-full bg-zinc-800/80 hover:bg-zinc-700">
               <History className="w-3 h-3 mr-1.5 text-zinc-400" /> {h}
             </Button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
