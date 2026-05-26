package org.example.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.dto.CartItemRequest;
import org.example.model.CartItem;
import org.example.model.User;
import org.example.repository.UserRepository;
import org.example.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<CartItem>> getCart(@AuthenticationPrincipal UserDetails principal) {
        Long userId = resolveUserId(principal);
        return ResponseEntity.ok(cartService.getCart(userId));
    }

    @PostMapping("/items")
    public ResponseEntity<CartItem> addItem(@AuthenticationPrincipal UserDetails principal,
                                            @Valid @RequestBody CartItemRequest req) {
        Long userId = resolveUserId(principal);
        return ResponseEntity.ok(cartService.addItem(userId, req.getProductId(), req.getQuantity()));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<?> updateItem(@AuthenticationPrincipal UserDetails principal,
                                        @PathVariable Long itemId,
                                        @RequestParam int quantity) {
        Long userId = resolveUserId(principal);
        CartItem updated = cartService.updateQuantity(userId, itemId, quantity);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.noContent().build();
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<Void> removeItem(@AuthenticationPrincipal UserDetails principal,
                                           @PathVariable Long itemId) {
        Long userId = resolveUserId(principal);
        cartService.removeItem(userId, itemId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(@AuthenticationPrincipal UserDetails principal) {
        Long userId = resolveUserId(principal);
        cartService.clearCart(userId);
        return ResponseEntity.noContent().build();
    }

    private Long resolveUserId(UserDetails principal) {
        return userRepository.findByEmail(principal.getUsername())
                .map(User::getId)
                .orElseThrow();
    }
}
