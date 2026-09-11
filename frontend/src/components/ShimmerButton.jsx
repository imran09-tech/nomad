import { motion } from 'framer-motion';

export default function ShimmerButton({ children, onClick, className = '', disabled = false }) {
  return (
    <motion.button
      whileTap={!disabled ? { scale: 0.96 } : {}}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`
        relative px-8 py-4 rounded-xl font-extrabold text-sm tracking-wide text-black
        bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 
        bg-[length:200%_auto] hover:bg-right transition-all duration-1000
        shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)]
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {children}
    </motion.button>
  );
}
