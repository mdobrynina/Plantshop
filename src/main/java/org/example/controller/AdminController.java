package org.example.controller;

import lombok.RequiredArgsConstructor;
import org.example.dto.CreateStaffRequest;
import org.example.model.Order;
import org.example.model.Product;
import org.example.model.Role;
import org.example.model.User;
import org.example.repository.OrderRepository;
import org.example.repository.ProductRepository;
import org.example.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.upload.dir:frontend/public/images/products}")
    private String uploadDir;

    // ─── Пользователи ───────────────────────────────────────────────────────

    @GetMapping("/users")
    public List<User> allUsers() {
        return userRepository.findAll();
    }

    @PostMapping("/users")
    public User createUser(@RequestBody CreateStaffRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email уже используется");
        }
        User user = User.builder()
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .role(Role.valueOf(req.getRole()))
                .build();
        return userRepository.save(user);
    }

    @PutMapping("/users/{id}/role")
    public User changeRole(@PathVariable Long id, @RequestParam String role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Пользователь не найден"));
        user.setRole(Role.valueOf(role));
        return userRepository.save(user);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

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
    public Order updateOrderStatus(@PathVariable Long id, @RequestParam String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Заказ не найден"));
        order.setStatus(status);
        return orderRepository.save(order);
    }

    // ─── Товары ─────────────────────────────────────────────────────────────

    @PostMapping(value = "/products/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) throw new IllegalArgumentException("Файл пуст");
        String filename = java.util.Objects.requireNonNull(file.getOriginalFilename())
                .replaceAll("[\\\\/:*?\"<>|]", "_");
        Path dest = Path.of(uploadDir).toAbsolutePath().normalize().resolve(filename);
        Files.createDirectories(dest.getParent());
        Files.copy(file.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);
        return ResponseEntity.ok(Map.of("url", "/images/products/" + filename));
    }

    @PostMapping("/products")
    public Product addProduct(@RequestBody Product product) {
        product.setId(null);
        return productRepository.save(product);
    }

    @PutMapping("/products/{id}")
    public Product updateProduct(@PathVariable Long id, @RequestBody Product product) {
        if (!productRepository.existsById(id)) {
            throw new IllegalArgumentException("Товар не найден");
        }
        product.setId(id);
        return productRepository.save(product);
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
