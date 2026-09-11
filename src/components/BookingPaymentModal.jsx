import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Loader2 } from 'lucide-react';

export default function BookingPaymentModal({ isOpen, onClose, itemName, totalPrice }) {
  const [utr, setUtr] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setUtr('');
      setStatus('idle');
      setErrorMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^\d{12}$/.test(utr)) {
      setErrorMessage("Please enter a valid 12-digit UTR number.");
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      // Direct transfer backend call
      const response = await fetch('/api/bookings/direct-transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          itemName: itemName,
          totalPrice: totalPrice,
          utr: utr,
          // Sending basic required defaults for the backend schema
          guests: 1,
          guestName: 'Anonymous Traveler',
          guestEmail: 'traveler@nomad.com',
        })
      });

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.error || 'Failed to submit booking');

      setStatus('success');
      
      // Auto close after success
      setTimeout(() => {
        onClose();
      }, 3500);

    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMessage(err.message || 'Payment submission failed. Please try again.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-[#090d16] border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden"
          >
            {/* Ambient glows inside modal */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none" />

            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {status === 'success' ? (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="py-12 text-center"
              >
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-500/20 text-emerald-400 mb-6 border border-emerald-500/30">
                  <CheckCircle className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight mb-2">Payment Secured!</h3>
                <p className="text-slate-400 mb-1">Your UTR <span className="text-emerald-400 font-bold">{utr}</span> has been captured.</p>
                <p className="text-xs text-slate-500 font-mono tracking-widest uppercase mt-4">Redirecting...</p>
              </motion.div>
            ) : (
              <div>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-black tracking-tight text-white mb-2">Secure Reservation</h2>
                  <p className="text-slate-400 text-sm">
                    Paying for: <span className="font-bold text-white block mt-1">{itemName}</span>
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl mx-auto w-48 h-48 flex items-center justify-center mb-6 shadow-lg shadow-white/5">
                  <img 
                    src="/qr_code.jpg" 
                    onError={(e) => { e.target.src = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=NomadPaymentGateway' }}
                    alt="Payment QR Code" 
                    className="w-full h-full object-contain"
                  />
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-[10px] text-slate-400 font-mono font-bold tracking-widest uppercase block mb-2">
                      Enter UTR Number (12 Digits)
                    </label>
                    <input 
                      type="text" 
                      value={utr}
                      onChange={(e) => setUtr(e.target.value.replace(/\D/g, '').slice(0, 12))}
                      placeholder="e.g. 123456789012"
                      required
                      className="w-full h-14 px-4 rounded-xl border border-slate-800 bg-[#05080f] shadow-inner text-white focus:outline-none focus:border-emerald-500/80 focus:ring-4 focus:ring-emerald-500/10 transition-all font-mono tracking-wider"
                    />
                  </div>

                  {errorMessage && (
                    <div className="text-rose-500 text-xs font-medium px-2 bg-rose-500/10 py-2 rounded-md border border-rose-500/20">
                      {errorMessage}
                    </div>
                  )}

                  <div className="pt-2">
                    <button 
                      type="submit" 
                      disabled={status === 'loading'}
                      className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-400 p-[1px]"
                    >
                      <div className="w-full h-14 bg-slate-900 rounded-[11px] flex items-center justify-center transition-all group-hover:bg-slate-900/50">
                        {status === 'loading' ? (
                          <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                        ) : (
                          <span className="font-bold tracking-wide text-white">Submit Payment Info</span>
                        )}
                      </div>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
