import { motion } from 'framer-motion';
import { Award, ShieldCheck, MapPin, Plane, Building2 } from 'lucide-react';
import { AsymmetricBento, AsymmetricBentoItem } from '../components/AsymmetricBento';

export default function ProfileHub() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-24 pb-20 px-6 min-h-screen relative overflow-hidden"
    >
      <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-gradient-to-l from-slate-700/10 to-transparent blur-[120px] pointer-events-none -z-10 rounded-full" />

      <div className="max-w-6xl mx-auto space-y-12">
        <div className="flex justify-between items-end">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 rounded-full border-2 border-slate-700 bg-[#020408] overflow-hidden p-1 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
              <div className="w-full h-full rounded-full overflow-hidden">
                <img
                  src="https://i.pravatar.cc/200?img=33"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 mb-2">
                <ShieldCheck className="w-3 h-3 text-amber-500" />
                <span className="text-[10px] text-amber-500 font-mono font-bold tracking-widest uppercase">
                  Verified Elite
                </span>
              </div>
              <h1 className="text-4xl font-black text-white tracking-tighter mb-1">Alexander M.</h1>
              <p className="text-slate-400 font-mono tracking-widest text-xs uppercase">
                IMXX Platinum Member
              </p>
            </div>
          </div>
        </div>

        <AsymmetricBento>
          {/* Passport / Achievements (Spans 8) */}
          <AsymmetricBentoItem
            colSpan={8}
            rowSpan={2}
            className="min-h-[400px] p-8 flex flex-col justify-end relative group border-slate-700/50"
          >
            <div className="absolute inset-0 bg-[#080c14] -z-10" />
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Plane className="w-64 h-64 text-slate-500" />
            </div>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-black text-white mb-2">Digital Passport</h3>
                <div className="text-xs text-slate-400 font-mono tracking-widest uppercase">
                  Global Footprint
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div className="bg-[#020408] border border-slate-800 p-4 rounded-2xl">
                  <div className="text-3xl font-black text-white mb-1">24</div>
                  <div className="text-[10px] text-slate-500 font-mono font-bold tracking-widest uppercase">
                    Countries Visited
                  </div>
                </div>
                <div className="bg-[#020408] border border-slate-800 p-4 rounded-2xl">
                  <div className="text-3xl font-black text-white mb-1">112</div>
                  <div className="text-[10px] text-slate-500 font-mono font-bold tracking-widest uppercase">
                    Flights Taken
                  </div>
                </div>
                <div className="bg-[#020408] border border-slate-800 p-4 rounded-2xl">
                  <div className="text-3xl font-black text-white mb-1">14</div>
                  <div className="text-[10px] text-slate-500 font-mono font-bold tracking-widest uppercase">
                    Luxury Stays
                  </div>
                </div>
                <div className="bg-[#020408] border border-slate-800 p-4 rounded-2xl">
                  <div className="text-3xl font-black text-white mb-1">3.4k</div>
                  <div className="text-[10px] text-slate-500 font-mono font-bold tracking-widest uppercase">
                    Hours in Transit
                  </div>
                </div>
              </div>
            </div>
          </AsymmetricBentoItem>

          {/* Wallet (Spans 4) */}
          <AsymmetricBentoItem colSpan={4} className="p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#080c14] to-[#121826] -z-10" />
            <div className="text-[10px] text-slate-400 font-mono font-bold tracking-widest uppercase mb-4">
              Travel Wallet
            </div>
            <div className="text-5xl font-black text-white mb-2">142,500</div>
            <div className="text-sm font-bold text-amber-500 mb-8">Elite Miles</div>

            <div className="space-y-3">
              <div className="bg-[#020408] border border-slate-800/60 p-3 rounded-xl flex justify-between items-center">
                <div className="text-xs text-slate-300 font-bold">Reward Tier</div>
                <div className="text-[10px] font-mono tracking-widest uppercase text-amber-500">
                  Platinum
                </div>
              </div>
              <div className="bg-[#020408] border border-slate-800/60 p-3 rounded-xl flex justify-between items-center">
                <div className="text-xs text-slate-300 font-bold">Next Milestone</div>
                <div className="text-[10px] font-mono tracking-widest uppercase text-slate-400">
                  150k • Diamond
                </div>
              </div>
            </div>
          </AsymmetricBentoItem>

          {/* Recent Memories (Spans 4) */}
          <AsymmetricBentoItem
            colSpan={4}
            className="min-h-[250px] p-6 flex flex-col justify-end relative group"
          >
            <img
              src="https://images.unsplash.com/photo-1542314831-c6a4d14d8c85?q=80&w=1000"
              alt="Resort"
              className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#020408] to-transparent" />
            <div className="relative z-10">
              <div className="flex items-center space-x-2 mb-2">
                <Building2 className="w-3 h-3 text-slate-400" />
                <div className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">
                  Past Stay
                </div>
              </div>
              <h4 className="text-xl font-bold text-white mb-1">Aman Tokyo</h4>
              <div className="text-xs text-slate-400 font-bold tracking-wide">
                Oct 12 - Oct 18, 2025
              </div>
            </div>
          </AsymmetricBentoItem>
        </AsymmetricBento>
      </div>
    </motion.div>
  );
}
