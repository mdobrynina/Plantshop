package org.example.service;

import lombok.RequiredArgsConstructor;
import org.example.model.CartItem;
import org.example.model.Product;
import org.example.repository.CartItemRepository;
import org.example.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    public List<CartItem> getCart(Long userId) {
        return cartItemRepository.findByUserId(userId);
    }

    @Transactional
    public CartItem addItem(Long userId, Long productId, int quantity) {
        return cartItemRepository.findByUserIdAndProductId(userId, productId)
                .map(item -> {
                    item.setQuantity(item.getQuantity() + quantity);
                    return cartItemRepository.save(item);
                })
                .orElseGet(() -> {
                    Product product = productRepository.findById(productId)
                            .orElseThrow(() -> new IllegalArgumentException("Товар не найден: " + productId));
                    CartItem item = CartItem.builder()
                            .userId(userId)
                            .product(product)
                            .quantity(quantity)
                            .build();
                    return cartItemRepository.save(item);
                });
    }

    @Transactional
    public CartItem updateQuantity(Long userId, Long itemId, int quantity) {
        CartItem item = cartItemRepository.findById(itemId)
                .filter(i -> i.getUserId().equals(userId))
                .orElseThrow(() -> new IllegalArgumentException("Позиция не найдена"));
        if (quantity <= 0) {
            cartItemRepository.delete(item);
            return null;
        }
        item.setQuantity(quantity);
        return cartItemRepository.save(item);
    }

    @Transactional
    public void removeItem(Long userId, Long itemId) {
        CartItem item = cartItemRepository.findById(itemId)
                .filter(i -> i.getUserId().equals(userId))
                .orElseThrow(() -> new IllegalArgumentException("Позиция не найдена"));
        cartItemRepository.delete(item);
    }

    @Transactional
    public void clearCart(Long userId) {
        cartItemRepository.deleteByUserId(userId);
    }
}
