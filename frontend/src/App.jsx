import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import GlassSidebar from './components/GlassSidebar';
import BottomNavBar from './components/BottomNavBar';
import AIFloatingOrb from './components/AIFloatingOrb';
import Home from './pages/Home';
import Flights from './pages/Flights';
import Hotels from './pages/Hotels';
import Tours from './pages/Tours';
import AIPlanner from './pages/AIPlanner';
import ProfileHub from './pages/ProfileHub';
import ContactUs from './pages/ContactUs';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/flights" element={<Flights />} />
        <Route path="/hotels" element={<Hotels />} />
        <Route path="/tours" element={<Tours />} />
        <Route path="/ai-planner" element={<AIPlanner />} />
        <Route path="/profile" element={<ProfileHub />} />
        <Route path="/wallet" element={<ProfileHub />} />
        <Route path="/contact" element={<ContactUs />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <Router>
      <div className="bg-[#020408] min-h-screen text-white font-sans overflow-x-hidden selection:bg-amber-500/30 selection:text-amber-200 flex">
        {/* Desktop Sidebar */}
        <GlassSidebar />
        
        {/* Main Content Area (shifted on desktop, normal on mobile) */}
        <main className="relative z-10 flex-1 md:pl-24 pb-20 md:pb-0 min-h-screen w-full">
          <AnimatedRoutes />
        </main>
        
        {/* Mobile Bottom Navigation */}
        <BottomNavBar />

        {/* Global AI Chatbot Widget */}
        <AIFloatingOrb />
      </div>
    </Router>
  );
}
