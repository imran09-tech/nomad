import React from 'react';

const Sidebar = ({ currentTab, setTab, openModal }) => {
  return (
    <aside className="bk-sidebar" style={{
      width: '240px',
      background: '#0a0a0c',
      borderRight: '1px solid rgba(255,255,255,0.05)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 0',
      zIndex: 10
    }}>
      {/* Brand */}
      <div style={{ padding: '0 24px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '40px', height: '40px', background: 'linear-gradient(135deg, var(--gold), #b8860b)',
          borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 15px rgba(212,175,55,0.2)'
        }}>
          <i className="fa-solid fa-gem" style={{ color: '#000', fontSize: '18px' }}></i>
        </div>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--gold)', letterSpacing: '2px', margin: 0 }}>IMXX</h1>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', letterSpacing: '3px', marginTop: '2px' }}>PREMIUM</div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '0 12px' }}>
        <button 
          className={`nav-btn ${currentTab === 'explore' ? 'active' : ''}`}
          onClick={() => setTab('explore')}
        >
          <i className="fa-solid fa-compass"></i> Explore
        </button>
        <button 
          className={`nav-btn ${currentTab === 'itineraries' ? 'active' : ''}`}
          onClick={() => setTab('itineraries')}
        >
          <i className="fa-solid fa-map-location-dot"></i> Itineraries
        </button>
        <button 
          className={`nav-btn ${currentTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setTab('bookings')}
        >
          <i className="fa-solid fa-calendar-check"></i> Bookings
        </button>
        <button 
          className={`nav-btn ${currentTab === 'flights' ? 'active' : ''}`}
          onClick={() => setTab('flights')}
        >
          <i className="fa-solid fa-plane"></i> Flights
        </button>
        <button 
          className={`nav-btn ${currentTab === 'experiences' ? 'active' : ''}`}
          onClick={() => setTab('experiences')}
        >
          <i className="fa-solid fa-champagne-glasses"></i> Experiences
        </button>
        
        <div style={{ margin: '24px 12px 12px', fontSize: '11px', fontWeight: 700, color: '#555', letterSpacing: '1px' }}>ACCOUNT</div>
        
        <button 
          className={`nav-btn ${currentTab === 'finances' ? 'active' : ''}`}
          onClick={() => setTab('finances')}
        >
          <i className="fa-solid fa-wallet"></i> Finances
        </button>
        <button 
          className={`nav-btn ${currentTab === 'settings' ? 'active' : ''}`}
          onClick={() => setTab('settings')}
        >
          <i className="fa-solid fa-gear"></i> Settings
        </button>
        <button 
          className={`nav-btn ${currentTab === 'admin' ? 'active' : ''}`}
          onClick={() => setTab('admin')}
        >
          <i className="fa-solid fa-shield-halved"></i> Admin
        </button>
      </nav>

      {/* Concierge Button */}
      <div style={{ padding: '0 20px', marginTop: 'auto' }}>
        <button 
          className="btn-premium" 
          style={{ width: '100%', padding: '12px' }}
          onClick={() => openModal('modal-contact')}
        >
          <i className="fa-solid fa-headset"></i> 24/7 Concierge
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
