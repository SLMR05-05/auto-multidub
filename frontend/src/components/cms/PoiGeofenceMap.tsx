'use client';

import { useEffect, useRef, useState } from 'react';
import type * as Leaflet from 'leaflet';
import type { CmsGeofence } from '@/services/cmsPois';
import { overlappingPois } from '@/utils/poiEditor';
import 'leaflet/dist/leaflet.css';

interface Props {
  id?: number;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  neighbors: CmsGeofence[];
  disabled: boolean;
  onChange: (latitude: number, longitude: number) => void;
}

export default function PoiGeofenceMap(props: Props) {
  const container = useRef<HTMLDivElement>(null);
  const latest = useRef(props);
  latest.current = props;
  const instance = useRef<{
    L: typeof Leaflet; map: Leaflet.Map; marker: Leaflet.Marker;
    circle: Leaflet.Circle; neighbors: Leaflet.LayerGroup;
  } | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    import('leaflet').then((L) => {
      if (cancelled || !container.current) return;
      const value = latest.current;
      const center: Leaflet.LatLngTuple = [value.latitude, value.longitude];
      const map = L.map(container.current).setView(center, 17);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map).on('tileerror', () => setError('Không tải được bản đồ nền. Bạn vẫn có thể nhập tọa độ.'));
      const marker = L.marker(center, {
        draggable: !value.disabled,
        icon: L.divIcon({
          className: '', iconSize: [24, 24], iconAnchor: [12, 12],
          html: '<span style="display:block;width:24px;height:24px;border:3px solid white;border-radius:50%;background:#059669;box-shadow:0 1px 6px #0008"></span>',
        }),
      }).addTo(map).bindTooltip('Kéo để chọn vị trí POI');
      const circle = L.circle(center, { radius: value.radiusMeters, color: '#059669', fillOpacity: 0.16 }).addTo(map);
      const select = (latlng: Leaflet.LatLng) => {
        if (!latest.current.disabled) {
          latest.current.onChange(Number(latlng.lat.toFixed(7)), Number(latlng.wrap().lng.toFixed(7)));
        }
      };
      map.on('click', (event: Leaflet.LeafletMouseEvent) => select(event.latlng));
      marker.on('dragend', () => select(marker.getLatLng()));
      instance.current = { L, map, marker, circle, neighbors: L.layerGroup().addTo(map) };
      setReady(true);
    }).catch(() => {
      if (!cancelled) setError('Không khởi tạo được bản đồ. Hãy nhập tọa độ thủ công.');
    });
    return () => {
      cancelled = true;
      instance.current?.map.remove();
      instance.current = null;
    };
  }, []);

  useEffect(() => {
    const view = instance.current;
    if (!ready || !view) return;
    const { latitude, longitude, radiusMeters, neighbors, id, disabled } = props;
    const center: Leaflet.LatLngTuple = [latitude, longitude];
    view.marker.setLatLng(center);
    if (disabled) view.marker.dragging?.disable();
    else view.marker.dragging?.enable();
    view.circle.setLatLng(center).setRadius(radiusMeters);
    view.map.panTo(center, { animate: false });
    view.neighbors.clearLayers();
    const overlaps = new Set(overlappingPois(props, neighbors, id).map((poi) => poi.id));
    for (const poi of neighbors.filter((poi) => poi.id !== id && poi.status !== 'ARCHIVED')) {
      const label = document.createElement('span');
      label.textContent = `${poi.name} · ${poi.radiusMeters} m · ưu tiên ${poi.priority}`;
      view.L.circle([poi.latitude, poi.longitude], {
        radius: poi.radiusMeters, color: overlaps.has(poi.id) ? '#d97706' : '#64748b',
        fillOpacity: 0.06, weight: 1,
      }).bindTooltip(label).addTo(view.neighbors);
    }
  }, [ready, props]);

  return (
    <div className="space-y-2">
      <div ref={container} role="region" aria-label="Bản đồ chọn vị trí POI"
        style={{ height: '24rem', width: '100%' }} className="relative z-0 rounded-xl" />
      {error && <p role="alert" className="text-xs text-amber-800">{error}</p>}
      <p className="text-xs text-slate-500">Click bản đồ hoặc kéo điểm xanh. Vùng màu cam là Geofence chồng lấn.</p>
    </div>
  );
}
