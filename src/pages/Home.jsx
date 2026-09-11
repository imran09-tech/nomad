import { useState } from 'react';
import { motion } from 'framer-motion';
import FloatingSearchHub from '../components/FloatingSearchHub';
import { AsymmetricBento, AsymmetricBentoItem } from '../components/AsymmetricBento';
import ShimmerButton from '../components/ShimmerButton';
import WeatherTelemetryWidget from '../components/WeatherTelemetryWidget';
import AnimatedWorldMap from '../components/AnimatedWorldMap';
import { Globe, Plane, Award, Sparkles, Navigation } from 'lucide-react';
import BookingPaymentModal from '../components/BookingPaymentModal';

export default function Home() {
  const [selectedDest, setSelectedDest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const featuredDestinations = [
    {
      id: 'dest-1',
      name: 'Mahagama',
      category: 'Forest & Nature Resort',
      image: '/pic/destination/d1.png',
      price: '$290'
    },
    {
      id: 'dest-2',
      name: 'Kyoto Temple Walk',
      category: 'Historic Package',
      image: '/pic/destination/d9.png',
      price: '$850'
    },
    {
      id: 'dest-3',
      name: 'Paris Romance',
      category: 'Luxury City Stay',
      image: '/pic/destination/d11.png',
      price: '$1200'
    },
    {
      id: 'dest-4',
      name: 'Dubai Sky Stay',
      category: 'Futuristic Sky Hotel',
      image: '/pic/destination/d16.png',
      price: '$2500'
    },
    {
      id: 'dest-5',
      name: 'Switzerland Alpine Retreat',
      category: 'Mountain Adventure',
      image: '/pic/destination/d23.jpg',
      price: '$1500'
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen relative overflow-hidden bg-[#020408]"
    >
      {/* Immersive Cyber-Sunset Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-gradient-to-tr from-indigo-500/10 via-purple-500/5 to-transparent blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-[40%] right-[-10%] w-[50vw] h-[50vw] bg-gradient-to-bl from-amber-500/8 via-coral-500/3 to-transparent blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-[-10%] left-[20%] w-[45vw] h-[45vw] bg-gradient-to-t from-emerald-500/5 to-transparent blur-[100px] pointer-events-none rounded-full" />

      {/* Immersive Hero Section */}
      <div className="relative w-full h-[90vh] flex flex-col items-center justify-center pt-10">
         <AnimatedWorldMap />
         
         <div className="relative z-20 text-center space-y-6 max-w-4xl px-6 pointer-events-none">
           <motion.div 
             initial={{ scale: 0.9, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
             className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-slate-900/40 backdrop-blur-md mb-4"
           >
             <Sparkles className="w-3.5 h-3.5 text-amber-400" />
             <span className="text-[10px] font-bold tracking-widest uppercase text-slate-300 font-mono">NOMAD ELITE PORTAL</span>
           </motion.div>
           
           <motion.h1 
             initial={{ y: 30, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
             className="text-6xl md:text-[7.5rem] leading-[0.9] font-black tracking-tighter text-white drop-shadow-2xl"
           >
             The World, <br/>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-[#ff6b6b]">
               Elevated.
             </span>
           </motion.h1>
           
           <motion.p
             initial={{ y: 20, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
             className="text-slate-400 max-w-xl mx-auto text-sm md:text-base font-medium tracking-wide mt-4"
           >
             Access bespoke itineraries, high-altitude status metrics, and private aviation vectors.
           </motion.p>
         </div>

         {/* Search Overlay */}
         <div className="absolute bottom-0 translate-y-1/2 w-full px-6 z-30">
           <FloatingSearchHub />
         </div>
      </div>

      {/* Dashboard Section */}
      <div className="max-w-7xl mx-auto px-6 pt-36 pb-24 relative z-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
             <div>
               <div className="text-[10px] text-amber-500 font-mono font-bold tracking-widest uppercase mb-1">MEMBER CONSOLE</div>
               <h2 className="text-4xl font-black tracking-tight text-white">Your Travel Dashboard</h2>
             </div>
             <ShimmerButton className="!px-6 !py-2.5 !text-xs !rounded-full">Launch AI Planner</ShimmerButton>
          </div>
          
          <AsymmetricBento>
            {/* Travel Wallet (Spans 4) */}
            <AsymmetricBentoItem colSpan={4} className="min-h-[260px] p-8 flex flex-col relative group overflow-hidden border-t border-t-amber-500/50 glass-panel glass-panel-hover">
              <img 
                src="https://images.unsplash.com/photo-1614026480209-cd9934144671?q=80&w=800" 
                alt="Wallet" 
                className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-opacity duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020408] via-[#020408]/60 to-[#020408]/20" />
              <div className="relative z-10 flex flex-col h-full">
                <div className="text-[10px] text-slate-400 font-mono font-bold tracking-widest uppercase mb-4 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-500" /> Travel Wallet
                </div>
                <div className="text-6xl font-black text-white tracking-tighter mb-2">142,400</div>
                <div className="text-xs font-bold text-amber-400 mb-auto tracking-wide">Elite Miles Available</div>
                <div className="flex justify-between items-center mt-6">
                  <div className="text-[10px] text-slate-500 font-mono font-bold tracking-widest uppercase">NOMAD BLACK TIER</div>
                  <div className="w-12 h-8 rounded bg-gradient-to-tr from-slate-400 via-slate-200 to-white flex items-center justify-center shadow-lg">
                    <div className="w-8 h-4 border border-black/10 rounded-sm"></div>
                  </div>
                </div>
              </div>
            </AsymmetricBentoItem>

            {/* Upcoming Trips (Spans 8) */}
            <AsymmetricBentoItem colSpan={8} className="min-h-[260px] p-8 flex flex-col justify-end relative group glass-panel">
              <img 
                src="https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=2000" 
                alt="Tokyo" 
                className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-opacity duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020408] via-[#020408]/40 to-transparent" />
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-emerald-500/40 bg-emerald-950/30 text-emerald-400 text-[9px] font-mono font-bold tracking-widest uppercase mb-3">
                    <Navigation className="w-3 h-3 animate-pulse" /> DEPARTING IN 4 DAYS
                  </div>
                  <h3 className="text-4xl font-black text-white tracking-tighter mb-1">Aman Tokyo</h3>
                  <div className="text-xs text-slate-300 font-bold tracking-wide">First Class • Suite 42A • Tokyo Haneda</div>
                </div>
                <ShimmerButton className="!px-8 !py-3.5 !text-xs">View Flight Vector</ShimmerButton>
              </div>
            </AsymmetricBentoItem>

            {/* Weather Telemetry Widget (Spans 4) */}
            <WeatherTelemetryWidget colSpan={4} className="glass-panel glass-panel-hover border border-white/5" />

            {/* Jet Charter Option (Spans 4) */}
            <AsymmetricBentoItem colSpan={4} className="min-h-[260px] p-6 flex flex-col justify-between relative group overflow-hidden glass-panel glass-panel-hover border border-white/5">
              <img 
                src="https://images.unsplash.com/photo-1540962351504-03099e0a754b?q=80&w=800" 
                alt="Private Jet" 
                className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-opacity duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020408] via-[#020408]/60 to-[#020408]/20" />
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div>
                  <div className="text-[10px] text-slate-400 font-mono font-bold tracking-widest uppercase mb-2 flex items-center gap-1.5">
                    <Plane className="w-3.5 h-3.5 text-indigo-400" /> Private Aviation
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tight">Charter Flight</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">Instantly book private jet routes with direct runway boarding and concierge transfers.</p>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-[10px] text-[#ff6b6b] font-mono font-bold tracking-widest uppercase">GLOBAL NETWORK</span>
                  <span className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors flex items-center gap-1">
                    Book Jet &rarr;
                  </span>
                </div>
              </div>
            </AsymmetricBentoItem>

            {/* Global Concierge Service (Spans 4) */}
            <AsymmetricBentoItem colSpan={4} className="min-h-[260px] p-6 flex flex-col justify-between relative group overflow-hidden glass-panel glass-panel-hover border border-white/5">
              <img 
                src="https://images.unsplash.com/photo-1556745753-b2904692b3cd?q=80&w=800" 
                alt="Concierge" 
                className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-opacity duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020408] via-[#020408]/60 to-[#020408]/20" />
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div>
                  <div className="text-[10px] text-slate-400 font-mono font-bold tracking-widest uppercase mb-2 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-emerald-400" /> Global Concierge
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tight">Elite Services</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">24/7 personal assistants for restaurant bookings, entry clearance, and security escort.</p>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-[10px] text-slate-500 font-mono font-bold tracking-widest uppercase">ACTIVE MEMBERSHIP</span>
                  <span className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors flex items-center gap-1">
                    Contact Butler &rarr;
                  </span>
                </div>
              </div>
            </AsymmetricBentoItem>

          </AsymmetricBento>
      </div>

      {/* Featured Destinations Section */}
      <div className="max-w-7xl mx-auto px-6 pb-24 relative z-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-[10px] text-emerald-500 font-mono font-bold tracking-widest uppercase mb-1">CURATED LOCATIONS</div>
            <h2 className="text-4xl font-black tracking-tight text-white">Trending Destinations</h2>
          </div>
          <span className="text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1">
            View All Destinations &rarr;
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {featuredDestinations.map(dest => (
            <motion.div 
              key={dest.id}
              whileHover={{ y: -5 }}
              onClick={() => {
                setSelectedDest(dest);
                setIsModalOpen(true);
              }}
              className="relative group rounded-3xl overflow-hidden min-h-[300px] border border-slate-800/60 bg-slate-900/20 backdrop-blur-sm cursor-pointer"
            >
              <img 
                src={dest.image} 
                alt={dest.name} 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80';
                }}
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020408] via-[#020408]/60 to-transparent" />
              
              <div className="absolute inset-x-6 bottom-6 flex flex-col z-10">
                <div className="text-[9px] text-emerald-400 font-mono font-bold tracking-widest uppercase mb-1">{dest.category}</div>
                <h3 className="text-xl font-black text-white tracking-tight leading-tight">{dest.name}</h3>
                <div className="mt-3 text-xs font-bold text-white bg-white/10 backdrop-blur-md self-start px-2 py-1 rounded-md border border-white/20">
                  From {dest.price}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {selectedDest && (
        <BookingPaymentModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          itemName={selectedDest.name}
          totalPrice={parseInt(selectedDest.price.replace('$', ''))}
        />
      )}
    </motion.div>
  );
}
