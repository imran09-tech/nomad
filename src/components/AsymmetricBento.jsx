import { motion } from 'framer-motion';

export function AsymmetricBento({ children, className = '' }) {
  return <div className={`grid grid-cols-1 md:grid-cols-12 gap-8 ${className}`}>{children}</div>;
}

export function AsymmetricBentoItem({
  children,
  colSpan = 1,
  rowSpan = 1,
  className = '',
  hoverEffect = true,
}) {
  const spanClasses = {
    1: 'md:col-span-1',
    2: 'md:col-span-2',
    3: 'md:col-span-3',
    4: 'md:col-span-4',
    5: 'md:col-span-5',
    6: 'md:col-span-6',
    7: 'md:col-span-7',
    8: 'md:col-span-8',
    9: 'md:col-span-9',
    10: 'md:col-span-10',
    11: 'md:col-span-11',
    12: 'md:col-span-12',
  };

  const rowClasses = {
    1: 'md:row-span-1',
    2: 'md:row-span-2',
  };

  return (
    <motion.div
      whileHover={hoverEffect ? { y: -4 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`
        relative rounded-3xl overflow-hidden bg-[#111625]/60 backdrop-blur-2xl border border-slate-800/40 
        shadow-2xl transition-colors duration-500 hover:border-slate-700/80 hover:bg-[#111625]/80
        ${spanClasses[colSpan] || spanClasses[1]}
        ${rowClasses[rowSpan] || rowClasses[1]}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
