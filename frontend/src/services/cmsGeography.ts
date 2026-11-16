import type { Ward, BusStop } from '@/types';
import { requestCms } from './cms';

interface WardResponse { id: number; code: string; name: string; district: string }
interface BusStopResponse {
  id: number; code: string; name: string; wardId: number | null;
  wardName: string | null; latitude: number; longitude: number; note: string | null;
}

export interface BusStopInput {
  code: string; name: string; wardId: number | null;
  latitude: number; longitude: number; address: string;
}

function adaptWard(response: WardResponse): Ward {
  return { id: response.id, name: response.name, district: response.district || '', city: 'Thành phố Hồ Chí Minh' };
}

function adaptBusStop(response: BusStopResponse): BusStop {
  return {
    id: response.id, code: response.code, name: response.name,
    wardId: response.wardId ?? undefined, latitude: response.latitude,
    longitude: response.longitude, address: response.note ?? '',
    isActive: true,
  };
}

export function listCmsWards(signal?: AbortSignal) {
  return requestCms<WardResponse[]>('/wards', { signal }).then((items) => items.map(adaptWard));
}

export function listCmsBusStops(wardId?: number | 'ALL', signal?: AbortSignal) {
  const query = wardId && wardId !== 'ALL' ? `?wardId=${wardId}` : '';
  return requestCms<BusStopResponse[]>(`/bus-stops${query}`, { signal }).then((items) => items.map(adaptBusStop));
}

export function createCmsBusStop(input: BusStopInput) {
  return requestCms<BusStopResponse>('/bus-stops', {
    method: 'POST',
    body: JSON.stringify({
      code: input.code, name: input.name, wardId: input.wardId,
      latitude: input.latitude, longitude: input.longitude, note: input.address,
    }),
  }).then(adaptBusStop);
}

export function updateCmsBusStop(id: number, input: BusStopInput) {
  return requestCms<BusStopResponse>(`/bus-stops/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      code: input.code, name: input.name, wardId: input.wardId,
      latitude: input.latitude, longitude: input.longitude, note: input.address,
    }),
  }).then(adaptBusStop);
}

export function deleteCmsBusStop(id: number) {
  return requestCms<{ message: string }>(`/bus-stops/${id}`, { method: 'DELETE' });
}