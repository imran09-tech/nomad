export default function NeonBadge({ children, variant = 'emerald', className = '' }) {
  const variants = {
    emerald:
      'text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]',
    amber:
      'text-amber-400 bg-amber-950/40 border border-amber-900/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]',
    blue: 'text-blue-400 bg-blue-950/40 border border-blue-900/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]',
    red: 'text-red-400 bg-red-950/40 border border-red-900/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]',
  };

  const selectedVariant = variants[variant] || variants.emerald;

  return (
    <span
      className={`px-2 py-1 rounded-md text-[10px] tracking-wider uppercase font-bold ${selectedVariant} ${className}`}
    >
      {children}
    </span>
  );
}
