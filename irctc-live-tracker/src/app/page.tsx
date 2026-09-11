'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchLiveStation } from '@/services/api';
import { HeroSearch } from '@/components/HeroSearch';
import { DashboardStats } from '@/components/DashboardStats';
import { TrainList } from '@/components/TrainList';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function HomePage() {
  const [stationCode, setStationCode] = useState<string>('');
  const [hours, setHours] = useState<string>('4');

  const { data, isLoading, error, isError } = useQuery({
    queryKey: ['live-station', stationCode, hours],
    queryFn: () => fetchLiveStation(stationCode, hours),
    enabled: !!stationCode,
    retry: 1,
  });

  if (isError && error) {
    // Show error toast once
    toast.error('Failed to fetch station data', {
      description: (error as Error).message || 'An error occurred'
    });
  }

  const handleSearch = (code: string, hrs: string) => {
    setStationCode(code);
    setHours(hrs);
  };

  return (
    <main className="flex-1 flex flex-col items-center bg-zinc-950 min-h-screen">
      <HeroSearch onSearch={handleSearch} isLoading={isLoading} />
      
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 py-12 flex flex-col items-center gap-8">
        
        {!stationCode && !isLoading && (
          <div className="text-zinc-500 text-center py-20">
            Search for a station to view live train data.
          </div>
        )}

        {isLoading && (
          <div className="w-full space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl bg-zinc-900" />)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-48 w-full rounded-2xl bg-zinc-900" />)}
            </div>
          </div>
        )}

        {isError && (
          <div className="w-full p-8 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-center">
             <h3 className="text-xl font-bold mb-2">Error loading data</h3>
             <p>{(error as Error).message || 'Please check your connection and try again.'}</p>
          </div>
        )}

        {data && data.success && !isLoading && (
          <>
            <div className="w-full flex justify-between items-end mb-2">
               <div>
                  <h2 className="text-3xl font-bold text-zinc-100">{data.stationName} <span className="text-zinc-500">({data.stationCode})</span></h2>
                  <p className="text-zinc-400 mt-1">Live tracking for the next {hours} hours</p>
               </div>
            </div>
            <DashboardStats data={data} />
            <TrainList trains={data.trains} />
          </>
        )}

      </div>
    </main>
  );
}
