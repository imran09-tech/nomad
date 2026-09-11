import { motion } from 'framer-motion';

export default function AnimatedWorldMap() {
  const routes = [
    { id: 1, path: 'M 200 150 Q 400 50 600 200', delay: 0 },
    { id: 2, path: 'M 600 200 Q 700 300 800 150', delay: 1.5 },
    { id: 3, path: 'M 200 150 Q 300 300 450 250', delay: 0.8 },
    { id: 4, path: 'M 450 250 Q 650 400 800 150', delay: 2.2 },
  ];

  const nodes = [
    { cx: 200, cy: 150, label: 'JFK' },
    { cx: 600, cy: 200, label: 'DXB' },
    { cx: 800, cy: 150, label: 'NRT' },
    { cx: 450, cy: 250, label: 'LHR' },
  ];

  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-40 overflow-hidden flex items-center justify-center mix-blend-screen">
      <svg viewBox="0 0 1000 500" className="w-full max-w-[1400px] h-auto stroke-slate-800">
        {/* Abstract Map Dots (Mocking Continents) */}
        <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" className="fill-slate-700/30" />
        </pattern>
        <rect x="0" y="0" width="1000" height="500" fill="url(#dots)" />

        {/* Flight Paths */}
        {routes.map((route) => (
          <g key={`route-${route.id}`}>
            {/* Background Path */}
            <path
              d={route.path}
              fill="none"
              strokeWidth="1"
              strokeDasharray="4 4"
              className="stroke-slate-700/50"
            />
            {/* Animated Glow Tracer */}
            <motion.path
              d={route.path}
              fill="none"
              strokeWidth="2"
              className="stroke-amber-400"
              style={{ filter: 'drop-shadow(0 0 8px rgba(245,158,11,0.8))' }}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: [0, 1, 1], opacity: [0, 1, 0] }}
              transition={{
                duration: 4,
                delay: route.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </g>
        ))}

        {/* Hub Nodes */}
        {nodes.map((node, i) => (
          <g key={`node-${i}`}>
            <circle
              cx={node.cx}
              cy={node.cy}
              r="4"
              className="fill-[#080c14] stroke-amber-500 stroke-2"
            />
            <motion.circle
              cx={node.cx}
              cy={node.cy}
              r="12"
              className="fill-amber-500/20"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
            />
            <text
              x={node.cx}
              y={node.cy - 12}
              className="fill-slate-400 text-[10px] font-mono tracking-widest uppercase text-anchor-middle"
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
