'use client';

import { motion } from 'framer-motion';
import { LiveStationResponse } from '@/types';
import { Activity, AlertTriangle, CheckCircle2, ArrowRightLeft } from 'lucide-react';

interface DashboardStatsProps {
  data: LiveStationResponse;
}

export function DashboardStats({ data }: DashboardStatsProps) {
  const stats = [
    {
      title: 'Total Trains',
      value: data.totalTrains,
      icon: <Activity className="w-5 h-5 text-blue-500" />,
      color: 'border-blue-500/20 bg-blue-500/5',
    },
    {
      title: 'On Time',
      value: data.onTimeTrains,
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
      color: 'border-emerald-500/20 bg-emerald-500/5',
    },
    {
      title: 'Delayed',
      value: data.delayedTrains,
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
      color: 'border-amber-500/20 bg-amber-500/5',
    },
    {
      title: 'Activity',
      value: `${data.arrivingSoon} In / ${data.departingSoon} Out`,
      icon: <ArrowRightLeft className="w-5 h-5 text-purple-500" />,
      color: 'border-purple-500/20 bg-purple-500/5',
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
      {stats.map((s, i) => (
        <motion.div
          key={s.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className={`p-5 rounded-2xl border ${s.color} backdrop-blur-sm flex flex-col gap-3`}
        >
          <div className="flex items-center gap-2 text-zinc-400 font-medium">
            {s.icon}
            <span className="text-sm">{s.title}</span>
          </div>
          <div className="text-3xl font-bold text-zinc-100">
            {s.value}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
