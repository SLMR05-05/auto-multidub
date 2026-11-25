'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Poi } from '@/types';
import {
  MapPin,
  Navigation,
  Compass,
  Layers,
  Volume2,
  Info,
  AlertCircle,
  VolumeX,
} from 'lucide-react';
import Link from 'next/link';

export interface VisitorLeafletMapProps {
  pois: Poi[];
  selectedPoi: Poi | null;
  onSelectPoi: (poi: Poi) => void;
  onPlayPoi: (poi: Poi) => void;
  userLocation: { lat: number; lng: number; accuracy?: number } | null;
  gpsStatus: 'INITIALIZING' | 'ACTIVE' | 'DENIED' | 'UNAVAILABLE' | 'TIMEOUT';
  gpsAccuracy?: number;
  onRecenter: () => void;
  audioUnlocked: boolean;
  onUnlockAudio: () => void;
}

type TileLayerType = 'streets' | 'dark' | 'satellite';

const TILE_SERVERS: Record<
  TileLayerType,
  { url: string; attribution: string; subdomains?: string[]; maxZoom?: number }
> = {
  streets: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
    subdomains: ['a', 'b', 'c'],
    maxZoom: 19,
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: ['a', 'b', 'c', 'd'],
    maxZoom: 19,
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution:
      'Tiles &copy; Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and GIS User Community',
    maxZoom: 19,
  },
};

export default function VisitorLeafletMap({
  pois,
  selectedPoi,
  onSelectPoi,
  onPlayPoi,
  userLocation,
  gpsStatus,
  gpsAccuracy,
  onRecenter,
  audioUnlocked,
  onUnlockAudio,
}: VisitorLeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersRef = useRef<Map<number, any>>(new Map());
  const circlesRef = useRef<Map<number, any>>(new Map());
  const userMarkerRef = useRef<any>(null);
  const accuracyCircleRef = useRef<any>(null);

  const [activeLayer, setActiveLayer] = useState<TileLayerType>('streets');
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // Initialize Map
  useEffect(() => {
    let isMounted = true;
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current || mapInstanceRef.current) return;

      // Fix default marker icon assets for Leaflet in Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Default center: District 4, HCMC (10.764, 106.703)
      const initialLat = userLocation?.lat ?? 10.764;
      const initialLng = userLocation?.lng ?? 106.703;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 16,
        zoomControl: false,
      });

      // Add zoom control top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Add Tile Layer
      const cfg = TILE_SERVERS[activeLayer];
      const tile = L.tileLayer(cfg.url, {
        attribution: cfg.attribution,
        subdomains: cfg.subdomains || 'abc',
        maxZoom: cfg.maxZoom || 19,
      }).addTo(map);

      tileLayerRef.current = tile;
      mapInstanceRef.current = map;
      setMapReady(true);

      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 100);
    });

    return () => {
      isMounted = false;
      setMapReady(false);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Switch Tile Layer
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    import('leaflet').then((L) => {
      if (tileLayerRef.current) {
        mapInstanceRef.current.removeLayer(tileLayerRef.current);
      }
      const cfg = TILE_SERVERS[activeLayer];
      const tile = L.tileLayer(cfg.url, {
        attribution: cfg.attribution,
        subdomains: cfg.subdomains || 'abc',
        maxZoom: cfg.maxZoom || 19,
      }).addTo(mapInstanceRef.current);
      tileLayerRef.current = tile;
    });
  }, [activeLayer]);

  // Log verification table for POIs (Checklist Item 4)
  useEffect(() => {
    if (pois && pois.length > 0) {
      console.table(
        pois.map((poi) => ({
          id: poi.id,
          name: poi.name,
          latitude: poi.latitude,
          longitude: poi.longitude,
          radiusMeters: poi.radiusMeters,
          valid:
            Number.isFinite(poi.latitude) &&
            Number.isFinite(poi.longitude) &&
            poi.latitude >= -90 &&
            poi.latitude <= 90 &&
            poi.longitude >= -180 &&
            poi.longitude <= 180,
          inTargetDistrict4:
            poi.latitude >= 10.75 &&
            poi.latitude <= 10.78 &&
            poi.longitude >= 106.69 &&
            poi.longitude <= 106.72,
        }))
      );
    }
  }, [pois]);

  // Synchronize POI Markers & Geofence Circles
  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady) return;

    import('leaflet').then((L) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      const currentPoiIds = new Set(pois.map((p) => p.id));

      // Remove obsolete markers and circles
      for (const [id, marker] of markersRef.current.entries()) {
        if (!currentPoiIds.has(id)) {
          map.removeLayer(marker);
          markersRef.current.delete(id);
        }
      }
      for (const [id, circle] of circlesRef.current.entries()) {
        if (!currentPoiIds.has(id)) {
          map.removeLayer(circle);
          circlesRef.current.delete(id);
        }
      }

      // Add or update POIs
      for (const poi of pois) {
        const isSelected = selectedPoi?.id === poi.id;
        const radius = poi.radiusMeters || 50;

        // Custom HTML Marker Icon
        const iconHtml = `
          <div class="relative group cursor-pointer flex flex-col items-center">
            <div class="w-8 h-8 rounded-full shadow-lg flex items-center justify-center transition-all ${
              isSelected
                ? 'bg-emerald-500 text-white scale-125 ring-4 ring-emerald-300/60'
                : 'bg-white text-emerald-700 hover:scale-110 border border-emerald-600'
            }">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/>
              </svg>
            </div>
            <div class="mt-1 whitespace-nowrap bg-slate-900/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow pointer-events-none border border-slate-700">
              ${poi.name.split('-')[0].trim()}
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'poi-custom-marker',
          iconSize: [32, 42],
          iconAnchor: [16, 21],
        });

        // 1. Marker
        let marker = markersRef.current.get(poi.id);
        if (!marker) {
          marker = L.marker([poi.latitude, poi.longitude], { icon: customIcon }).addTo(map);
          marker.on('click', () => onSelectPoi(poi));
          markersRef.current.set(poi.id, marker);
        } else {
          marker.setLatLng([poi.latitude, poi.longitude]);
          marker.setIcon(customIcon);
        }

        // 2. Geofence Circle (using actual radiusMeters in meters)
        let circle = circlesRef.current.get(poi.id);
        const circleOptions = {
          radius,
          color: isSelected ? '#10b981' : '#059669',
          fillColor: isSelected ? '#34d399' : '#10b981',
          fillOpacity: isSelected ? 0.25 : 0.12,
          weight: isSelected ? 2.5 : 1.5,
          dashArray: isSelected ? undefined : '4, 4',
        };

        if (!circle) {
          circle = L.circle([poi.latitude, poi.longitude], circleOptions).addTo(map);
          circlesRef.current.set(poi.id, circle);
        } else {
          circle.setLatLng([poi.latitude, poi.longitude]);
          circle.setRadius(radius);
          circle.setStyle(circleOptions);
        }
      }
    });
  }, [pois, selectedPoi, onSelectPoi, mapReady]);

  // Synchronize User Location Marker and Accuracy Circle
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation || !mapReady) return;

    import('leaflet').then((L) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      const userLatLng = [userLocation.lat, userLocation.lng] as [number, number];

      // User Marker
      const userIconHtml = `
        <div class="relative flex items-center justify-center">
          <span class="animate-ping absolute inline-flex h-7 w-7 rounded-full bg-sky-400 opacity-75"></span>
          <div class="w-5 h-5 rounded-full bg-sky-500 border-2 border-white shadow-md flex items-center justify-center">
            <div class="w-2 h-2 rounded-full bg-white"></div>
          </div>
        </div>
      `;

      const userIcon = L.divIcon({
        html: userIconHtml,
        className: 'user-gps-marker',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      if (!userMarkerRef.current) {
        userMarkerRef.current = L.marker(userLatLng, { icon: userIcon, zIndexOffset: 1000 }).addTo(map);
      } else {
        userMarkerRef.current.setLatLng(userLatLng);
        userMarkerRef.current.setIcon(userIcon);
      }

      // Accuracy Circle
      const acc = userLocation.accuracy ?? gpsAccuracy ?? 0;
      if (acc > 0 && acc <= 200) {
        if (!accuracyCircleRef.current) {
          accuracyCircleRef.current = L.circle(userLatLng, {
            radius: acc,
            color: '#38bdf8',
            fillColor: '#38bdf8',
            fillOpacity: 0.1,
            weight: 1,
            interactive: false,
          }).addTo(map);
        } else {
          accuracyCircleRef.current.setLatLng(userLatLng);
          accuracyCircleRef.current.setRadius(acc);
        }
      } else if (accuracyCircleRef.current) {
        map.removeLayer(accuracyCircleRef.current);
        accuracyCircleRef.current = null;
      }
    });
  }, [userLocation, gpsAccuracy, mapReady]);

  // Pan to user location when requested
  const handleRecenter = useCallback(() => {
    if (mapInstanceRef.current && userLocation) {
      mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 17, { duration: 1.2 });
    }
    onRecenter();
  }, [userLocation, onRecenter]);

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] md:h-full bg-slate-900 overflow-hidden select-none">
      {/* Leaflet DOM Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Floating Controls */}
      <div className="absolute top-3 left-3 right-14 z-20 flex items-center justify-between pointer-events-none gap-2">
        {/* GPS Status Badge */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 text-white rounded-xl px-3 py-1.5 shadow pointer-events-auto flex items-center gap-2 text-xs">
          {gpsStatus === 'ACTIVE' && (
            <>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></div>
              <span className="font-medium text-emerald-400">GPS Sẵn sàng</span>
              {gpsAccuracy && (
                <span className="text-[10px] text-slate-300">
                  (±{Math.round(gpsAccuracy)}m)
                </span>
              )}
            </>
          )}
          {gpsStatus === 'INITIALIZING' && (
            <>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></div>
              <span className="font-medium text-amber-300">Đang dò GPS…</span>
            </>
          )}
          {(gpsStatus === 'DENIED' || gpsStatus === 'UNAVAILABLE' || gpsStatus === 'TIMEOUT') && (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span className="font-medium text-rose-300">
                {gpsStatus === 'DENIED' ? 'Chưa cấp quyền GPS' : 'GPS không khả dụng'}
              </span>
            </>
          )}
        </div>

        {/* Audio Autoplay Unlock Badge */}
        {!audioUnlocked && (
          <button
            onClick={onUnlockAudio}
            className="pointer-events-auto bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-all"
            title="Nhấn để cho phép tự động phát âm thanh ngoài thực địa"
          >
            <Volume2 className="w-4 h-4 animate-bounce" />
            <span>Bật tự động phát âm thanh</span>
          </button>
        )}
      </div>

      {/* Layer Switcher & Recenter Controls (Bottom-Right / Floating) */}
      <div className="absolute right-3 bottom-24 md:bottom-6 z-20 flex flex-col gap-2 pointer-events-auto">
        <button
          onClick={handleRecenter}
          className="w-10 h-10 rounded-xl bg-white text-slate-800 shadow-md border border-slate-200 flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all"
          title="Về vị trí của tôi"
        >
          <Navigation className="w-5 h-5 text-emerald-600 fill-emerald-100" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className="w-10 h-10 rounded-xl bg-white text-slate-800 shadow-md border border-slate-200 flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all"
            title="Đổi lớp bản đồ"
          >
            <Layers className="w-5 h-5 text-slate-700" />
          </button>

          {showLayerMenu && (
            <div className="absolute right-12 bottom-0 bg-slate-900 border border-slate-700 text-white rounded-xl shadow-2xl p-2 w-36 flex flex-col gap-1 text-xs">
              <button
                onClick={() => {
                  setActiveLayer('streets');
                  setShowLayerMenu(false);
                }}
                className={`px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                  activeLayer === 'streets'
                    ? 'bg-emerald-600 font-bold text-white'
                    : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                Đường phố (OSM)
              </button>
              <button
                onClick={() => {
                  setActiveLayer('dark');
                  setShowLayerMenu(false);
                }}
                className={`px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                  activeLayer === 'dark'
                    ? 'bg-emerald-600 font-bold text-white'
                    : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                Bản đồ tối (Dark)
              </button>
              <button
                onClick={() => {
                  setActiveLayer('satellite');
                  setShowLayerMenu(false);
                }}
                className={`px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                  activeLayer === 'satellite'
                    ? 'bg-emerald-600 font-bold text-white'
                    : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                Vệ tinh (ArcGIS)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Sheet Modal for Selected POI */}
      {selectedPoi && (
        <div className="md:hidden absolute bottom-4 left-3 right-3 z-30 max-w-md mx-auto bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-start gap-3">
            {selectedPoi.images && selectedPoi.images[0] ? (
              <img
                src={selectedPoi.images[0].imageUrl}
                alt={selectedPoi.name}
                className="w-20 h-20 rounded-xl object-cover shrink-0 shadow-sm"
              />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                <MapPin className="w-8 h-8 text-slate-400" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                  {selectedPoi.ward?.name || 'Quận 4'}
                </span>
                <span className="text-xs text-slate-500">
                  Bán kính: {selectedPoi.radiusMeters || 50}m
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 line-clamp-1 leading-snug">
                {selectedPoi.name}
              </h3>
              <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                {selectedPoi.translations?.[0]?.description || 'Chưa có bài giới thiệu.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => onPlayPoi(selectedPoi)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 text-white font-semibold text-xs shadow hover:bg-emerald-700 active:scale-98 transition-all"
            >
              <Volume2 className="w-4 h-4" />
              Nghe thuyết minh ngay
            </button>

            <Link
              href={`/poi/${selectedPoi.id}`}
              className="flex items-center justify-center gap-1 py-2.5 px-3 rounded-xl bg-slate-100 text-slate-800 font-semibold text-xs hover:bg-slate-200 transition-colors"
            >
              <Info className="w-4 h-4" />
              Chi tiết
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
