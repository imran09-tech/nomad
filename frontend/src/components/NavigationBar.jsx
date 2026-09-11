import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Plane, Building2, Train, Map } from 'lucide-react';

export default function NavigationBar() {
  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/flights', label: 'Flights', icon: Plane },
    { path: '/hotels', label: 'Hotels', icon: Building2 },
    { path: '/trains', label: 'Trains', icon: Train },
    { path: '/tours', label: 'Tours', icon: Map }
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-[100] px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-2">
           <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.4)]">
             <span className="text-black font-black text-xl">L</span>
           </div>
           <span className="text-white font-extrabold tracking-wide text-2xl">LUXE</span>
        </div>

        {/* Links */}
        <div className="hidden md:flex items-center space-x-1 bg-slate-900/40 backdrop-blur-3xl border border-slate-800/60 p-1.5 rounded-2xl shadow-2xl">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                relative flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors
                ${isActive ? 'text-white' : 'text-slate-400 hover:text-white'}
              `}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div 
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-white/10 rounded-xl border border-white/10"
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
                  )}
                  <item.icon className="w-4 h-4 relative z-10" />
                  <span className="relative z-10 tracking-wide">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Profile */}
        <div className="w-10 h-10 rounded-full border border-slate-700 bg-slate-800 overflow-hidden cursor-pointer hover:border-amber-500 transition-colors">
           <img src="https://i.pravatar.cc/100?img=33" alt="Profile" className="w-full h-full object-cover" />
        </div>
      </div>
    </nav>
  );
}
