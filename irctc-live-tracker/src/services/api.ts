import axios from 'axios';
import { LiveStationResponse } from '@/types';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

export const fetchLiveStation = async (stationCode: string, hours: string = '4'): Promise<LiveStationResponse> => {
  const { data } = await apiClient.get<LiveStationResponse>('/live-station', {
    params: { stationCode, hours }
  });
  return data;
};
