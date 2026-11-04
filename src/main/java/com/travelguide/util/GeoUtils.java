package com.travelguide.util;

public final class GeoUtils {

    private static final double EARTH_RADIUS_METERS = 6_371_008.8;

    private GeoUtils() {
    }

    /** Great-circle distance in meters (Haversine formula, PRD FR-GEO-04). */
    public static double distanceMeters(double lat1, double lon1, double lat2, double lon2) {
        double phi1 = Math.toRadians(lat1);
        double phi2 = Math.toRadians(lat2);
        double dPhi = Math.toRadians(lat2 - lat1);
        double dLambda = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dPhi / 2) * Math.sin(dPhi / 2)
                + Math.cos(phi1) * Math.cos(phi2)
                * Math.sin(dLambda / 2) * Math.sin(dLambda / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_METERS * c;
    }

    public static boolean isValidLatitude(double value) {
        return value >= -90 && value <= 90;
    }

    public static boolean isValidLongitude(double value) {
        return value >= -180 && value <= 180;
    }

    public static boolean isValidCoordinatePair(double latitude, double longitude) {
        return isValidLatitude(latitude) && isValidLongitude(longitude);
    }
}
