package com.raksha.inventory;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "inventory_items")
public class InventoryItem {

    @Id
    private String id;

    private String service;
    private String category;
    private String platform;
    private Integer quantity;

    @Column(name = "quantity_status")
    private String quantityStatus;

    @Column(name = "origin_country")
    private String originCountry;

    @Column(name = "procurement_year")
    private Integer procurementYear;

    @Column(name = "inducted_year")
    private Integer inductedYear;

    private String role;

    @Column(name = "as_of_date")
    private LocalDate asOfDate;

    private String definition;
    private String confidence;

    @Column(name = "verification_status")
    private String verificationStatus;

    @Column(name = "source_id")
    private String sourceId;

    @Column(name = "source_url")
    private String sourceUrl;

    protected InventoryItem() {
    }

    public String getId() {
        return id;
    }

    public String getService() {
        return service;
    }

    public String getCategory() {
        return category;
    }

    public String getPlatform() {
        return platform;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public String getQuantityStatus() {
        return quantityStatus;
    }

    public String getOriginCountry() {
        return originCountry;
    }

    public Integer getProcurementYear() {
        return procurementYear;
    }

    public Integer getInductedYear() {
        return inductedYear;
    }

    public String getRole() {
        return role;
    }

    public LocalDate getAsOfDate() {
        return asOfDate;
    }

    public String getDefinition() {
        return definition;
    }

    public String getConfidence() {
        return confidence;
    }

    public String getVerificationStatus() {
        return verificationStatus;
    }

    public String getSourceId() {
        return sourceId;
    }

    public String getSourceUrl() {
        return sourceUrl;
    }
}
