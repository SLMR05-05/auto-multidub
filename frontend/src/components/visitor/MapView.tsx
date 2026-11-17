'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Poi } from '@/types';
import { usePlayerStore } from '@/stores/playerStore';
import { GeofenceEngine, GeofenceEvent } from '@/utils/geofenceEngine';
import type { VisitorLeafletMapProps } from './VisitorLeafletMap';

// Dynamically import Leaflet with SSR disabled
const VisitorLeafletMap = dynamic<VisitorLeafletMapProps>(
  () => import('./VisitorLeafletMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[calc(100vh-4rem)] md:h-full bg-slate-900 flex flex-col items-center justify-center text-white space-y-3">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400">Đang khởi tạo bản đồ số Quận 4…</p>
      </div>
    ),
  }
);

interface MapViewProps {
  pois: Poi[];
  onSelectPoi: (poi: Poi) => void;
  selectedPoi: Poi | null;
  onPlayPoi: (poi: Poi) => void;
}

export default function MapView({ pois, onSelectPoi, selectedPoi, onPlayPoi }: MapViewProps) {
  const { playPoi, autoPlayEnabled, isPlaying, isCooldown } = usePlayerStore();

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'INITIALIZING' | 'ACTIVE' | 'DENIED' | 'UNAVAILABLE' | 'TIMEOUT'>('INITIALIZING');
  const [gpsAccuracy, setGpsAccuracy] = useState<number | undefined>(undefined);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // References for Geofencing Engine and GPS Watcher
  const engineRef = useRef<GeofenceEngine | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const autoPlayRef = useRef(autoPlayEnabled);
  autoPlayRef.current = autoPlayEnabled;

  const poisRef = useRef(pois);
  poisRef.current = pois;

  // Initialize Geofencing Engine
  useEffect(() => {
    const engine = new GeofenceEngine({
      accuracyThresholdMeters: 50,
      debounceSeconds: 3,
      hysteresisFactor: 1.2,
    });
    engineRef.current = engine;

    return () => {
      engine.reset();
      engineRef.current = null;
    };
  }, []);

  // Update Engine targets whenever published POIs change
  useEffect(() => {
    if (!engineRef.current) return;
    const publishedPois = pois.filter((p) => p.status !== 'ARCHIVED' && !p.isDeleted);
    engineRef.current.setTargets(
      publishedPois.map((p) => ({
        id: p.id,
        name: p.name,
        latitude: p.latitude,
        longitude: p.longitude,
        radiusMeters: p.radiusMeters || 50,
        priority: p.priority ?? 3,
      }))
    );
  }, [pois]);

  // Audio Context Unlocker on explicit user gesture
  const handleUnlockAudio = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          ctx.resume().then(() => ctx.close());
        }
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
      }
      setAudioUnlocked(true);
      setToastMessage('Đã mở khóa tự động phát âm thanh khi đến gần di tích!');
      setTimeout(() => setToastMessage(null), 3000);
    } catch {
      setAudioUnlocked(true);
    }
  }, []);

  // Handle Geofence Events
  const handleGeofenceEvents = useCallback(
    (events: GeofenceEvent[]) => {
      if (!autoPlayRef.current) return;

      const enterEvents = events.filter((e) => e.type === 'ENTER');
      if (enterEvents.length === 0) return;

      // Filter out POIs currently on cooldown
      const eligibleEvents = enterEvents.filter((e) => !isCooldown(e.target.id));
      if (eligibleEvents.length === 0) return;

      // Sort: 1st by priority descending (5 down to 1), 2nd by distance ascending
      eligibleEvents.sort((a, b) => {
        if (b.target.priority !== a.target.priority) {
          return b.target.priority - a.target.priority;
        }
        return a.distance - b.distance;
      });

      const selectedEvent = eligibleEvents[0];
      const targetPoi = poisRef.current.find((p) => p.id === selectedEvent.target.id);

      if (!targetPoi) return;

      // Do not disrupt audio if another POI is actively playing
      if (isPlayingRef.current) {
        console.log(
          `[Geofence] POI ${targetPoi.name} entered, but audio is currently playing. Skipping disruption.`
        );
        return;
      }

      // Trigger automatic audio narration
      try {
        playPoi(targetPoi, false, 'GPS');
        setToastMessage(`Đã vào vùng: ${targetPoi.name}. Đang tự động thuyết minh…`);
        setTimeout(() => setToastMessage(null), 4000);
      } catch (err) {
        console.warn('[Geofence] Failed to auto-play audio:', err);
      }
    },
    [isCooldown, playPoi]
  );

  // Subscribe Geofence Engine
  useEffect(() => {
    if (!engineRef.current) return;
    const unsubscribe = engineRef.current.subscribe((event) => {
      handleGeofenceEvents([event]);
    });
    return unsubscribe;
  }, [handleGeofenceEvents]);

  // Real-time GPS Tracking with navigator.geolocation.watchPosition
  useEffect(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setGpsStatus('UNAVAILABLE');
      return;
    }

    setGpsStatus('INITIALIZING');

    const handleSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude, accuracy } = position.coords;
      const coords = { lat: latitude, lng: longitude, accuracy };
      setUserLocation(coords);
      setGpsAccuracy(accuracy);
      setGpsStatus('ACTIVE');

      // Feed location into Geofencing Engine
      if (engineRef.current) {
        engineRef.current.processLocation({
          latitude,
          longitude,
          accuracy,
        });
      }
    };

    const handleError = (error: GeolocationPositionError) => {
      console.warn('[GPS Watcher Error]', error.code, error.message);
      if (error.code === error.PERMISSION_DENIED) {
        setGpsStatus('DENIED');
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        setGpsStatus('UNAVAILABLE');
      } else if (error.code === error.TIMEOUT) {
        setGpsStatus('TIMEOUT');
      }
    };

    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 10000,
    });

    watchIdRef.current = watchId;

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  const handleRecenter = useCallback(() => {
    // If permission was previously denied or unavailable, attempt re-query
    if (navigator.geolocation && gpsStatus !== 'ACTIVE') {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
          setGpsAccuracy(pos.coords.accuracy);
          setGpsStatus('ACTIVE');
        },
        () => {},
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, [gpsStatus]);

  return (
    <div className="relative w-full h-full">
      <VisitorLeafletMap
        pois={pois}
        selectedPoi={selectedPoi}
        onSelectPoi={onSelectPoi}
        onPlayPoi={onPlayPoi}
        userLocation={userLocation}
        gpsStatus={gpsStatus}
        gpsAccuracy={gpsAccuracy}
        onRecenter={handleRecenter}
        audioUnlocked={audioUnlocked}
        onUnlockAudio={handleUnlockAudio}
      />

      {/* Real-time Notification Toast for Geofencing & Audio */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 max-w-sm w-11/12 bg-slate-900/95 border border-emerald-500/80 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 animate-ping"></div>
          <span className="font-medium text-emerald-100">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
