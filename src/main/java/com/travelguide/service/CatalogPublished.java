package com.travelguide.service;

/** Emitted inside the same transaction as POI publication. */
public record CatalogPublished(long dataVersion) {}
