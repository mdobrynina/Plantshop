package org.example.controller;

import lombok.RequiredArgsConstructor;
import org.example.model.Favorite;
import org.example.model.User;
import org.example.repository.FavoriteRepository;
import org.example.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;

    @GetMapping
    public List<Long> getFavorites(@AuthenticationPrincipal UserDetails principal) {
        Long userId = resolveUserId(principal);
        return favoriteRepository.findByUserId(userId)
                .stream()
                .map(Favorite::getProductId)
                .toList();
    }

    @PostMapping("/{productId}")
    public ResponseEntity<Void> add(@AuthenticationPrincipal UserDetails principal,
                                    @PathVariable Long productId) {
        Long userId = resolveUserId(principal);
        if (!favoriteRepository.existsByUserIdAndProductId(userId, productId)) {
            favoriteRepository.save(Favorite.builder().userId(userId).productId(productId).build());
        }
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{productId}")
    @Transactional
    public ResponseEntity<Void> remove(@AuthenticationPrincipal UserDetails principal,
                                       @PathVariable Long productId) {
        Long userId = resolveUserId(principal);
        favoriteRepository.deleteByUserIdAndProductId(userId, productId);
        return ResponseEntity.noContent().build();
    }

    private Long resolveUserId(UserDetails principal) {
        return userRepository.findByEmail(principal.getUsername())
                .map(User::getId)
                .orElseThrow();
    }
}
