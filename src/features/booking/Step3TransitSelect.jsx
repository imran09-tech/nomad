import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Train,
  Bus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Search,
  MapPin,
  Utensils,
  ShieldCheck,
  Star,
} from 'lucide-react';
import StationSearch from './StationSearch';

export default function Step3TransitSelect({ bookingContext, updateBookingContext }) {
  const [transitOptions, setTransitOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All'); // 'All', 'Train', 'Bus'

  // Autocomplete State
  const { originCity = 'any', destinationCity = 'any', checkIn } = bookingContext;
  const [activeStationCode, setActiveStationCode] = useState('NDLS'); // default monitored station

  // Main Feed Fetcher
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
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Live Ground Transit</h3>

          {/* Active Selection Chip with emerald pulse */}
          <div className="inline-flex items-center space-x-2 bg-gray-900 border border-gray-700 px-3 py-1.5 rounded-full text-xs text-gray-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>
              Monitoring Live Station: <strong>{activeStationCode}</strong>
            </span>
          </div>
        </div>

        <div className="flex space-x-2 bg-gray-900/50 p-1 rounded-lg border border-gray-800">
          <button
            onClick={() => setFilter('All')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${filter === 'All' ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('Train')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${filter === 'Train' ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
          >
            <Train className="w-4 h-4" /> <span>Trains</span>
          </button>
          <button
            onClick={() => setFilter('Bus')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${filter === 'Bus' ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
          >
            <Bus className="w-4 h-4" /> <span>Buses</span>
          </button>
        </div>
      </div>

      {/* Autocomplete Input Field */}
      <StationSearch onSelectStation={(station) => setActiveStationCode(station.code)} />

      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-amber-500" />
          <p>Connecting to IRCTC Live Feed...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-12 text-red-400 bg-red-900/20 rounded-xl border border-red-500/30">
          <AlertCircle className="w-8 h-8 mb-4" />
          <p>{error}</p>
        </div>
      ) : filteredOptions.length === 0 ? (
        <div className="text-center p-8 text-gray-500">
          No {filter.toLowerCase()} routes actively tracked right now.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {filteredOptions.map((transit) => {
            const isSelected = bookingContext.transitId === transit.id;

            if (transit.type === 'Train') {
              const depTime = new Date(transit.departureTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });
              const arrTime = new Date(transit.arrivalTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              const basePrice = transit.pricingTier || 450;
              const trainClasses = [
                {
                  name: '3A',
                  price: Math.round(basePrice * 2.6),
                  status: 'WL 81',
                  prob: '34% Chance',
                  isGreen: false,
                },
                {
                  name: '2A',
                  price: Math.round(basePrice * 3.7),
                  status: 'WL 23',
                  prob: 'Waitlist',
                  isGreen: true,
                },
                {
                  name: '1A',
                  price: Math.round(basePrice * 6.2),
                  status: 'WL 10',
                  prob: 'Waitlist',
                  isGreen: true,
                },
                {
                  name: 'SL',
                  price: basePrice,
                  status: 'WL 74',
                  prob: '40% Chance',
                  isGreen: false,
                },
              ];

              return (
                <div
                  key={transit.id}
                  className="rounded-2xl bg-[#0d111a] border border-slate-800/80 p-5 hover:border-slate-700/80 transition-all flex flex-col relative mb-2"
                >
                  {isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 rounded-l-2xl"></div>
                  )}

                  {/* A. Card Header Zone */}
                  <div className="flex justify-between items-center">
                    <div className="font-semibold text-white text-base">
                      {transit.routeIdentifier} {transit.operatorName}
                    </div>
                    <div className="flex items-center space-x-3">
                      <Utensils className="w-4 h-4 text-slate-500" />
                      <div className="bg-[#1a2333] border border-slate-700 rounded-lg px-2 py-0.5 text-xs text-amber-500 font-bold flex items-center">
                        <Star className="w-3 h-3 mr-1 fill-amber-500" /> 4.3
                      </div>
                    </div>
                  </div>

                  {/* B. Main Journey Timing Row */}
                  <div className="flex justify-between items-center my-4 pb-4 border-b border-slate-900">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg text-white font-bold">{depTime}</span>
                      <span className="text-sm text-slate-400 font-semibold">
                        {originCity.substring(0, 4).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex flex-col items-center flex-1 px-8">
                      <span className="text-xs text-slate-400 font-medium mb-1">
                        — {transit.durationString} →
                      </span>
                      <div className="w-full h-[1px] bg-slate-800"></div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg text-white font-bold">{arrTime}</span>
                      <span className="text-sm text-slate-400 font-semibold">
                        {destinationCity.substring(0, 4).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-8 text-xs font-semibold text-amber-500 hover:underline cursor-pointer">
                      Schedule
                    </div>
                  </div>

                  {/* C. Tier Class Pricing Matrices */}
                  <div className="flex space-x-3 overflow-x-auto pt-2 pb-1 custom-scrollbar">
                    {transit.classes
                      ? Object.entries(transit.classes).map(([className, price], idx) => {
                          const isClassSelected =
                            isSelected && bookingContext.transitData?.chosenClass === className;

                          return (
                            <div
                              key={idx}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelect(transit, className, price);
                              }}
                              className={`min-w-[110px] border rounded-xl p-3 text-left transition-all cursor-pointer relative ${
                                isClassSelected
                                  ? 'border-amber-500 bg-[#1c2436] ring-1 ring-amber-500/20'
                                  : 'bg-[#121824] border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              <div className="text-xs text-slate-400 font-bold mb-1">
                                {className}
                              </div>
                              <div className="text-sm font-extrabold text-white">₹{price}</div>
                            </div>
                          );
                        })
                      : trainClasses.map((cls, idx) => {
                          const isClassSelected =
                            isSelected && bookingContext.transitData?.chosenClass === cls.name;

                          return (
                            <div
                              key={idx}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelect(transit, cls.name, cls.price);
                              }}
                              className={`min-w-[110px] border rounded-xl p-3 text-left transition-all cursor-pointer relative ${
                                isClassSelected
                                  ? 'border-amber-500 bg-[#1c2436] ring-1 ring-amber-500/20'
                                  : 'bg-[#121824] border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              <div className="text-xs text-slate-400 font-bold mb-1">
                                {cls.name}
                              </div>
                              <div className="text-sm font-extrabold text-white">₹{cls.price}</div>
                            </div>
                          );
                        })}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={transit.id}
                onClick={() => handleSelect(transit)}
                className={`relative flex items-center justify-between p-5 rounded-xl border transition-all cursor-pointer mb-2 ${
                  isSelected
                    ? 'bg-[#1c2436] border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                    : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center space-x-6">
                  <div
                    className={`p-3 rounded-full ${isSelected ? 'bg-amber-500 text-black' : 'bg-gray-800 text-gray-400'}`}
                  >
                    <Bus className="w-6 h-6" />
                  </div>

                  <div>
                    <h4 className={`font-bold ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                      {transit.operatorName}{' '}
                      <span className="text-xs font-normal text-gray-500 ml-2">
                        #{transit.routeIdentifier}
                      </span>
                    </h4>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                      <div className="flex flex-col">
                        <span className="text-white font-medium">
                          {new Date(transit.departureTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span className="text-xs">Departs</span>
                      </div>
                      <div className="flex flex-col items-center px-4 border-x border-gray-800">
                        <span className="text-xs">{transit.durationString}</span>
                        <div className="w-16 h-px bg-gray-700 my-1"></div>
                        <span className="text-xs text-green-400">Direct</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white font-medium">
                          {new Date(transit.arrivalTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span className="text-xs">Arrives</span>
                      </div>

                      {transit.platform && (
                        <div className="flex flex-col pl-4 border-l border-gray-800">
                          <span className="text-amber-500 font-medium text-xs border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 rounded">
                            {transit.delay !== '0 Mins'
                              ? `Delay: ${transit.delay}`
                              : 'Live • On Time'}
                          </span>
                          <span className="text-xs mt-1">Platform: {transit.platform}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <div className="text-2xl font-bold text-white mb-2">${transit.pricingTier}</div>
                  {isSelected ? (
                    <div className="flex items-center text-amber-500 text-sm font-bold bg-amber-500/10 px-3 py-1 rounded-full">
                      <CheckCircle2 className="w-4 h-4 mr-1" /> Active Choice
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 hover:text-white transition-colors">
                      Select {transit.type}
                    </div>
                  )}
                </div>

                {/* Visual indicator line on the left when selected */}
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 rounded-l-xl"></div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
