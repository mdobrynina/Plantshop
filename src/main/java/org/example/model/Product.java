package org.example.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "products")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String categoryName;

    private String care;

    @Column(nullable = false)
    private BigDecimal price;

    private String image;
    private String height;
    private String light;
    private String watering;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Builder.Default
    private boolean inStock = true;

    @Builder.Default
    @Column(nullable = false, columnDefinition = "integer default 10")
    private int stock = 10;
}
