package com.travelguide.config;

import com.travelguide.entity.AppUser;
import com.travelguide.entity.Role;
import com.travelguide.entity.Ward;
import com.travelguide.repository.UserRepository;
import com.travelguide.repository.WardRepository;
import com.travelguide.service.SystemSettingService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initializeData(UserRepository users,
                                     WardRepository wards,
                                     SystemSettingService settings,
                                     PasswordEncoder encoder,
                                     @Value("${app.seed-admin.email:}") String email,
                                     @Value("${app.seed-admin.password:}") String password,
                                     @Value("${app.seed-admin.full-name:System Admin}") String fullName) {
        return args -> {
            settings.seedDefaults();

            if (wards.count() == 0) {
                wards.saveAll(List.of(
                        ward("khanh-hoi", "Phường Khánh Hội", "Quận 4, TP. Hồ Chí Minh"),
                        ward("vinh-hoi", "Phường Vĩnh Hội", "Quận 4, TP. Hồ Chí Minh"),
                        ward("xom-chieu", "Phường Xóm Chiếu", "Quận 4, TP. Hồ Chí Minh")
                ));
            }

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

    private Ward ward(String code, String name, String district) {
        Ward ward = new Ward();
        ward.setCode(code);
        ward.setName(name);
        ward.setDistrict(district);
        return ward;
    }
}
