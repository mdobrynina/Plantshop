package org.example.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class OrderRequest {
    @NotBlank private String deliveryType;
    private String address;
    @NotBlank private String phone;
    private String comment;

    @NotEmpty private List<ItemLine> items;

    @Data
    public static class ItemLine {
        @NotNull private Long productId;
        @Min(1) private int quantity;
    }
}
