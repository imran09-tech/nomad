import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Calendar,
  Users,
  MapPin,
  Search,
  ArrowRight,
  Star,
  Heart,
  Compass,
  CheckCircle,
} from 'lucide-react';
import { AsymmetricBento, AsymmetricBentoItem } from '../components/AsymmetricBento';
import NeonBadge from '../components/NeonBadge';
import ShimmerButton from '../components/ShimmerButton';
import TicketStubSummary from '../components/TicketStubSummary';
import BookingPaymentModal from '../components/BookingPaymentModal';

export default function Hotels() {
  const [searchState, setSearchState] = useState({
    destination: 'Tokyo, Japan',
    checkin: '2026-07-28',
    checkout: '2026-08-02',
    guests: '2 Guests',
  });

  const [selectedHotel, setSelectedHotel] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const mockHotels = [
    {
      id: 'H-X1',
      name: 'Aman Tokyo',
      location: 'Otemachi Tower, Tokyo',
      description:
        'A monument to modern Japanese architecture, blending traditional minimalism with high-end luxury overlooking the Imperial Palace gardens.',
      image: '/pic/hotel/h1.jpg',
      basePrice: 1850,
      rating: 4.9,
      badge: '2 Suites Left',
      badgeVariant: 'amber',
      colSpan: 8,
      rooms: {
        'Deluxe Room': 1850,
        'Premier Suite': 2400,
        'Aman Penthouse': 4100,
      },
    },
    {
      id: 'H-X2',
      name: 'Bulgari Resort Bali',
      location: 'Uluwatu, Bali',
      description:
        'Perched on rugged volcanic cliffs 150 meters above the Indian Ocean, offering Italian design blended with authentic Balinese heritage.',
      image: '/pic/hotel/h2.jpg',
      basePrice: 1450,
      rating: 4.8,
      badge: 'Elite Choice',
      badgeVariant: 'emerald',
      colSpan: 4,
      rooms: {
        'Ocean Cliff Villa': 1450,
        'Two-Bedroom Villa': 2800,
        'Bulgari Villa': 5500,
      },
    },
    {
      id: 'H-X3',
      name: 'Royal Mansour',
      location: 'Marrakech, Morocco',
      description:
        'An elite village of palatial riads crafted by Moroccan artisans, featuring private plunge pools and absolute butler service.',
      image: '/pic/hotel/h3.jpg',
      basePrice: 2100,
      rating: 4.95,
      badge: 'Royal Status',
      badgeVariant: 'blue',
      colSpan: 4,
      rooms: {
        'Superior Riad': 2100,
        'Premier Riad': 3200,
        'Grand Riad': 9800,
      },
    },
    {
      id: 'H-X4',
      name: 'Soneva Jani',
      location: 'Noonu Atoll, Maldives',
      description:
        'Overwater retreats featuring retractable roofs to stargaze, private waterslides into the lagoon, and complete barefoot luxury.',
      image: '/pic/hotel/h4.png',
      basePrice: 2600,
      rating: 4.9,
      badge: 'Private Island',
      badgeVariant: 'emerald',
      colSpan: 8,
      rooms: {
        'Water Retreat': 2600,
        'Two-Bedroom Retreat': 4200,
        'Soneva Mansion': 12000,
      },
    },
  ];

  const handleHotelSelect = (hotel) => {
    setSelectedHotel(hotel);
    setSelectedRoom(null); // Reset room selection
  };

  const handleRoomSelect = (roomName, price) => {
    setSelectedRoom({
      name: roomName,
      price: price,
    });
  };

  const toggleWishlist = (e, hotelId) => {
    e.stopPropagation();
    setWishlist((prev) =>
      prev.includes(hotelId) ? prev.filter((id) => id !== hotelId) : [...prev, hotelId]
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-32 pb-24 px-6 md:px-12 min-h-screen relative overflow-hidden"
    >
      {/* Aurora Emerald Ambient Glow */}
      <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-gradient-to-br from-emerald-500/5 via-emerald-500/2 to-transparent blur-[120px] pointer-events-none -z-10 rounded-full" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tr from-teal-500/5 to-transparent blur-[100px] pointer-events-none -z-10 rounded-full" />

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div>
            <div className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mb-2">
              Hospitality Network
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none">
              Luxury{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-500">
                Estates
              </span>
            </h1>
            <p className="text-slate-400 font-medium tracking-wide mt-2">
              Book curated sanctuaries of unparalleled prestige.
            </p>
          </div>
          <NeonBadge variant="emerald" className="w-fit">
            Elite Portfolio Online
          </NeonBadge>
        </div>

        {/* Floating Contextual Search Hub */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="p-6 md:p-8 rounded-3xl bg-slate-900/10 border border-slate-800/40 backdrop-blur-2xl shadow-2xl relative overflow-hidden"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Destination */}
            <div className="flex flex-col space-y-2">
              <label className="text-[9px] text-slate-400 font-mono font-bold tracking-widest uppercase">
                Sanctuary Location
              </label>
              <div className="relative flex items-center">
                <MapPin className="w-4 h-4 text-emerald-400 absolute left-4" />
                <input
                  type="text"
                  value={searchState.destination}
                  onChange={(e) => setSearchState({ ...searchState, destination: e.target.value })}
                  className="w-full h-14 pl-12 pr-4 rounded-xl border border-slate-800/60 bg-[#05080f] shadow-inner text-sm text-white focus:outline-none focus:border-emerald-500/80 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300"
                />
              </div>
            </div>

            {/* Check-In */}
            <div className="flex flex-col space-y-2">
              <label className="text-[9px] text-slate-400 font-mono font-bold tracking-widest uppercase">
                Arrival
              </label>
              <div className="relative flex items-center">
                <Calendar className="w-4 h-4 text-emerald-400 absolute left-4" />
                <input
                  type="date"
                  value={searchState.checkin}
                  onChange={(e) => setSearchState({ ...searchState, checkin: e.target.value })}
                  className="w-full h-14 pl-12 pr-4 rounded-xl border border-slate-800/60 bg-[#05080f] shadow-inner text-sm text-white focus:outline-none focus:border-emerald-500/80 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300"
                />
              </div>
            </div>

            {/* Check-Out */}
            <div className="flex flex-col space-y-2">
              <label className="text-[9px] text-slate-400 font-mono font-bold tracking-widest uppercase">
                Departure
              </label>
              <div className="relative flex items-center">
                <Calendar className="w-4 h-4 text-emerald-400 absolute left-4" />
                <input
                  type="date"
                  value={searchState.checkout}
                  onChange={(e) => setSearchState({ ...searchState, checkout: e.target.value })}
                  className="w-full h-14 pl-12 pr-4 rounded-xl border border-slate-800/60 bg-[#05080f] shadow-inner text-sm text-white focus:outline-none focus:border-emerald-500/80 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300"
                />
              </div>
            </div>

            {/* Guests */}
            <div className="flex flex-col space-y-2">
              <label className="text-[9px] text-slate-400 font-mono font-bold tracking-widest uppercase">
                Guests
              </label>
              <div className="relative flex items-center">
                <Users className="w-4 h-4 text-emerald-400 absolute left-4" />
                <select
                  value={searchState.guests}
                  onChange={(e) => setSearchState({ ...searchState, guests: e.target.value })}
                  className="w-full h-14 pl-12 pr-4 rounded-xl border border-slate-800/60 bg-[#05080f] shadow-inner text-sm text-white focus:outline-none focus:border-emerald-500/80 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 appearance-none"
                >
                  <option value="1 Guest">1 Guest</option>
                  <option value="2 Guests">2 Guests</option>
                  <option value="4 Guests">4 Guests</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Selected Estate Boarding Summary */}
        <AnimatePresence>
          {selectedHotel && selectedRoom && (
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
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> CONFIRMED PRIVATE
                        RESERVATION
                      </div>
                      <h3 className="text-3xl font-black text-white tracking-tighter">
                        {selectedHotel.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">{selectedHotel.location}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 border-t md:border-t-0 md:border-l border-slate-800/60 pt-4 md:pt-0 md:pl-8 text-left">
                      <div>
                        <span className="block text-[9px] text-slate-500 font-mono tracking-widest uppercase">
                          Suite Selected
                        </span>
                        <span className="text-sm font-extrabold text-emerald-400">
                          {selectedRoom.name}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-slate-500 font-mono tracking-widest uppercase">
                          Check-In
                        </span>
                        <span className="text-sm font-extrabold text-white">
                          {searchState.checkin}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-slate-500 font-mono tracking-widest uppercase">
                          Guests
                        </span>
                        <span className="text-sm font-extrabold text-white">
                          {searchState.guests}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-slate-500 font-mono tracking-widest uppercase">
                          Status
                        </span>
                        <span className="text-sm font-extrabold text-emerald-400">
                          Exclusive Reserved
                        </span>
                      </div>
                    </div>
                  </div>
                }
                rightContent={
                  <div className="text-center">
                    <div className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mb-1">
                      Total Stay Rate
                    </div>
                    <div className="text-4xl font-black text-white tracking-tighter mb-5">
                      ${selectedRoom.price}
                    </div>
                    <ShimmerButton
                      onClick={() => setIsModalOpen(true)}
                      className="w-full !py-3.5 !text-xs !rounded-xl"
                    >
                      Confirm Estate Stay
                    </ShimmerButton>
                  </div>
                }
              />
            </motion.div>
          )}
        </AnimatePresence>

        {selectedHotel && selectedRoom && (
          <BookingPaymentModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            itemName={`${selectedHotel.name} - ${selectedRoom.name}`}
            totalPrice={selectedRoom.price}
          />
        )}

        {/* Hotels Bento Grid Layout */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-white tracking-wide">
              Elite Estates Portfolio
            </h3>
            <span className="text-xs text-slate-500 font-medium">4 Selected Sanctuaries</span>
          </div>

          <AsymmetricBento>
            {mockHotels.map((hotel) => {
              const isSelected = selectedHotel?.id === hotel.id;
              const isWished = wishlist.includes(hotel.id);

              return (
                <AsymmetricBentoItem
                  key={hotel.id}
                  colSpan={hotel.colSpan}
                  className="min-h-[420px] p-6 flex flex-col justify-end relative group cursor-pointer border-slate-800/40 bg-slate-900/20 backdrop-blur-xl shadow-2xl"
                  onClick={() => handleHotelSelect(hotel)}
                >
                  {/* Glowing perimeter border overlay */}
                  <div
                    className={`absolute inset-0 border rounded-3xl pointer-events-none transition-colors duration-500 ${
                      isSelected
                        ? 'border-emerald-500/50 bg-[#090d16]/40'
                        : 'border-slate-800/20 hover:border-slate-700/40'
                    }`}
                  />

                  {/* Estate Image */}
                  <img
                    src={hotel.image}
                    alt={hotel.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:opacity-55 transition-opacity duration-700 rounded-3xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#03050a] via-[#03050a]/70 to-transparent rounded-3xl" />

                  {/* Floating Action Header inside bento item */}
                  <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-10">
                    <NeonBadge variant={hotel.badgeVariant}>{hotel.badge}</NeonBadge>
                    <button
                      onClick={(e) => toggleWishlist(e, hotel.id)}
                      className={`p-2 rounded-full backdrop-blur-md border border-slate-700/30 transition-all ${
                        isWished
                          ? 'bg-rose-500/20 border-rose-500 text-rose-500'
                          : 'bg-slate-900/40 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  {/* Bottom details of the card */}
                  <div className="relative z-10 mt-auto">
                    <div className="flex justify-between items-end mb-3">
                      <div>
                        <div className="text-[10px] text-slate-400 font-mono font-bold tracking-widest uppercase">
                          {hotel.location}
                        </div>
                        <h3 className="text-3xl font-black text-white tracking-tighter mt-1">
                          {hotel.name}
                        </h3>
                      </div>
                      <div className="text-right">
                        <span className="block text-[9px] text-slate-500 font-mono tracking-widest uppercase">
                          Per Night
                        </span>
                        <span className="text-2xl font-black text-white">${hotel.basePrice}</span>
                      </div>
                    </div>

                    <p className="text-slate-300 text-xs leading-relaxed max-w-lg mb-4 opacity-80 group-hover:opacity-100 transition-opacity">
                      {hotel.description}
                    </p>

                    {/* Collapsible Suites List */}
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
                          <div className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mb-3">
                            Select Premium Suite
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {Object.entries(hotel.rooms).map(([roomName, roomPrice]) => {
                              const isRoomChecked = selectedRoom?.name === roomName;

                              return (
                                <motion.div
                                  key={roomName}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => handleRoomSelect(roomName, roomPrice)}
                                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                                    isRoomChecked
                                      ? 'bg-emerald-950/20 border-emerald-500/80 text-white shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                                      : 'bg-[#05080f]/80 border-slate-800/80 text-slate-300 hover:border-slate-700/80'
                                  }`}
                                >
                                  <div className="text-[10px] font-bold text-slate-400 leading-tight">
                                    {roomName}
                                  </div>
                                  <div className="text-base font-black text-white mt-1">
                                    ${roomPrice}
                                  </div>
                                </motion.div>
                              );
                            })}
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
