'use client';

import { motion } from 'framer-motion';
import { CleanTrainData } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Train } from 'lucide-react';

interface TrainCardProps {
  train: CleanTrainData;
  index: number;
}

export function TrainCard({ train, index }: TrainCardProps) {
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'On Time': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'Minor Delay': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'Major Delay': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.5) }}
    >
      <Card className="bg-zinc-900/50 border-zinc-800/80 backdrop-blur-sm overflow-hidden hover:bg-zinc-800/50 transition-colors">
        <CardContent className="p-5 flex flex-col gap-4">
          
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Train className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-100 flex items-center gap-2">
                  {train.trainName}
                </h3>
                <p className="text-sm text-zinc-400 font-mono">{train.trainNumber}</p>
              </div>
            </div>
            <Badge variant="outline" className={getStatusColor(train.status)}>
              {train.status}
              {train.delayMinutes > 0 && ` (${train.delayMinutes}m)`}
            </Badge>
          </div>

          <div className="h-px w-full bg-zinc-800/50" />

          {/* Times */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <div className="text-xs text-zinc-500 font-medium uppercase flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Source
              </div>
              <div className="text-sm font-semibold text-zinc-300">{train.source}</div>
              <div className="text-sm text-zinc-400 font-mono mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {train.arrival}
              </div>
            </div>
            
            <div className="flex flex-col gap-1">
              <div className="text-xs text-zinc-500 font-medium uppercase flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Dest
              </div>
              <div className="text-sm font-semibold text-zinc-300">{train.destination}</div>
              <div className="text-sm text-zinc-400 font-mono mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {train.departure}
              </div>
            </div>
          </div>

          <div className="mt-2 text-xs font-medium text-zinc-500 bg-zinc-950/50 px-3 py-1.5 rounded-md w-fit">
            Platform: <span className="text-zinc-300">{train.platform}</span>
          </div>

        </CardContent>
      </Card>
    </motion.div>
  );
}
