package com.travelguide.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class GeoUtilsTest {

    @Test
    void haversineMatchesKnownDistance() {
        // Landmark 81 to Ben Thanh Market, Ho Chi Minh City (about 3.1 km).
        double meters = GeoUtils.distanceMeters(10.7951, 106.7219, 10.7725, 106.6980);
        assertTrue(meters > 2500 && meters < 4000, "Unexpected distance: " + meters);
    }

    @Test
    void zeroDistanceForSamePoint() {
        assertEquals(0, GeoUtils.distanceMeters(10.7, 106.7, 10.7, 106.7), 0.0001);
    }

    @Test
    void validatesCoordinates() {
        assertTrue(GeoUtils.isValidLatitude(90));
        assertTrue(GeoUtils.isValidCoordinatePair(10.7, 106.7));
        assertTrue(!GeoUtils.isValidCoordinatePair(91, 106.7));
    }
}
