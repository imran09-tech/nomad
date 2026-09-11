import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Plane,
  Building2,
  Map,
  Sparkles,
  Wallet,
  User,
  ChevronRight,
  MessageSquare,
} from 'lucide-react';

export default function GlassSidebar() {
  const [isHovered, setIsHovered] = useState(false);

  const navItems = [
    { path: '/', label: 'Home', icon: Home, color: 'text-white' },
    { path: '/flights', label: 'Flights', icon: Plane, color: 'text-blue-400' },
    { path: '/hotels', label: 'Hotels', icon: Building2, color: 'text-emerald-400' },
    { path: '/tours', label: 'Tours', icon: Map, color: 'text-purple-400' },
    { path: '/ai-planner', label: 'AI Planner', icon: Sparkles, color: 'text-pink-400' },
    { path: '/wallet', label: 'Wallet', icon: Wallet, color: 'text-yellow-400' },
    { path: '/contact', label: 'Contact', icon: MessageSquare, color: 'text-rose-400' },
    { path: '/profile', label: 'Profile', icon: User, color: 'text-slate-300' },
  ];

  return (
    <motion.div
      className="fixed left-0 top-0 h-screen z-50 flex items-center hidden md:flex"
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <motion.nav
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        animate={{ width: isHovered ? 260 : 80 }}
        transition={{ type: 'spring', mass: 0.6, stiffness: 300, damping: 20 }}
        className="h-[96vh] ml-4 bg-[#080c14]/60 backdrop-blur-3xl border border-slate-800/40 rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] flex flex-col justify-between py-6 overflow-hidden relative"
      >
        {/* Glow Effects */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />

        {/* Logo Section */}
        <div className="px-6 flex items-center mb-8 relative z-10">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-200 to-amber-600 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(245,158,11,0.4)]">
            <span className="text-black font-black text-lg">X</span>
          </div>
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="ml-4 whitespace-nowrap"
              >
                <span className="text-white font-black tracking-widest text-lg">IMXX</span>
                <span className="text-amber-500 font-bold tracking-widest text-xs uppercase block -mt-1">
                  Premium
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-3 space-y-2 relative z-10">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                relative flex items-center px-3 py-3 rounded-2xl group transition-all duration-300
                ${isActive ? 'bg-white/5' : 'hover:bg-white/5'}
              `}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-amber-500 rounded-r-full shadow-[0_0_15px_rgba(245,158,11,0.8)]"
                      transition={{ type: 'spring', mass: 0.6, stiffness: 300, damping: 20 }}
                    />
                  )}

                  <div
                    className={`shrink-0 w-8 flex justify-center transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}
                  >
                    <item.icon
                      className={`w-5 h-5 ${isActive ? item.color : 'text-slate-500 group-hover:text-slate-300'}`}
                    />
                  </div>

                  <AnimatePresence>
                    {isHovered && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className={`ml-3 font-bold tracking-wide whitespace-nowrap text-sm ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Profile Collapse Handle */}
        <div className="px-5 mt-auto relative z-10 flex items-center justify-center cursor-pointer">
          <div
            className={`w-10 h-10 rounded-full border border-slate-700 bg-[#020408] overflow-hidden hover:border-amber-500 transition-colors shrink-0`}
          >
            <img
              src="https://i.pravatar.cc/100?img=33"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="ml-3 flex-1 flex items-center justify-between overflow-hidden"
              >
                <div className="flex flex-col whitespace-nowrap">
                  <span className="text-white font-bold text-sm">Alex M.</span>
                  <span className="text-[10px] font-mono tracking-widest uppercase text-amber-500">
                    Elite Tier
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>
    </motion.div>
  );
}
