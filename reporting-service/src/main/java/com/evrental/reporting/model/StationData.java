package com.evrental.reporting.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Immutable;

@Data
@Entity
@Immutable
@Table(name = "stations") // Map vào bảng "stations" có sẵn
public class StationData {

    @Id
    private Long id;

    private String name;
    private String address;
}