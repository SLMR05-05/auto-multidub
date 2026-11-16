'use client';

import { useEffect } from 'react';
import { getDeviceId, getClientPlatform } from '@/stores/playerStore';
import { apiUrl } from '@/services/api';

export default function DevicePresenceTracker() {
  useEffect(() => {
    const reportPresence = async () => {
      try {
        const deviceId = getDeviceId();
        const platform = getClientPlatform();
        await fetch(apiUrl('/api/v1/app/devices/register'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deviceId,
            deviceType: platform.deviceType,
            osVersion: platform.osVersion,
            appVersion: platform.appVersion,
            preferredLanguage: localStorage.getItem('seminar.visitor.lang') || 'vi',
            analyticsConsent: true,
          }),
          keepalive: true,
        });
      } catch {
        // Silently ignore network errors for presence
      }
    };

    // Report immediately on load
    reportPresence();

    // Heartbeat every 3 minutes while visitor is on the site
    const interval = setInterval(reportPresence, 3 * 60 * 1000);

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        reportPresence();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return null;
}

