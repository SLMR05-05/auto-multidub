/**
 * Geofencing Engine for Auto-Narration System (PRD v1.2)
 *
 * Fully decoupled from React, Zustand, and DOM APIs.
 * Pure mathematical, stateful geofencing engine supporting:
 * - Haversine high-precision geodesic distance (meters)
 * - GPS accuracy filtering
 * - Continuous debounce for ENTER event
 * - Hysteresis factor for LEAVE event
 * - Independent state per POI
 * - Deterministic event dispatching
 */

export interface GpsCoordinate {
  latitude: number;
  longitude: number;
  accuracy?: number; // meters
}

export interface GeofenceTarget {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  priority: number;
}

export type GeofenceEventType = 'ENTER' | 'LEAVE';

export interface GeofenceEvent {
  type: GeofenceEventType;
  target: GeofenceTarget;
  distance: number;
  timestamp: number;
}

export interface GeofenceEngineConfig {
  accuracyThresholdMeters?: number; // default: 50
  debounceSeconds?: number;          // default: 3
  hysteresisFactor?: number;         // default: 1.2
}

interface TargetTrackingState {
  isInside: boolean;
  firstInsideTimestamp: number | null;
  lastDistance: number;
}

/**
 * Calculates geodesic distance between two points in meters using Haversine formula.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export class GeofenceEngine {
  private accuracyThresholdMeters: number;
  private debounceSeconds: number;
  private hysteresisFactor: number;
  private targets: Map<number, GeofenceTarget> = new Map();
  private states: Map<number, TargetTrackingState> = new Map();
  private listeners: Set<(event: GeofenceEvent) => void> = new Set();

  constructor(config?: GeofenceEngineConfig) {
    this.accuracyThresholdMeters = config?.accuracyThresholdMeters ?? 50;
    this.debounceSeconds = config?.debounceSeconds ?? 3;
    this.hysteresisFactor = config?.hysteresisFactor ?? 1.2;
  }

  /**
   * Register or update targets to monitor.
   */
  public setTargets(targets: GeofenceTarget[]): void {
    const activeIds = new Set(targets.map((t) => t.id));
    // Clean up removed targets
    for (const id of Array.from(this.targets.keys())) {
      if (!activeIds.has(id)) {
        this.targets.delete(id);
        this.states.delete(id);
      }
    }
    for (const target of targets) {
      this.targets.set(target.id, target);
      if (!this.states.has(target.id)) {
        this.states.set(target.id, {
          isInside: false,
          firstInsideTimestamp: null,
          lastDistance: Number.POSITIVE_INFINITY,
        });
      }
    }
  }

  public subscribe(listener: (event: GeofenceEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Process incoming GPS coordinates.
   * Returns triggered events for this tick.
   */
  public processLocation(location: GpsCoordinate, now: number = Date.now()): GeofenceEvent[] {
    const accuracy = location.accuracy ?? 0;
    if (accuracy > this.accuracyThresholdMeters) {
      // Reject inaccurate coordinates to prevent jumping
      return [];
    }

    const events: GeofenceEvent[] = [];

    for (const [id, target] of this.targets.entries()) {
      let state = this.states.get(id);
      if (!state) {
        state = {
          isInside: false,
          firstInsideTimestamp: null,
          lastDistance: Number.POSITIVE_INFINITY,
        };
        this.states.set(id, state);
      }

      const distance = calculateHaversineDistance(
        location.latitude,
        location.longitude,
        target.latitude,
        target.longitude
      );
      state.lastDistance = distance;

      if (!state.isInside) {
        // Checking for ENTER
        if (distance <= target.radiusMeters) {
          if (state.firstInsideTimestamp === null) {
            state.firstInsideTimestamp = now;
          }

          const durationInside = (now - state.firstInsideTimestamp) / 1000;
          if (durationInside >= this.debounceSeconds) {
            state.isInside = true;
            state.firstInsideTimestamp = null;
            const event: GeofenceEvent = {
              type: 'ENTER',
              target,
              distance,
              timestamp: now,
            };
            events.push(event);
          }
        } else {
          // Exited before debounce completed -> reset debounce timer
          state.firstInsideTimestamp = null;
        }
      } else {
        // Checking for LEAVE with Hysteresis
        const exitRadius = target.radiusMeters * this.hysteresisFactor;
        if (distance > exitRadius) {
          state.isInside = false;
          state.firstInsideTimestamp = null;
          const event: GeofenceEvent = {
            type: 'LEAVE',
            target,
            distance,
            timestamp: now,
          };
          events.push(event);
        }
      }
    }

    // Dispatch to subscribers
    for (const event of events) {
      for (const listener of this.listeners) {
        listener(event);
      }
    }

    return events;
  }

  public getState(targetId: number): TargetTrackingState | undefined {
    return this.states.get(targetId);
  }

  public reset(): void {
    this.states.clear();
    this.targets.clear();
    this.listeners.clear();
  }
}
