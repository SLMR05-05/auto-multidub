package com.travelguide.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "languages")
public class Language {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 10)
    private String code; // vi, en, zh-CN, th, hi, ko, ja, ...

    @Column(nullable = false, length = 50)
    private String name; // Vietnamese, English, Thai, ...

    @Column(nullable = false, length = 100)
    private String nativeName; // Tiếng Việt, English, ไทย, ...

    @Column(nullable = false, length = 20)
    private String localeTts; // vi-VN, en-US, th-TH, ...

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false)
    private boolean isDefault = false;

    @Column(nullable = false)
    private int orderIndex = 0;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getNativeName() { return nativeName; }
    public void setNativeName(String nativeName) { this.nativeName = nativeName; }
    public String getLocaleTts() { return localeTts; }
    public void setLocaleTts(String localeTts) { this.localeTts = localeTts; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public boolean isDefault() { return isDefault; }
    public void setDefault(boolean aDefault) { isDefault = aDefault; }
    public int getOrderIndex() { return orderIndex; }
    public void setOrderIndex(int orderIndex) { this.orderIndex = orderIndex; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
