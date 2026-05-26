package org.example.controller;

import lombok.RequiredArgsConstructor;
import org.example.model.Order;
import org.example.model.Product;
import org.example.model.User;
import org.example.repository.OrderRepository;
import org.example.repository.ProductRepository;
import org.example.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/florist")
@RequiredArgsConstructor
public class FloristController {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    // ─── Заказы ─────────────────────────────────────────────────────────────

    @GetMapping("/orders")
    public List<Order> allOrders() {
        List<Order> orders = orderRepository.findAll();
        Map<Long, User> users = userRepository.findAll().stream()
                .collect(Collectors.toMap(User::getId, u -> u));
        orders.forEach(o -> {
            User u = users.get(o.getUserId());
            if (u != null) o.setClientName(u.getFirstName() + " " + u.getLastName());
        });
        return orders;
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

    @PostMapping("/products")
    public Product addProduct(@RequestBody Product product) {
        product.setId(null);
        if (product.getImage() == null) product.setImage("");
        product.setInStock(product.getStock() > 0);
        return productRepository.save(product);
    }

    @PutMapping("/products/{id}/stock")
    public Product updateStock(@PathVariable Long id, @RequestParam int qty) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Товар не найден"));
        product.setStock(qty);
        product.setInStock(qty > 0);
        return productRepository.save(product);
    }
}
