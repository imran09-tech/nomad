import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Plane, Building2, Sparkles, User, MessageSquare } from 'lucide-react';

export default function BottomNavBar() {
  const navItems = [
    { path: '/', label: 'Home', icon: Home, color: 'text-white' },
    { path: '/flights', label: 'Flights', icon: Plane, color: 'text-blue-400' },
    { path: '/ai-planner', label: 'Planner', icon: Sparkles, color: 'text-pink-400' },
    { path: '/hotels', label: 'Hotels', icon: Building2, color: 'text-emerald-400' },
    { path: '/contact', label: 'Contact', icon: MessageSquare, color: 'text-rose-400' },
    { path: '/profile', label: 'Profile', icon: User, color: 'text-slate-300' },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 md:hidden">
      {/* Gradient Fade */}
      <div className="absolute bottom-full left-0 w-full h-16 bg-gradient-to-t from-[#020408] to-transparent pointer-events-none" />
      
      <div className="bg-[#080c14]/80 backdrop-blur-3xl border-t border-slate-800/60 pb-safe pt-2 px-6 flex justify-between items-center shadow-[0_-20px_40px_rgba(0,0,0,0.5)] relative">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              relative flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300
              ${isActive ? '' : 'opacity-60 hover:opacity-100'}
            `}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div 
                    layoutId="bottom-nav-active"
                    className="absolute inset-0 bg-white/10 rounded-2xl border border-white/10"
                    transition={{ type: "spring", mass: 0.6, stiffness: 300, damping: 20 }}
                  />
                )}
                <item.icon className={`w-5 h-5 mb-1 relative z-10 ${isActive ? item.color : 'text-slate-400'}`} />
                <span className={`text-[9px] font-bold tracking-widest uppercase relative z-10 ${isActive ? 'text-white' : 'text-slate-500'}`}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
