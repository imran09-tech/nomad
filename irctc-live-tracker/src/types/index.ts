export interface Train {
  train_number: string;
  train_name: string;
  source: string;
  destination: string;
  scheduled_arrival: string;
  scheduled_departure: string;
  platform_number: string;
  delay_at_source: string;
}

export interface IRCTCResponse {
  status: boolean;
  message: string;
  timestamp: number;
  data: {
    station_name: string;
    station_code: string;
    trains: Train[];
  };
}

export interface CleanTrainData {
  trainNumber: string;
  trainName: string;
  source: string;
  destination: string;
  arrival: string;
  departure: string;
  platform: string;
  delayMinutes: number;
  status: 'On Time' | 'Minor Delay' | 'Major Delay';
}

export interface LiveStationResponse {
  success: boolean;
  stationCode: string;
  stationName: string;
  trains: CleanTrainData[];
  totalTrains: number;
  arrivingSoon: number;
  departingSoon: number;
  delayedTrains: number;
  onTimeTrains: number;
  error?: string;
}
