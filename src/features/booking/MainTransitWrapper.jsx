import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, AlertCircle, Train, Bus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import StationSearchBox from './StationSearchBox';
import PremiumTrainCard from './PremiumTrainCard';

export default function MainTransitWrapper({ bookingContext, updateBookingContext }) {
  const [transitOptions, setTransitOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');

  // Autocomplete State
  const { originCity = 'any', destinationCity = 'any', checkIn } = bookingContext;
  const [activeStationCode, setActiveStationCode] = useState('NDLS'); // default monitored station

  useEffect(() => {
    const fetchTransitData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [transitRes, irctcRes] = await Promise.all([
          axios.get('/api/v1/transit/search', {
            params: {
              originCity,
              destinationCity,
              departureDate: checkIn || new Date().toISOString(),
            },
          }),
          axios
            .get('/api/v1/trains/live', {
              params: { stationCode: activeStationCode },
            })
            .catch(() => ({ data: { success: false, data: [] } })),
        ]);

        let combinedData = [];
        if (transitRes.data.success) {
          combinedData = [...transitRes.data.data];
        }
        if (irctcRes.data && irctcRes.data.success && irctcRes.data.data) {
          combinedData = [...combinedData, ...irctcRes.data.data];
        }

        if (combinedData.length > 0) {
          setTransitOptions(combinedData);
        } else {
          setError('Failed to fetch transit routes.');
        }
      } catch (err) {
        console.error('Transit API Error:', err);
        setError('Error connecting to live transit data.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransitData();
  }, [originCity, destinationCity, checkIn, activeStationCode]);

  const filteredOptions = transitOptions.filter((opt) => {
    if (filter === 'All') return true;
    return opt.type === filter;
  });

  const handleSelect = (transit, chosenClass = 'SL', finalFare = null) => {
    const price = finalFare || transit.pricingTier || transit.price || 0;
    updateBookingContext({
      transitId: transit.id,
      transitData: {
        type: transit.type,
        operatorName: transit.operatorName,
        price: price,
        duration: transit.durationString,
        chosenClass: chosenClass,
      },
      selectedTransit: {
        ...transit,
        number: transit.number || transit.id,
        class: chosenClass,
        fare: price,
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative min-h-[80vh] rounded-3xl overflow-hidden bg-[#030712] border border-white/5 backdrop-blur-2xl shadow-2xl p-6 md:p-10"
    >
      {/* Deep Space Atmosphere - Mesh Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-amber-500/10 to-transparent blur-[120px] rounded-full" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-500/10 to-transparent blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 flex flex-col space-y-8">
        {/* Header Zone */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black tracking-tighter text-white mb-2">
              Live Ground Transit
            </h2>
            <div className="inline-flex items-center space-x-3 bg-white/[0.03] border border-white/5 px-4 py-2 rounded-full backdrop-blur-xl">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-sm text-slate-300">
                Monitoring Live Station:{' '}
                <strong className="text-white ml-1">{activeStationCode}</strong>
              </span>
            </div>
          </div>

          <div className="flex space-x-2 bg-white/[0.02] p-1.5 rounded-2xl border border-white/5 backdrop-blur-xl">
            {['All', 'Train', 'Bus'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`relative px-6 py-2.5 rounded-xl text-sm font-bold transition-colors ${filter === f ? 'text-black' : 'text-slate-400 hover:text-white'}`}
              >
                {filter === f && (
                  <motion.div
                    layoutId="filter-active"
                    className="absolute inset-0 bg-amber-500 rounded-xl"
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  />
                )}
                <span className="relative z-10 flex items-center space-x-2">
                  {f === 'Train' && <Train className="w-4 h-4" />}
                  {f === 'Bus' && <Bus className="w-4 h-4" />}
                  <span>{f}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Floating Search Container */}
        <div className="w-full relative z-50">
          <StationSearchBox onSelectStation={(station) => setActiveStationCode(station.code)} />
        </div>

        {/* Results Stream */}
        <div className="relative z-10 min-h-[400px]">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full pt-20"
              >
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
                  <div className="absolute inset-0 bg-amber-500/10 blur-xl rounded-full" />
                </div>
                <p className="mt-6 text-slate-400 font-medium tracking-widest uppercase text-sm">
                  Connecting to Live Feed
                </p>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center p-12 bg-red-500/5 border border-red-500/20 rounded-3xl"
              >
                <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
                <p className="text-red-400 font-medium">{error}</p>
              </motion.div>
            ) : filteredOptions.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center pt-20 text-slate-500 font-medium"
              >
                No {filter.toLowerCase()} routes actively tracked right now.
              </motion.div>
            ) : (
              <motion.div key="results" className="grid grid-cols-1 gap-6 pb-20">
                {filteredOptions.map((transit, idx) => {
                  const isSelected = bookingContext.transitId === transit.id;

                  // Injecting default classes array for Train display compatibility
                  if (transit.type === 'Train' && !transit.classes) {
                    const basePrice = transit.pricingTier || 450;
                    transit.classes = {
                      '3A': Math.round(basePrice * 2.6),
                      '2A': Math.round(basePrice * 3.7),
                      '1A': Math.round(basePrice * 6.2),
                      SL: basePrice,
                    };
                  }

                  return transit.type === 'Train' ? (
                    <PremiumTrainCard
                      key={transit.id}
                      train={transit}
                      originCity={originCity}
                      destinationCity={destinationCity}
                      isSelected={isSelected}
                      onSelect={handleSelect}
                    />
                  ) : (
                    <div
                      key={transit.id}
                      className="rounded-2xl bg-white/[0.02] border border-white/5 p-5 text-slate-400"
                    >
                      Bus Component Integration Pending
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
