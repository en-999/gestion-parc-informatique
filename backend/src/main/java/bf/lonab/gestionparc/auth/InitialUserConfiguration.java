package bf.lonab.gestionparc.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class InitialUserConfiguration {

    @Bean
    CommandLineRunner createInitialUser(
            AppUserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${APP_ADMIN_USERNAME:admin}") String username,
            @Value("${APP_ADMIN_PASSWORD:admin123}") String password
    ) {
        return args -> {
            if (userRepository.findByUsername(username).isEmpty()) {
                userRepository.save(new AppUser(username, passwordEncoder.encode(password), "ADMIN"));
            }
        };
    }
}
