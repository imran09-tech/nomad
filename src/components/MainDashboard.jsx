import React, { useState } from 'react';

const MainDashboard = ({ categories, selectedCategory, onSelectCategory, onSearch, destinations, onOpenDetail }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <div style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>
      {/* Header & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Discover the Extraordinary
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>Curated experiences for the elite traveler.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div className="search-bar" style={{ position: 'relative' }}>
            <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#888' }}></i>
            <input 
              type="text" 
              placeholder="Search destinations, hotels..." 
              value={searchQuery}
              onChange={handleSearch}
              style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                padding: '12px 16px 12px 44px', borderRadius: '12px', color: '#fff', width: '300px',
                outline: 'none', transition: 'all 0.3s'
              }}
            />
          </div>
          <button className="icon-btn">
            <i className="fa-solid fa-bell"></i>
            <span className="badge">3</span>
          </button>
          <div className="profile-btn" style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#333', overflow: 'hidden', cursor: 'pointer' }}>
            <img src="../pic/users/user1.jpg" alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="filter-scroll" style={{ display: 'flex', gap: '12px', marginBottom: '32px', overflowX: 'auto', paddingBottom: '10px' }}>
        {categories.map((cat) => (
          <button 
            key={cat.id}
            className={`filter-pill ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => onSelectCategory(cat.id)}
            style={{
              padding: '10px 20px', borderRadius: '30px', fontWeight: 600, fontSize: '14px',
              border: selectedCategory === cat.id ? 'none' : '1px solid rgba(255,255,255,0.1)',
              background: selectedCategory === cat.id ? 'var(--gold)' : 'rgba(255,255,255,0.03)',
              color: selectedCategory === cat.id ? '#000' : '#fff',
              cursor: 'pointer', transition: 'all 0.3s', whiteSpace: 'nowrap'
            }}
          >
            {cat.icon && <i className={cat.icon} style={{ marginRight: '8px' }}></i>}
            {cat.name}
          </button>
        ))}
      </div>

      {/* Grid */}
      <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <i className="fa-solid fa-fire" style={{ color: '#ff4757' }}></i> Trending Now
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
        {(destinations ? destinations.filter((item, index, self) => {
          if (!item || !item.img) return false;
          const cleanImg = String(item.img).replace(/^(\.\.\/|\.\/)+/, '').toLowerCase().split('?')[0].trim();
          const cleanName = String(item.name || '').toLowerCase().trim();
          const key = `${cleanName}|${cleanImg}`;
          return index === self.findIndex(t => {
            const tImg = String(t.img).replace(/^(\.\.\/|\.\/)+/, '').toLowerCase().split('?')[0].trim();
            const tName = String(t.name || '').toLowerCase().trim();
            return `${tName}|${tImg}` === key;
          });
        }) : []).map((item) => (
          <div 
            key={item.id} 
            className="grid-card"
            onClick={() => onOpenDetail(item)}
            style={{
              background: 'rgba(255,255,255,0.02)', borderRadius: '16px', overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'all 0.3s'
            }}
          >
            <div style={{ height: '200px', width: '100%', position: 'relative' }}>
              <img 
                src={item.img} 
                alt={item.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <button 
                onClick={(e) => { e.stopPropagation(); /* toggle favorite */ }}
                style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', color: '#fff', backdropFilter: 'blur(4px)', cursor: 'pointer' }}
              >
                <i className="fa-regular fa-heart"></i>
              </button>
            </div>
            <div style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>{item.name}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(212,175,55,0.1)', color: 'var(--gold)', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
                  <i className="fa-solid fa-star"></i> {item.rating}
                </div>
              </div>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
                <i className="fa-solid fa-location-dot" style={{ marginRight: '6px' }}></i>
                {item.location}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>From</span>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--gold)' }}>${item.price.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MainDashboard;
