import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Calendar, Users, ShieldAlert, Sparkles, Plus, Check, Star, ArrowRight, ShieldCheck } from 'lucide-react';
import { AsymmetricBento, AsymmetricBentoItem } from '../components/AsymmetricBento';
import NeonBadge from '../components/NeonBadge';
import ShimmerButton from '../components/ShimmerButton';
import TicketStubSummary from '../components/TicketStubSummary';
import BookingPaymentModal from '../components/BookingPaymentModal';

export default function Tours() {
  const [searchState, setSearchState] = useState({
    destination: 'Maldives',
    date: '2026-08-15',
    travelers: '2 Guests'
  });

  const [selectedTour, setSelectedTour] = useState(null);
  const [activeAddons, setActiveAddons] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const mockTours = [
    {
      id: 'T-X1',
      name: 'Nordic Aurora Expedition',
      location: 'Svalbard, Norway',
      duration: '7 Days',
      badge: 'Bestseller',
      badgeVariant: 'blue',
      image: '/pic/destination/d3.png',
      price: 12400,
      rating: 4.9,
      colSpan: 8,
      description: 'Journey into the high Arctic circle under custom geodesic glass domes. Enjoy private snowmobile treks, dog sledding, and celestial dinner dates under the northern lights.',
      itinerary: [
        { day: 'Day 1', title: 'Private Jet Arrival & Glass Dome Check-in' },
        { day: 'Day 3', title: 'Dog-Sled Trek & Fjord Wilderness Dinner' },
        { day: 'Day 5', title: 'Ice Cave Exploration via Helicopter' },
        { day: 'Day 7', title: 'Supersonic Transit Return' }
      ]
    },
    {
      id: 'T-X2',
      name: 'Serengeti Private Safari',
      location: 'Serengeti, Tanzania',
      duration: '14 Days',
      badge: 'Elite Wildlife',
      badgeVariant: 'amber',
      image: '/pic/destination/d6.png',
      price: 24500,
      rating: 4.85,
      colSpan: 4,
      description: 'Exclusive private reserve access for the great migration. Sleep in luxury canvas pavilions with personal guides, night tracking, and private conservation tours.',
      itinerary: [
        { day: 'Day 1', title: 'Charter Landing & Pavilion Welcome' },
        { day: 'Day 4', title: 'Hot Air Balloon Safari at Sunrise' },
        { day: 'Day 9', title: 'Private Night Predator Tracking' },
        { day: 'Day 14', title: 'Return Transit' }
      ]
    },
    {
      id: 'T-X3',
      name: 'Antarctic Polar Yachting',
      location: 'Drake Passage & Icefields',
      duration: '10 Days',
      badge: 'Extreme Frontier',
      badgeVariant: 'blue',
      image: '/pic/destination/d7.png',
      price: 48000,
      rating: 4.98,
      colSpan: 4,
      description: 'Sail the Drake Passage aboard an ultra-stabilized luxury expedition superyacht. Kayak beside glaciers, trek pristine snowfields, and relax in outdoor thermal pools.',
      itinerary: [
        { day: 'Day 1', title: 'Board Superyacht in Ushuaia' },
        { day: 'Day 4', title: ' Drake Passage Fjord Crossing' },
        { day: 'Day 7', title: 'Zodiac Glacier Landings & Penguins' },
        { day: 'Day 10', title: 'Return Flight and Departure' }
      ]
    },
    {
      id: 'T-X4',
      name: 'Amangiri Desert Odyssey',
      location: 'Canyon Point, Utah',
      duration: '5 Days',
      badge: 'Exclusive Wellness',
      badgeVariant: 'emerald',
      image: '/pic/destination/d10.png',
      price: 16500,
      rating: 4.92,
      colSpan: 8,
      description: 'Tucked into the red-rock valleys of Utah, Amangiri offers luxury pavilions, private canyons, slot canyon tours, and ancient wellness ceremonies.',
      itinerary: [
        { day: 'Day 1', title: 'Private Suite Check-in & Firepit Welcome' },
        { day: 'Day 2', title: 'Guided Via Ferrata Canyon Climb' },
        { day: 'Day 4', title: 'Red-Rock Hot Balloon & Navajo Dinner' },
        { day: 'Day 5', title: 'Personalized Spa & Return Departure' }
      ]
    }
  ];

  const addonOptions = [
    { id: 'ad-1', label: 'Private Jet Transfer', price: 8000 },
    { id: 'ad-2', label: 'Helicopter Charter', price: 4500 },
    { id: 'ad-3', label: 'Personal Michelin Chef', price: 3000 }
  ];

  const handleTourSelect = (tour) => {
    setSelectedTour(tour);
    setActiveAddons([]); // Reset active addons
  };

  const handleAddonToggle = (addon) => {
    setActiveAddons(prev => 
      prev.some(item => item.id === addon.id) 
        ? prev.filter(item => item.id !== addon.id) 
        : [...prev, addon]
    );
  };

  const calculateTotalPrice = () => {
    if (!selectedTour) return 0;
    const base = selectedTour.price;
    const addonsTotal = activeAddons.reduce((sum, item) => sum + item.price, 0);
    return base + addonsTotal;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-32 pb-24 px-6 md:px-12 min-h-screen relative overflow-hidden"
    >
      {/* Luxury Accent Ambient Glow */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-amber-500/5 via-amber-500/2 to-transparent blur-[120px] pointer-events-none -z-10 rounded-full" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-500/5 to-transparent blur-[100px] pointer-events-none -z-10 rounded-full" />

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div>
            <div className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mb-2">Curated Journeys</div>
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none">
              Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">Odysseys</span>
            </h1>
            <p className="text-slate-400 font-medium tracking-wide mt-2">Custom-tailored expeditions crafted exclusively for the modern pioneer.</p>
          </div>
          <NeonBadge variant="amber" className="w-fit">Elite Excursions Active</NeonBadge>
        </div>

        {/* Floating Contextual Search Hub */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="p-6 md:p-8 rounded-3xl bg-slate-900/10 border border-slate-800/40 backdrop-blur-2xl shadow-2xl relative overflow-hidden"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Destination */}
            <div className="flex flex-col space-y-2">
              <label className="text-[9px] text-slate-400 font-mono font-bold tracking-widest uppercase">Odyssey Region</label>
              <div className="relative flex items-center">
                <Compass className="w-4 h-4 text-amber-500 absolute left-4" />
                <input 
                  type="text" 
                  value={searchState.destination}
                  onChange={(e) => setSearchState({...searchState, destination: e.target.value})}
                  className="w-full h-14 pl-12 pr-4 rounded-xl border border-slate-800/60 bg-[#05080f] shadow-inner text-sm text-white focus:outline-none focus:border-amber-500/80 focus:ring-4 focus:ring-amber-500/10 transition-all duration-300"
                />
              </div>
            </div>

            {/* Travel Date */}
            <div className="flex flex-col space-y-2">
              <label className="text-[9px] text-slate-400 font-mono font-bold tracking-widest uppercase">Target Date</label>
              <div className="relative flex items-center">
                <Calendar className="w-4 h-4 text-amber-500 absolute left-4" />
                <input 
                  type="date" 
                  value={searchState.date}
                  onChange={(e) => setSearchState({...searchState, date: e.target.value})}
                  className="w-full h-14 pl-12 pr-4 rounded-xl border border-slate-800/60 bg-[#05080f] shadow-inner text-sm text-white focus:outline-none focus:border-amber-500/80 focus:ring-4 focus:ring-amber-500/10 transition-all duration-300"
                />
              </div>
            </div>

            {/* Travelers */}
            <div className="flex flex-col space-y-2">
              <label className="text-[9px] text-slate-400 font-mono font-bold tracking-widest uppercase">Travelers</label>
              <div className="relative flex items-center">
                <Users className="w-4 h-4 text-amber-500 absolute left-4" />
                <select 
                  value={searchState.travelers}
                  onChange={(e) => setSearchState({...searchState, travelers: e.target.value})}
                  className="w-full h-14 pl-12 pr-4 rounded-xl border border-slate-800/60 bg-[#05080f] shadow-inner text-sm text-white focus:outline-none focus:border-amber-500/80 focus:ring-4 focus:ring-amber-500/10 transition-all duration-300 appearance-none"
                >
                  <option value="1 Guest">1 Elite Traveler</option>
                  <option value="2 Guests">2 Elite Travelers</option>
                  <option value="4 Guests">4 Private Expedition</option>
                </select>
              </div>
            </div>

          </div>
        </motion.div>

        {/* Selected Boarding Pass Stub Summary */}
        <AnimatePresence>
          {selectedTour && (
            <motion.div 
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="overflow-hidden"
            >
              <TicketStubSummary 
                leftContent={
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <div className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mb-1 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-500" /> SECURED EXPEDITION PASS
                      </div>
                      <h3 className="text-3xl font-black text-white tracking-tighter">
                        {selectedTour.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">{selectedTour.duration} • Curated Suite • {searchState.travelers}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 border-t md:border-t-0 md:border-l border-slate-800/60 pt-4 md:pt-0 md:pl-8 text-left">
                      <div>
                        <span className="block text-[9px] text-slate-500 font-mono tracking-widest uppercase">Target Location</span>
                        <span className="text-sm font-extrabold text-white">{selectedTour.location}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-slate-500 font-mono tracking-widest uppercase">Launch Date</span>
                        <span className="text-sm font-extrabold text-white">{searchState.date}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-slate-500 font-mono tracking-widest uppercase">Add-ons Active</span>
                        <span className="text-sm font-extrabold text-amber-500">{activeAddons.length || 'None'} Selected</span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-slate-500 font-mono tracking-widest uppercase">Expedition Status</span>
                        <span className="text-sm font-extrabold text-emerald-400">Clear for Launch</span>
                      </div>
                    </div>
                  </div>
                }
                rightContent={
                  <div className="text-center">
                    <div className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mb-1">Total Expedition Fare</div>
                    <div className="text-4xl font-black text-white tracking-tighter mb-5">${calculateTotalPrice()}</div>
                    <ShimmerButton 
                      onClick={() => setIsModalOpen(true)}
                      className="w-full !py-3.5 !text-xs !rounded-xl"
                    >
                      Confirm Odyssey Vector
                    </ShimmerButton>
                  </div>
                }
              />
            </motion.div>
          )}
        </AnimatePresence>

        {selectedTour && (
          <BookingPaymentModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            itemName={selectedTour.name}
            totalPrice={calculateTotalPrice()}
          />
        )}

        {/* Tours Bento Layout */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-white tracking-wide">Elite Odysseys Portfolio</h3>
            <span className="text-xs text-slate-500 font-medium">4 Curated Expansions Available</span>
          </div>

          <AsymmetricBento>
            {mockTours.map(tour => {
              const isSelected = selectedTour?.id === tour.id;

              return (
                <AsymmetricBentoItem
                  key={tour.id}
                  colSpan={tour.colSpan}
                  className="min-h-[420px] p-6 flex flex-col justify-end relative group cursor-pointer border-slate-800/40 bg-slate-900/20 backdrop-blur-xl shadow-2xl"
                  onClick={() => handleTourSelect(tour)}
                >
                  {/* Glowing border overlay */}
                  <div className={`absolute inset-0 border rounded-3xl pointer-events-none transition-colors duration-500 ${
                    isSelected ? 'border-amber-500/50 bg-[#090d16]/40' : 'border-slate-800/20 hover:border-slate-700/40'
                  }`} />

                  {/* Odyssey Image */}
                  <img 
                    src={tour.image} 
                    alt={tour.name} 
                    className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:opacity-55 transition-opacity duration-700 rounded-3xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#03050a] via-[#03050a]/70 to-transparent rounded-3xl" />

                  {/* Top info badge & rating */}
                  <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
                    <NeonBadge variant={tour.badgeVariant}>{tour.badge}</NeonBadge>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/60 border border-slate-800 text-amber-500 text-xs font-bold font-mono">
                      <Star className="w-3.5 h-3.5 fill-current" /> {tour.rating}
                    </div>
                  </div>

                  {/* Details wrapper */}
                  <div className="relative z-10 mt-auto">
                    <div className="flex justify-between items-end mb-3">
                      <div>
                        <div className="text-[10px] text-slate-400 font-mono font-bold tracking-widest uppercase">{tour.location} • {tour.duration}</div>
                        <h3 className="text-3xl font-black text-white tracking-tighter mt-1">{tour.name}</h3>
                      </div>
                      <div className="text-right">
                        <span className="block text-[9px] text-slate-500 font-mono tracking-widest uppercase">Base Fare</span>
                        <span className="text-2xl font-black text-white">${tour.price}</span>
                      </div>
                    </div>

                    <p className="text-slate-300 text-xs leading-relaxed max-w-xl mb-4 opacity-80 group-hover:opacity-100 transition-opacity">
                      {tour.description}
                    </p>

                    {/* Expandable Itinerary & Add-ons List */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                          className="pt-4 mt-4 border-t border-slate-800/60 overflow-hidden"
                          onClick={(e) => e.stopPropagation()} // Stop bubbling
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Itinerary Timeline */}
                            <div>
                              <div className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mb-3">Itinerary Vectors</div>
                              <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-800">
                                {tour.itinerary.map((step) => (
                                  <div key={step.day} className="flex items-start space-x-3 text-left">
                                    <div className="w-6 h-6 rounded-full bg-slate-900 border border-amber-500/30 flex items-center justify-center shrink-0 relative z-10 text-[9px] font-bold text-amber-500 font-mono">
                                      {step.day.replace('Day ', '')}
                                    </div>
                                    <div>
                                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide leading-none">{step.day}</div>
                                      <div className="text-xs font-bold text-white mt-1">{step.title}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Luxury Add-ons */}
                            <div>
                              <div className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mb-3">Bespoke Add-Ons</div>
                              <div className="space-y-2">
                                {addonOptions.map((addon) => {
                                  const isAddonActive = activeAddons.some(item => item.id === addon.id);

                                  return (
                                    <motion.div
                                      key={addon.id}
                                      whileTap={{ scale: 0.98 }}
                                      onClick={() => handleAddonToggle(addon)}
                                      className={`p-3 rounded-xl border flex justify-between items-center cursor-pointer transition-all ${
                                        isAddonActive
                                          ? 'bg-amber-950/20 border-amber-500/80 text-white shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                                          : 'bg-[#05080f]/80 border-slate-800/80 text-slate-300 hover:border-slate-700/80'
                                      }`}
                                    >
                                      <div>
                                        <div className="text-xs font-bold text-white">{addon.label}</div>
                                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">+${addon.price}</div>
                                      </div>
                                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                                        isAddonActive 
                                          ? 'bg-amber-500 border-amber-500 text-black' 
                                          : 'border-slate-700 bg-slate-900'
                                      }`}>
                                        {isAddonActive && <Check className="w-3 h-3 stroke-[3]" />}
                                      </div>
                                    </motion.div>
                                  );
                                })}
                              </div>
                            </div>

                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </AsymmetricBentoItem>
              );
            })}
          </AsymmetricBento>
        </div>

      </div>
    </motion.div>
  );
}
