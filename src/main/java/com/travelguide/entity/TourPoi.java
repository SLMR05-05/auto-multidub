package com.travelguide.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "tour_pois", uniqueConstraints = {
        @UniqueConstraint(name = "uk_tour_poi", columnNames = {"tour_id", "poi_id"})
}, indexes = {
        @Index(name = "idx_tour_poi_order", columnList = "tour_id, order_index")
})
public class TourPoi {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tour_id", nullable = false)
    private Tour tour;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "poi_id", nullable = false)
    private Poi poi;

    @Column(name = "order_index", nullable = false)
    private int orderIndex;

    public Long getId() { return id; }
    public Tour getTour() { return tour; }
    public void setTour(Tour tour) { this.tour = tour; }
    public Poi getPoi() { return poi; }
    public void setPoi(Poi poi) { this.poi = poi; }
    public int getOrderIndex() { return orderIndex; }
    public void setOrderIndex(int orderIndex) { this.orderIndex = orderIndex; }
}
