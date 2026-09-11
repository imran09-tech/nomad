import { motion } from 'framer-motion';
import { CloudRain, Wind, Droplets } from 'lucide-react';
import { AsymmetricBentoItem } from './AsymmetricBento';

export default function WeatherTelemetryWidget({ colSpan = 4, className = '' }) {
  return (
    <AsymmetricBentoItem
      colSpan={colSpan}
      className={`p-6 bg-[#080c14] border border-slate-800/60 relative group overflow-hidden ${className}`}
    >
      <img
        src="https://images.unsplash.com/photo-1516912481808-3406841bd33c?q=80&w=800"
        alt="Weather"
        className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-opacity duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#020408] via-[#020408]/60 to-[#020408]/20" />

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="text-[10px] text-slate-400 font-mono font-bold tracking-widest uppercase mb-1">
              Local Telemetry
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">Zermatt, CH</h3>
          </div>
          <CloudRain className="w-6 h-6 text-emerald-400" />
        </div>

        <div className="flex items-end space-x-2 mb-6">
          <span className="text-5xl font-black text-white tracking-tighter">-4°</span>
          <span className="text-lg text-slate-500 font-bold mb-1">C</span>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-auto">
          <div className="bg-[#020408]/80 backdrop-blur-sm rounded-xl p-3 border border-slate-800/40">
            <Wind className="w-4 h-4 text-slate-500 mb-2" />
            <div className="text-white font-bold tracking-wide">24 km/h</div>
            <div className="text-[9px] text-slate-500 font-mono font-bold tracking-widest uppercase mt-1">
              Wind Speed
            </div>
          </div>
          <div className="bg-[#020408]/80 backdrop-blur-sm rounded-xl p-3 border border-slate-800/40">
            <Droplets className="w-4 h-4 text-slate-500 mb-2" />
            <div className="text-white font-bold tracking-wide">82%</div>
            <div className="text-[9px] text-slate-500 font-mono font-bold tracking-widest uppercase mt-1">
              Humidity
            </div>
          </div>
        </div>
      </div>
    </AsymmetricBentoItem>
  );
}
