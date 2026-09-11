'use client';

import { useState } from 'react';
import { CleanTrainData } from '@/types';
import { TrainCard } from './TrainCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter } from 'lucide-react';

interface TrainListProps {
  trains: CleanTrainData[];
}

export function TrainList({ trains }: TrainListProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('time');

  let filtered = trains;
  if (filterStatus !== 'all') {
    filtered = trains.filter(t => t.status === filterStatus);
  }

  // Simple sorting logic
  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'time') {
      // Sort by arrival/departure time gracefully when arrival is N/A
      const timeA = a.arrival !== 'N/A' ? a.arrival : (a.departure !== 'N/A' ? a.departure : '');
      const timeB = b.arrival !== 'N/A' ? b.arrival : (b.departure !== 'N/A' ? b.departure : '');
      if (timeA === '') return 1;
      if (timeB === '') return -1;
      return timeA.localeCompare(timeB);
    } else if (sortBy === 'delay') {
      return b.delayMinutes - a.delayMinutes;
    }
    return 0;
  });

  return (
    <div className="w-full mt-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-zinc-100">Live Trains</h2>
        <div className="flex gap-3 w-full sm:w-auto">
          <Select value={filterStatus} onValueChange={(val) => setFilterStatus(val || 'all')}>
            <SelectTrigger className="w-[140px] bg-zinc-900 border-zinc-800">
              <Filter className="w-4 h-4 mr-2 text-zinc-400" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="On Time">On Time</SelectItem>
              <SelectItem value="Minor Delay">Minor Delay</SelectItem>
              <SelectItem value="Major Delay">Major Delay</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(val) => setSortBy(val || 'time')}>
            <SelectTrigger className="w-[140px] bg-zinc-900 border-zinc-800">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="time">Arrival Time</SelectItem>
              <SelectItem value="delay">Most Delayed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="w-full py-20 text-center text-zinc-500 bg-zinc-900/20 rounded-2xl border border-zinc-800 border-dashed">
          No trains found matching the current filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((train, idx) => (
            <TrainCard key={`${train.trainNumber}-${idx}`} train={train} index={idx} />
          ))}
        </div>
      )}
    </div>
  );
}
