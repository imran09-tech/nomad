import React, { useContext } from 'react';

const DetailPanel = ({ selectedItem, onClose, onBookNow }) => {
  if (!selectedItem) return null;

  return (
    <div style={{
      width: '400px', background: '#0a0a0c', borderLeft: '1px solid rgba(255,255,255,0.05)',
      display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 20
    }}>
      {/* Top Banner Image */}
      <div style={{ height: '240px', position: 'relative' }}>
        <img 
          src={selectedItem.img} 
          alt={selectedItem.name} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, #0a0a0c)' }}></div>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', backdropFilter: 'blur(4px)' }}
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div style={{ padding: '0 32px 32px', flex: 1, overflowY: 'auto', marginTop: '-40px', position: 'relative' }}>
        {/* Title & Badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 8px 0', color: '#fff' }}>{selectedItem.name}</h2>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
              <i className="fa-solid fa-location-dot" style={{ marginRight: '6px' }}></i>{selectedItem.location}
            </p>
          </div>
          <div style={{ background: 'var(--gold)', color: '#000', padding: '6px 12px', borderRadius: '8px', fontWeight: 800, fontSize: '14px' }}>
            <i className="fa-solid fa-star"></i> {selectedItem.rating}
          </div>
        </div>

        {/* Quick Facts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <i className="fa-solid fa-temperature-half" style={{ color: '#bbb', marginBottom: '8px', display: 'block' }}></i>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Weather</div>
            <div style={{ fontWeight: 600 }}>24°C | Sunny</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <i className="fa-solid fa-plane" style={{ color: '#bbb', marginBottom: '8px', display: 'block' }}></i>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Flight Time</div>
            <div style={{ fontWeight: 600 }}>4h 20m</div>
          </div>
        </div>

        {/* Description */}
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', borderLeft: '3px solid var(--gold)', paddingLeft: '12px' }}>
          Experience Overview
        </h3>
        <p style={{ color: '#ccc', lineHeight: 1.6, fontSize: '14px', marginBottom: '32px' }}>
          {selectedItem.desc || "Experience the ultimate luxury escape. Enjoy pristine beaches, world-class dining, and exclusive amenities tailored to elite travelers."}
        </p>

        {/* Price Ledger */}
        <div style={{ background: 'linear-gradient(145deg, rgba(212,175,55,0.1), rgba(0,0,0,0))', padding: '24px', borderRadius: '16px', border: '1px solid rgba(212,175,55,0.2)', marginBottom: '32px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Base Package Price</div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--gold)', marginBottom: '16px' }}>
            ${selectedItem.price.toLocaleString()}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#ccc', marginBottom: '8px' }}>
            <span>Taxes & Fees (10%)</span>
            <span>${(selectedItem.price * 0.1).toLocaleString()}</span>
          </div>
          <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '12px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 700 }}>
            <span>Total Estimates</span>
            <span style={{ color: 'var(--gold)' }}>${(selectedItem.price * 1.1).toLocaleString()}</span>
          </div>
        </div>

      </div>

      {/* Footer CTA */}
      <div style={{ padding: '24px 32px', borderTop: '1px solid rgba(255,255,255,0.05)', background: '#0a0a0c' }}>
        <button 
          onClick={() => onBookNow(selectedItem)}
          style={{ 
            width: '100%', padding: '16px', background: 'var(--gold)', color: '#000', 
            border: 'none', borderRadius: '30px', fontSize: '16px', fontWeight: 800, 
            cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' 
          }}
        >
          <i className="fa-solid fa-bolt"></i> Book Now
        </button>
      </div>
    </div>
  );
};

export default DetailPanel;
