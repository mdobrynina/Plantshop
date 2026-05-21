package org.example.service;

import lombok.RequiredArgsConstructor;
import org.example.model.Product;
import org.example.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public List<Product> findAll(String category, String query) {
        if (query != null && !query.isBlank()) {
            return productRepository
                    .findByNameContainingIgnoreCaseOrCategoryNameContainingIgnoreCase(query, query);
        }
        if (category != null && !category.isBlank()) {
            return productRepository.findByCategory(category);
        }
        return productRepository.findAll();
    }

    public Product findById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Товар не найден: " + id));
    }
}
