package com.travelguide.config;

import com.travelguide.entity.AppUser;
import com.travelguide.entity.Role;
import com.travelguide.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {
    @Bean
    CommandLineRunner createAdmin(UserRepository users, PasswordEncoder encoder,
                                  @Value("${app.seed-admin.email:}") String email,
                                  @Value("${app.seed-admin.password:}") String password,
                                  @Value("${app.seed-admin.full-name:System Admin}") String fullName) {
        return args -> {
            if (email != null && !email.isBlank() && password != null && !password.isBlank()
                    && !users.existsByEmail(email.toLowerCase().trim())) {
                AppUser admin = new AppUser();
                admin.setEmail(email.toLowerCase().trim());
                admin.setPassword(encoder.encode(password));
                admin.setFullName(fullName);
                admin.setRole(Role.ADMIN);
                users.save(admin);
                System.out.println("Seeded admin account: " + email);
            }
        };
    }
}
