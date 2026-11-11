'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Poi } from '@/types';
import {
  MapPin,
  Layers,
  Maximize2,
  Navigation,
  Compass,
  Footprints,
  Eye,
  Info,
} from 'lucide-react';

export interface TourWaypointItem {
  poi: Poi;
  orderIndex: number;
}

interface TourOsmMapProps {
  waypoints: TourWaypointItem[];
  selectedPoiId?: number | null;
  onSelectWaypoint?: (poiId: number) => void;
  height?: string;
  className?: string;
  interactive?: boolean;
}

type TileLayerType = 'streets' | 'dark' | 'satellite';

export default function TourOsmMap({
  waypoints,
  selectedPoiId,
  onSelectWaypoint,
  height = '360px',
  className = '',
  interactive = true,
}: TourOsmMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layersGroupRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersRef = useRef<Record<number, any>>({});

  const [activeLayerType, setActiveLayerType] = useState<TileLayerType>('streets');
  const [showGeofences, setShowGeofences] = useState(true);
  const [totalDistanceMeters, setTotalDistanceMeters] = useState<number>(0);

  // Auto-detect dark mode from DOM / OS
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isDark =
      document.documentElement.classList.contains('dark') ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDark) {
      setActiveLayerType('dark');
    }
  }, []);

  // Tile layer URLs (100% Free & Open-Source)
  const TILE_SERVERS: Record<TileLayerType, { url: string; attribution: string; subdomains?: string[] }> = {
    streets: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
      subdomains: ['a', 'b', 'c'],
    },
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: ['a', 'b', 'c', 'd'],
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    },
  };

  // Helper: Haversine distance calculation between waypoints in meters
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3;
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let isMounted = true;

    async function initMap() {
      const L = (await import('leaflet')).default;

      if (!isMounted || !mapContainerRef.current) return;

      // Clean existing instance if any
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Default center: District 4, HCMC (Bến Nhà Rồng / Khánh Hội area)
      const defaultCenter: [number, number] = [10.7628, 106.7042];
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
      });

      // Add Zoom Control at bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Attribution Control compact at bottom left
      L.control.attribution({ position: 'bottomleft', prefix: false }).addTo(map);

      // Add Tile Layer
      const cfg = TILE_SERVERS[activeLayerType];
      const tileLayer = L.tileLayer(cfg.url, {
        attribution: cfg.attribution,
        subdomains: cfg.subdomains || 'abc',
        maxZoom: 19,
      }).addTo(map);

      tileLayerRef.current = tileLayer;

      // Group for markers, polylines, and circles
      const layersGroup = L.featureGroup().addTo(map);
      layersGroupRef.current = layersGroup;

      mapInstanceRef.current = map;

      // Trigger map resize check
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 200);
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer when layer type changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    async function updateTileLayer() {
      const L = (await import('leaflet')).default;
      if (tileLayerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(tileLayerRef.current);
      }
      const cfg = TILE_SERVERS[activeLayerType];
      const newLayer = L.tileLayer(cfg.url, {
        attribution: cfg.attribution,
        subdomains: cfg.subdomains || 'abc',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);

      tileLayerRef.current = newLayer;
    }

    updateTileLayer();
  }, [activeLayerType]);

  // Update Waypoint Markers, Polyline, and Geofence Circles
  useEffect(() => {
    if (!mapInstanceRef.current || !layersGroupRef.current) return;

    let isCancelled = false;

    async function renderWaypoints() {
      const L = (await import('leaflet')).default;
      if (isCancelled || !mapInstanceRef.current || !layersGroupRef.current) return;

      const group = layersGroupRef.current;
      group.clearLayers();
      markersRef.current = {};

      if (!waypoints || waypoints.length === 0) {
        // District 4 default view
        mapInstanceRef.current.setView([10.7628, 106.7042], 15);
        setTotalDistanceMeters(0);
        return;
      }

      // Sort waypoints by orderIndex
      const sorted = [...waypoints].sort((a, b) => a.orderIndex - b.orderIndex);
      const effectiveActiveId =
        selectedPoiId !== undefined && selectedPoiId !== null
          ? selectedPoiId
          : (sorted[0]?.poi.id || null);

      const latlngs: [number, number][] = [];
      let totalDist = 0;

      sorted.forEach((item, idx) => {
        const { poi, orderIndex } = item;
        const lat = poi.latitude;
        const lng = poi.longitude;
        latlngs.push([lat, lng]);

        if (idx > 0) {
          const prev = sorted[idx - 1].poi;
          totalDist += calculateDistance(prev.latitude, prev.longitude, lat, lng);
        }

        const isSelected = effectiveActiveId === poi.id;
        const displayIndex = idx + 1; // 1-based order

        // 1. Geofence Radius Circle (Translucent boundary)
        if (showGeofences) {
          const radius = poi.radiusMeters || 50;
          const circle = L.circle([lat, lng], {
            radius: radius,
            color: isSelected ? '#f59e0b' : '#0284c7',
            fillColor: isSelected ? '#f59e0b' : '#0284c7',
            fillOpacity: isSelected ? 0.25 : 0.12,
            weight: isSelected ? 2.5 : 1.2,
            dashArray: isSelected ? '6, 3' : '4, 4',
          });
          group.addLayer(circle);
        }

        // 2. Custom Numbered Pin DivIcon with animated active beacon
        const iconHtml = isSelected
          ? `
            <div class="relative group cursor-pointer select-none transition-transform duration-300 scale-125 z-50">
              <span class="animate-ping absolute -inset-1 rounded-full bg-amber-400 opacity-75"></span>
              <div class="relative w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-xl border-2 bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 border-white ring-4 ring-amber-400/50">
                ${displayIndex}
              </div>
              <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rotate-45 bg-rose-500"></div>
            </div>
          `
          : `
            <div class="relative group cursor-pointer select-none transition-transform duration-200 hover:scale-110 z-30">
              <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-lg border-2 bg-gradient-to-tr from-emerald-600 to-teal-500 border-white ring-2 ring-emerald-600/30">
                ${displayIndex}
              </div>
              <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rotate-45 bg-teal-500"></div>
            </div>
          `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-tour-pin',
          iconSize: [32, 36],
          iconAnchor: [16, 36],
          popupAnchor: [0, -34],
        });

        // 3. Leaflet Marker
        const marker = L.marker([lat, lng], { icon: customIcon });

        // Popup Content
        const popupContent = `
          <div style="font-family: inherit; min-width: 220px; padding: 4px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <span style="background: ${isSelected ? '#f59e0b' : '#10b981'}; color: white; font-weight: bold; font-size: 11px; padding: 2px 8px; border-radius: 999px;">
                Trạm #${displayIndex} ${isSelected ? '★ Đang chọn' : ''}
              </span>
              <span style="font-family: monospace; font-size: 10px; color: #64748b; font-weight: 600;">
                ${poi.code || ''}
              </span>
            </div>
            <div style="font-weight: bold; font-size: 13px; color: #0f172a; margin-bottom: 4px; line-height: 1.3;">
              ${poi.name}
            </div>
            <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">
              ${poi.ward?.name ? `Phường ${poi.ward.name}` : 'Quận 4'} • Bán kính Geofence: <b>${poi.radiusMeters || 50}m</b>
            </div>
            ${
              poi.busStop?.name
                ? `<div style="font-size: 10px; color: #059669; background: #ecfdf5; padding: 3px 6px; border-radius: 4px; margin-bottom: 6px;">
                    🚌 Trạm buýt: ${poi.busStop.name}
                   </div>`
                : ''
            }
            <div style="font-family: monospace; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 4px;">
              Tọa độ GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, {
          closeButton: true,
          offset: [0, -10],
          autoPan: true,
        });

        if (onSelectWaypoint) {
          marker.on('click', () => {
            onSelectWaypoint(poi.id);
          });
        }

        group.addLayer(marker);
        markersRef.current[poi.id] = marker;
      });

      // 4. Connecting Polyline between sequential waypoints
      if (latlngs.length > 1) {
        // Background glow casing line
        const casingLine = L.polyline(latlngs, {
          color: '#ffffff',
          weight: 7,
          opacity: 0.5,
          lineCap: 'round',
          lineJoin: 'round',
        });
        group.addLayer(casingLine);

        // Main colored walking polyline
        const routeLine = L.polyline(latlngs, {
          color: '#059669',
          weight: 4,
          opacity: 0.9,
          dashArray: '8, 6',
          lineCap: 'round',
          lineJoin: 'round',
        });
        group.addLayer(routeLine);
      }

      setTotalDistanceMeters(Math.round(totalDist));

      // 5. Fit bounds to contain all tour waypoints
      if (latlngs.length > 0) {
        const bounds = L.latLngBounds(latlngs);
        mapInstanceRef.current.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 16,
        });
      }

      // 6. Automatically open popup for the active POI
      if (effectiveActiveId && markersRef.current[effectiveActiveId]) {
        const activeMarker = markersRef.current[effectiveActiveId];
        setTimeout(() => {
          if (activeMarker && mapInstanceRef.current) {
            activeMarker.openPopup();
          }
        }, 350);
      }
    }

    renderWaypoints();

    return () => {
      isCancelled = true;
    };
  }, [waypoints, selectedPoiId, showGeofences]);

  // Smoothly pan & open popup when selectedPoiId changes dynamically
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedPoiId) return;
    const targetMarker = markersRef.current[selectedPoiId];
    if (targetMarker) {
      mapInstanceRef.current.panTo(targetMarker.getLatLng(), {
        animate: true,
        duration: 0.5,
      });
      setTimeout(() => {
        targetMarker.openPopup();
      }, 250);
    }
  }, [selectedPoiId]);

  // Recenter / Fit All button handler
  const handleFitAll = async () => {
    if (!mapInstanceRef.current || !layersGroupRef.current) return;
    const L = (await import('leaflet')).default;

    const latlngs = waypoints.map((w) => [w.poi.latitude, w.poi.longitude] as [number, number]);
    if (latlngs.length > 0) {
      const bounds = L.latLngBounds(latlngs);
      mapInstanceRef.current.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 16,
      });
    } else {
      mapInstanceRef.current.setView([10.7628, 106.7042], 15);
    }
  };

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md ${className}`}
      style={{ height }}
    >
      {/* Leaflet Map Div */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Floating Controls Bar */}
      <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none z-10 gap-2">
        {/* Left: Tour Route Metrics Badge */}
        <div className="flex items-center gap-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-md pointer-events-auto text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100">
            <Footprints className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{waypoints.length} điểm dừng</span>
          </div>

          {totalDistanceMeters > 0 && (
            <>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="text-slate-600 dark:text-slate-300 font-semibold">
                ~{(totalDistanceMeters / 1000).toFixed(2)} km
              </span>
            </>
          )}

          <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-mono text-[10px] font-bold">
            OSM Live
          </span>
        </div>

        {/* Right: Map Controls (Layers + Geofence Toggle + Fit View) */}
        <div className="flex items-center gap-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-md pointer-events-auto">
          {/* Tile Layer Selector */}
          <button
            type="button"
            onClick={() => setActiveLayerType('streets')}
            className={`px-2 py-1 rounded-lg text-[11px] font-medium transition ${
              activeLayerType === 'streets'
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Bản đồ đường phố OpenStreetMap"
          >
            Đường phố
          </button>

          <button
            type="button"
            onClick={() => setActiveLayerType('dark')}
            className={`px-2 py-1 rounded-lg text-[11px] font-medium transition ${
              activeLayerType === 'dark'
                ? 'bg-slate-800 text-indigo-300 font-bold shadow-xs border border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Bản đồ ban đêm CartoDB Dark"
          >
            Tối
          </button>

          <button
            type="button"
            onClick={() => setActiveLayerType('satellite')}
            className={`px-2 py-1 rounded-lg text-[11px] font-medium transition ${
              activeLayerType === 'satellite'
                ? 'bg-sky-600 text-white font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Ảnh vệ tinh Esri Imagery"
          >
            Vệ tinh
          </button>

          <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-0.5" />

          {/* Toggle Geofence Circles */}
          <button
            type="button"
            onClick={() => setShowGeofences(!showGeofences)}
            className={`p-1.5 rounded-lg text-xs transition ${
              showGeofences
                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
            title={showGeofences ? 'Ẩn bán kính Geofence' : 'Hiện bán kính Geofence'}
          >
            <Compass className="w-3.5 h-3.5" />
          </button>

          {/* Fit all waypoints */}
          <button
            type="button"
            onClick={handleFitAll}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Căn giữa toàn bộ lộ trình"
          >
            <Navigation className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Hint Bar */}
      <div className="absolute bottom-2 left-3 pointer-events-none z-10 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-[10px] font-medium">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span>Click vào trạm để xem thông tin chi tiết & bán kính Geofence</span>
      </div>
    </div>
  );
}
