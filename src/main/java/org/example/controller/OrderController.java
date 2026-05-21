package org.example.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.dto.OrderRequest;
import org.example.model.Order;
import org.example.model.User;
import org.example.repository.UserRepository;
import org.example.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Order>> myOrders(@AuthenticationPrincipal UserDetails principal) {
        Long userId = resolveUserId(principal);
        return ResponseEntity.ok(orderService.getUserOrders(userId));
    }

    @PostMapping
    public ResponseEntity<Order> createOrder(@AuthenticationPrincipal UserDetails principal,
                                             @Valid @RequestBody OrderRequest req) {
        Long userId = resolveUserId(principal);
        return ResponseEntity.ok(orderService.createOrder(userId, req));
    }

    private Long resolveUserId(UserDetails principal) {
        return userRepository.findByEmail(principal.getUsername())
                .map(User::getId)
                .orElseThrow();
    }
}
