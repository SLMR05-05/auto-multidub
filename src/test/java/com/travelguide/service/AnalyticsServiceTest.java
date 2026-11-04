package com.travelguide.service;

import com.travelguide.entity.LocationPoint;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class AnalyticsServiceTest {

    private final AnalyticsService service = new AnalyticsService(null, null, null, null, null);

    @Test
    void trimsFirstAndLastHundredMeters() {
        List<LocationPoint> points = new ArrayList<>();
        // Ten 0.001 degree latitude steps (~111 m each) => ~1111 m total.
        for (int i = 0; i <= 10; i++) {
            points.add(point(10.0 + i * 0.001, 106.0, LocalDateTime.now().plusSeconds(i * 10L)));
        }

        List<LocationPoint> kept = service.trimPrivacyEdges(points, 100.0);

        assertEquals(9, kept.size());
        assertEquals(10.001, kept.get(0).getLatitude(), 0.000001);
        assertEquals(10.009, kept.get(8).getLatitude(), 0.000001);
    }

    @Test
    void shortJourneyIsFullyRemoved() {
        List<LocationPoint> points = List.of(
                point(10.0000, 106.0, LocalDateTime.now()),
                point(10.0004, 106.0, LocalDateTime.now().plusSeconds(10)),
                point(10.0008, 106.0, LocalDateTime.now().plusSeconds(20))
        );

        assertTrue(service.trimPrivacyEdges(points, 100.0).isEmpty());
    }

    @Test
    void emptyOrSinglePointIsRemoved() {
        assertTrue(service.trimPrivacyEdges(List.of(), 100.0).isEmpty());
        assertTrue(service.trimPrivacyEdges(
                List.of(point(10.0, 106.0, LocalDateTime.now())), 100.0).isEmpty());
    }

    private LocationPoint point(double latitude, double longitude, LocalDateTime time) {
        LocationPoint point = new LocationPoint();
        point.setSessionId("session-1");
        point.setDeviceId("device-1");
        point.setLatitude(latitude);
        point.setLongitude(longitude);
        point.setAccuracy(5);
        point.setRecordedAt(time);
        return point;
    }
}
