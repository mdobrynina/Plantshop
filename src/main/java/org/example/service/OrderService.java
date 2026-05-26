package org.example.service;

import lombok.RequiredArgsConstructor;
import org.example.dto.OrderRequest;
import org.example.model.Order;
import org.example.model.OrderItem;
import org.example.model.Product;
import org.example.repository.OrderRepository;
import org.example.repository.ProductRepository;
import org.example.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CartService cartService;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public List<Order> getUserOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public Order createOrder(Long userId, OrderRequest req) {
        Order order = Order.builder()
                .userId(userId)
                .deliveryType(req.getDeliveryType())
                .address(req.getAddress())
                .phone(req.getPhone())
                .comment(req.getComment())
                .total(BigDecimal.ZERO)
                .build();

        BigDecimal total = BigDecimal.ZERO;

        for (OrderRequest.ItemLine line : req.getItems()) {
            Product product = productRepository.findById(line.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Товар не найден: " + line.getProductId()));

            if (product.getStock() < line.getQuantity()) {
                throw new IllegalArgumentException(
                    "Недостаточно товара «" + product.getName() + "». В наличии: " + product.getStock() + " шт.");
            }

            product.setStock(product.getStock() - line.getQuantity());
            product.setInStock(product.getStock() > 0);
            productRepository.save(product);

            OrderItem item = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(line.getQuantity())
                    .price(product.getPrice())
                    .build();

            order.getItems().add(item);
            total = total.add(product.getPrice().multiply(BigDecimal.valueOf(line.getQuantity())));
        }

        order.setTotal(total);
        Order saved = orderRepository.save(order);

        cartService.clearCart(userId);

        userRepository.findById(userId).ifPresent(user ->
                emailService.sendOrderReceipt(user.getEmail(), user.getFirstName(), saved)
        );

        return saved;
    }
}
