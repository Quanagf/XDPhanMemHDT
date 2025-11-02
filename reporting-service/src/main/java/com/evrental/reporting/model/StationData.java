package com.evrental.reporting.model;

import org.hibernate.annotations.Immutable;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Immutable
@Table(name = "stations", schema = "vehicle_db")
public class StationData {

    @Id
    private Long id;

    private String name;
    private String address;
}