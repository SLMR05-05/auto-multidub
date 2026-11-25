'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Navigation,
  Footprints,
  Car,
  Bus,
  MapPin,
  Clock,
  Compass,
  ExternalLink,
  AlertCircle,
  Loader2,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import type { Poi } from '@/types';

interface GoogleDirectionsModalProps {
  poi: Poi;
  isOpen: boolean;
  onClose: () => void;
}

type TravelModeType = 'WALKING' | 'DRIVING' | 'TRANSIT';

export default function GoogleDirectionsModal({
  poi,
  isOpen,
  onClose,
}: GoogleDirectionsModalProps) {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const directionsRendererRef = useRef<any>(null);
  const directionsServiceRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);

  const [travelMode, setTravelMode] = useState<TravelModeType>('WALKING');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [routeInfo, setRouteInfo] = useState<{
    distance: string;
    duration: string;
    steps: { instructions: string; distance: string; duration: string }[];
  } | null>(null);

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  // Get User's Geolocation
  useEffect(() => {
    if (!isOpen) return;

    if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
      setApiKeyMissing(true);
      setLoading(false);
      return;
    }

    setApiKeyMissing(false);
    setLoading(true);
    setErrorMsg(null);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          // Fallback to District 4 center (TP.HCM) if permission denied
          setUserLocation({ lat: 10.7601, lng: 106.7034 });
          setErrorMsg('Không thể định vị GPS chính xác. Đã dùng vị trí mặc định tại Quận 4.');
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setUserLocation({ lat: 10.7601, lng: 106.7034 });
    }
  }, [isOpen, apiKey]);

  // Load Google Maps Script
  useEffect(() => {
    if (!isOpen || !userLocation || apiKeyMissing) return;

    let isCancelled = false;

    const loadScript = () => {
      if (typeof window !== 'undefined' && (window as any).google?.maps) {
        initDirections();
        return;
      }

      const existingScript = document.getElementById('google-maps-sdk');
      if (!existingScript) {
        const script = document.createElement('script');
        script.id = 'google-maps-sdk';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          if (!isCancelled) initDirections();
        };
        script.onerror = () => {
          if (!isCancelled) {
            setErrorMsg('Không thể tải Google Maps API. Vui lòng kiểm tra lại API Key hoặc kết nối mạng.');
            setLoading(false);
          }
        };
        document.head.appendChild(script);
      } else {
        existingScript.addEventListener('load', () => {
          if (!isCancelled) initDirections();
        });
      }
    };

    loadScript();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, userLocation, apiKeyMissing, apiKey]);

  // Initialize Map & Calculate Route
  const initDirections = () => {
    if (!mapElementRef.current || !userLocation) return;
    const google = (window as any).google;
    if (!google?.maps) return;

    try {
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = new google.maps.Map(mapElementRef.current, {
          center: userLocation,
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        directionsServiceRef.current = new google.maps.DirectionsService();
        directionsRendererRef.current = new google.maps.DirectionsRenderer({
          map: mapInstanceRef.current,
          suppressMarkers: false,
          polylineOptions: {
            strokeColor: '#0284c7', // Sky blue
            strokeWeight: 6,
            strokeOpacity: 0.85,
          },
        });
      }

      calculateRoute(travelMode);
    } catch {
      setErrorMsg('Lỗi khởi tạo bản đồ Google Maps.');
      setLoading(false);
    }
  };

  // Re-calculate route when Travel Mode changes
  const calculateRoute = (mode: TravelModeType) => {
    if (!directionsServiceRef.current || !directionsRendererRef.current || !userLocation) return;
    const google = (window as any).google;
    if (!google?.maps) return;

    setLoading(true);

    const destination = { lat: poi.latitude, lng: poi.longitude };
    const request = {
      origin: userLocation,
      destination,
      travelMode: google.maps.TravelMode[mode],
    };

    directionsServiceRef.current.route(request, (result: any, status: any) => {
      setLoading(false);
      if (status === google.maps.DirectionsStatus.OK) {
        directionsRendererRef.current.setDirections(result);

        const route = result.routes[0];
        if (route && route.legs && route.legs[0]) {
          const leg = route.legs[0];
          setRouteInfo({
            distance: leg.distance?.text || '',
            duration: leg.duration?.text || '',
            steps: (leg.steps || []).map((step: any) => ({
              instructions: step.instructions,
              distance: step.distance?.text || '',
              duration: step.duration?.text || '',
            })),
          });
        }
      } else {
        setErrorMsg(`Không tìm thấy lộ trình bằng ${mode.toLowerCase()} (Mã lỗi: ${status}).`);
        setRouteInfo(null);
      }
    });
  };

  const handleModeChange = (mode: TravelModeType) => {
    setTravelMode(mode);
    calculateRoute(mode);
  };

  // Generate external link to open Google Maps App for turn-by-turn navigation
  const externalGoogleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation?.lat || ''},${userLocation?.lng || ''}&destination=${poi.latitude},${poi.longitude}&travelmode=${travelMode.toLowerCase()}`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-4xl h-[92vh] max-h-[820px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-sky-600 flex items-center justify-center text-white shadow-md shadow-sky-600/20 shrink-0">
              <Navigation className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
                Chỉ đường tới {poi.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>{poi.ward?.name ? `${poi.ward.name}, Quận 4, TP.HCM` : 'Quận 4, TP. Hồ Chí Minh'}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Missing API Key Warning */}
        {apiKeyMissing ? (
          <div className="flex-1 p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div className="max-w-md space-y-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Chưa cấu hình Google Maps API Key
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Để hiển thị bản đồ dẫn đường tương tác trực tiếp trong web, vui lòng thêm khóa API vào file{' '}
                <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-emerald-600 font-semibold">
                  frontend/.env.local
                </code>
                :
              </p>
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-left font-mono text-xs text-slate-700 dark:text-slate-300">
                NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 w-full max-w-sm">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${poi.latitude},${poi.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition"
              >
                <span>Mở Google Maps chỉ đường</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs sm:text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
            {/* Left: Google Map View */}
            <div className="relative flex-1 h-[45%] md:h-full bg-slate-100 dark:bg-slate-950">
              <div ref={mapElementRef} className="w-full h-full" />

              {/* Loading Overlay */}
              {loading && (
                <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs flex items-center justify-center gap-2 text-slate-700 dark:text-slate-200 text-sm font-semibold z-10">
                  <Loader2 className="w-5 h-5 animate-spin text-sky-600" />
                  <span>Đang tính toán tuyến đường tối ưu...</span>
                </div>
              )}

              {/* Mode Selector Floating Toolbar */}
              <div className="absolute top-3 left-3 right-3 sm:right-auto z-10 flex gap-1.5 p-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => handleModeChange('WALKING')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    travelMode === 'WALKING'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Footprints className="w-4 h-4" />
                  <span>Đi bộ</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleModeChange('DRIVING')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    travelMode === 'DRIVING'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Car className="w-4 h-4" />
                  <span>Xe máy / Ô tô</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleModeChange('TRANSIT')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    travelMode === 'TRANSIT'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Bus className="w-4 h-4" />
                  <span>Xe buýt</span>
                </button>
              </div>
            </div>

            {/* Right: Directions Panel & Turn-by-Turn Steps */}
            <div className="w-full md:w-96 flex flex-col h-[55%] md:h-full border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
              {/* Summary Metric Header */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 shrink-0 space-y-3">
                {routeInfo ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                        Thời gian ước tính
                      </span>
                      <div className="flex items-center gap-1.5 text-base sm:text-lg font-black text-sky-600">
                        <Clock className="w-5 h-5 shrink-0" />
                        <span>{routeInfo.duration}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                        Quãng đường
                      </span>
                      <div className="flex items-center gap-1.5 text-base sm:text-lg font-black text-emerald-600">
                        <Compass className="w-5 h-5 shrink-0" />
                        <span>{routeInfo.distance}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 py-1">Đang chờ lộ trình...</div>
                )}

                {errorMsg && (
                  <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-2 text-amber-700 dark:text-amber-300 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}
              </div>

              {/* Step-by-Step Instructions */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Chi tiết lộ trình từng bước ({routeInfo?.steps.length || 0} bước)
                </h3>

                {routeInfo?.steps && routeInfo.steps.length > 0 ? (
                  <div className="space-y-2.5">
                    {routeInfo.steps.map((step, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs"
                      >
                        <div className="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-600 font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <div
                            className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed [&>b]:text-sky-600 dark:[&>b]:text-sky-400"
                            dangerouslySetInnerHTML={{ __html: step.instructions }}
                          />
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                            <span>{step.distance}</span>
                            <span>•</span>
                            <span>{step.duration}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs text-slate-400">
                    Không có chỉ dẫn bước chi tiết.
                  </div>
                )}
              </div>

              {/* Bottom Launch Native App Action */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 shrink-0">
                <a
                  href={externalGoogleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-2xl bg-sky-600 hover:bg-sky-700 active:scale-[0.98] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-sky-600/20 transition"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Khởi hành với Google Maps App</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
