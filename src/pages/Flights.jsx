import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plane,
  Calendar,
  Users,
  MapPin,
  Compass,
  Search,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import KineticTransitCard from '../components/KineticTransitCard';
import TicketStubSummary from '../components/TicketStubSummary';
import ShimmerButton from '../components/ShimmerButton';
import NeonBadge from '../components/NeonBadge';

export default function Flights() {
  const [searchState, setSearchState] = useState({
    origin: 'New York (JFK)',
    destination: 'London (LHR)',
    date: '2026-07-24',
    guests: '2 Guests',
    cabinClass: 'First Class',
  });

  const [selectedFlight, setSelectedFlight] = useState(null);
  const [searchActive, setSearchActive] = useState(false);

  const mockFlights = [
    {
      id: 'F-X1',
      operatorName: 'StarJet Supersonic',
      routeIdentifier: 'SS-701',
      departureTime: new Date(new Date().setHours(10, 0)),
      arrivalTime: new Date(new Date().setHours(12, 30)),
      durationString: '02H 30M',
      classes: { 'Club Class': 1850, 'Supersonic First': 3600 },
    },
    {
      id: 'F-X2',
      operatorName: 'AeroGlide Private',
      routeIdentifier: 'AG-880',
      departureTime: new Date(new Date().setHours(15, 30)),
      arrivalTime: new Date(new Date().setHours(19, 45)),
      durationString: '04H 15M',
      classes: { 'Executive Cabin': 950, 'Elite Suite': 2100 },
    },
    {
      id: 'F-X3',
      operatorName: 'Orion Orbital Transit',
      routeIdentifier: 'OR-099',
      departureTime: new Date(new Date().setHours(21, 15)),
      arrivalTime: new Date(new Date().setHours(22, 0)),
      durationString: '00H 45M',
      classes: { 'Suborbital Cabin': 12500, 'Orbital Penthouse': 32000 },
    },
  ];

  const handleFlightSelect = (flight, className, price) => {
    setSelectedFlight({
      ...flight,
      chosenClass: className,
      fare: price,
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchActive(true);
    // Simulate finding results and clearing previous selection
    setSelectedFlight(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-32 pb-24 px-6 md:px-12 min-h-screen relative overflow-hidden"
    >
      {/* Hyper Blue Ambient Glow */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-blue-500/5 via-blue-500/2 to-transparent blur-[120px] pointer-events-none -z-10 rounded-full" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-500/5 to-transparent blur-[100px] pointer-events-none -z-10 rounded-full" />

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div>
            <div className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mb-2">
              Aerospace Grid
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none">
              Supersonic{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-500">
                Transits
              </span>
            </h1>
            <p className="text-slate-400 font-medium tracking-wide mt-2">
              Book private orbital shuttles and hyper-sonic flight paths.
            </p>
          </div>
          <NeonBadge variant="blue" className="w-fit">
            Supersonic Fleet Online
          </NeonBadge>
        </div>

        {/* Floating Contextual Search Hub */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="p-6 md:p-8 rounded-3xl bg-slate-900/10 border border-slate-800/40 backdrop-blur-2xl shadow-2xl relative overflow-hidden"
        >
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Origin input */}
            <div className="flex flex-col space-y-2">
              <label className="text-[9px] text-slate-400 font-mono font-bold tracking-widest uppercase">
                Origin
              </label>
              <div className="relative flex items-center">
                <MapPin className="w-4 h-4 text-blue-400 absolute left-4" />
                <input
                  type="text"
                  value={searchState.origin}
                  onChange={(e) => setSearchState({ ...searchState, origin: e.target.value })}
                  className="w-full h-14 pl-12 pr-4 rounded-xl border border-slate-800/60 bg-[#05080f] shadow-inner text-sm text-white focus:outline-none focus:border-blue-500/80 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300"
                />
              </div>
            </div>

            {/* Destination input */}
            <div className="flex flex-col space-y-2">
              <label className="text-[9px] text-slate-400 font-mono font-bold tracking-widest uppercase">
                Destination
              </label>
              <div className="relative flex items-center">
                <Compass className="w-4 h-4 text-blue-400 absolute left-4" />
                <input
                  type="text"
                  value={searchState.destination}
                  onChange={(e) => setSearchState({ ...searchState, destination: e.target.value })}
                  className="w-full h-14 pl-12 pr-4 rounded-xl border border-slate-800/60 bg-[#05080f] shadow-inner text-sm text-white focus:outline-none focus:border-blue-500/80 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300"
                />
              </div>
            </div>

            {/* Date input */}
            <div className="flex flex-col space-y-2">
              <label className="text-[9px] text-slate-400 font-mono font-bold tracking-widest uppercase">
                Departure Date
              </label>
              <div className="relative flex items-center">
                <Calendar className="w-4 h-4 text-blue-400 absolute left-4" />
                <input
                  type="date"
                  value={searchState.date}
                  onChange={(e) => setSearchState({ ...searchState, date: e.target.value })}
                  className="w-full h-14 pl-12 pr-4 rounded-xl border border-slate-800/60 bg-[#05080f] shadow-inner text-sm text-white focus:outline-none focus:border-blue-500/80 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300"
                />
              </div>
            </div>

            {/* Guests selection */}
            <div className="flex flex-col space-y-2">
              <label className="text-[9px] text-slate-400 font-mono font-bold tracking-widest uppercase">
                Travelers
              </label>
              <div className="relative flex items-center">
                <Users className="w-4 h-4 text-blue-400 absolute left-4" />
                <select
                  value={searchState.guests}
                  onChange={(e) => setSearchState({ ...searchState, guests: e.target.value })}
                  className="w-full h-14 pl-12 pr-4 rounded-xl border border-slate-800/60 bg-[#05080f] shadow-inner text-sm text-white focus:outline-none focus:border-blue-500/80 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 appearance-none"
                >
                  <option value="1 Guest">1 Elite Traveler</option>
                  <option value="2 Guests">2 Elite Travelers</option>
                  <option value="4 Guests">4 Private Party</option>
                </select>
              </div>
            </div>

            {/* Submit button */}
            <div className="flex flex-col justify-end">
              <button
                type="submit"
                className="w-full h-14 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-extrabold text-sm tracking-wide shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Search className="w-4 h-4" /> Search Vectors
              </button>
            </div>
          </form>
        </motion.div>

        {/* Selected Boarding Stub Panel */}
        <AnimatePresence>
          {selectedFlight && (
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
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> SECURE CONCIERGE
                        TRANSLATION
                      </div>
                      <h3 className="text-3xl font-black text-white tracking-tighter">
                        Boarding Pass Locked
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Route: {searchState.origin}{' '}
                        <ArrowRight className="inline w-3 h-3 text-slate-500" />{' '}
                        {searchState.destination}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 border-t md:border-t-0 md:border-l border-slate-800/60 pt-4 md:pt-0 md:pl-8 text-left">
                      <div>
                        <span className="block text-[9px] text-slate-500 font-mono tracking-widest uppercase">
                          Operator
                        </span>
                        <span className="text-sm font-extrabold text-white">
                          {selectedFlight.operatorName}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-slate-500 font-mono tracking-widest uppercase">
                          Vector ID
                        </span>
                        <span className="text-sm font-extrabold text-blue-400 font-mono">
                          {selectedFlight.routeIdentifier}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-slate-500 font-mono tracking-widest uppercase">
                          Cabin Class
                        </span>
                        <span className="text-sm font-extrabold text-amber-500">
                          {selectedFlight.chosenClass}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-slate-500 font-mono tracking-widest uppercase">
                          Travelers
                        </span>
                        <span className="text-sm font-extrabold text-white">
                          {searchState.guests}
                        </span>
                      </div>
                    </div>
                  </div>
                }
                rightContent={
                  <div className="text-center">
                    <div className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mb-1">
                      Elite Charter Price
                    </div>
                    <div className="text-4xl font-black text-white tracking-tighter mb-5">
                      ${selectedFlight.fare}
                    </div>
                    <ShimmerButton className="w-full !py-3.5 !text-xs !rounded-xl">
                      Confirm Flight Vector
                    </ShimmerButton>
                  </div>
                }
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Flight Results Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-white tracking-wide">
              {searchActive ? 'Direct Vectors Found' : 'Featured Route Vectors'}
            </h3>
            <span className="text-xs text-slate-500 font-medium">3 Vectors Available</span>
          </div>

          <div className="space-y-6">
            {mockFlights.map((flight) => {
              const isSelected = selectedFlight?.id === flight.id;
              const transitWithClass = isSelected
                ? { ...flight, chosenClass: selectedFlight.chosenClass }
                : flight;

              return (
                <KineticTransitCard
                  key={flight.id}
                  transit={transitWithClass}
                  originCity={searchState.origin}
                  destinationCity={searchState.destination}
                  type="flight"
                  isSelected={isSelected}
                  onSelect={handleFlightSelect}
                />
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
