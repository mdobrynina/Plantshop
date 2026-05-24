package org.example.controller;

import lombok.RequiredArgsConstructor;
import org.example.model.Order;
import org.example.model.Product;
import org.example.repository.OrderRepository;
import org.example.repository.ProductRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Доступен ролям FLORIST и ADMIN.
 * Флорист видит все заказы и может менять их статус,
 * а также отмечать товары как «нет в наличии».
 */
@RestController
@RequestMapping("/api/florist")
@RequiredArgsConstructor
public class FloristController {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    // ─── Заказы ─────────────────────────────────────────────────────────────

    @GetMapping("/orders")
    public List<Order> allOrders() {
        return orderRepository.findAll();
    }

    @PutMapping("/orders/{id}/status")
    public Order updateStatus(@PathVariable Long id, @RequestParam String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Заказ не найден"));
        order.setStatus(status);
        return orderRepository.save(order);
    }

    // ─── Наличие товаров ────────────────────────────────────────────────────

    @GetMapping("/products")
    public List<Product> allProducts() {
        return productRepository.findAll();
    }

    @PutMapping("/products/{id}/stock")
    public Product updateStock(@PathVariable Long id, @RequestParam boolean inStock) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Товар не найден"));
        product.setInStock(inStock);
        return productRepository.save(product);
    }
}
