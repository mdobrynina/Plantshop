package org.example.config;

import lombok.RequiredArgsConstructor;
import org.example.model.Role;
import org.example.model.User;
import org.example.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**
 * Создаёт трёх тестовых пользователей при старте (если их ещё нет).
 *
 * admin@moh.ru   / Admin123!    — ADMIN
 * client@moh.ru  / Client123!   — CLIENT
 * florist@moh.ru / Florist123!  — FLORIST
 */
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        createIfAbsent("admin@moh.ru",   "Admin123!",   "Алексей",  "Соколов",   LocalDate.of(1985, 3, 10),  Role.ADMIN);
        createIfAbsent("client@moh.ru",  "Client123!",  "Марина",   "Иванова",   LocalDate.of(2001, 7, 22),  Role.CLIENT);
        createIfAbsent("florist@moh.ru", "Florist123!", "Светлана", "Петрова",   LocalDate.of(1993, 11, 5),  Role.FLORIST);
    }

    private void createIfAbsent(String email, String rawPassword,
                                String firstName, String lastName,
                                LocalDate birthDate, Role role) {
        if (!userRepository.existsByEmail(email)) {
            userRepository.save(User.builder()
                    .email(email)
                    .password(passwordEncoder.encode(rawPassword))
                    .firstName(firstName)
                    .lastName(lastName)
                    .birthDate(birthDate)
                    .role(role)
                    .build());
        }
    }
}
