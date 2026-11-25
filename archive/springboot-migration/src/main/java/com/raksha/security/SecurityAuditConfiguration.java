package com.raksha.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class SecurityAuditConfiguration {
    @Bean
    SecurityAuditFilter securityAuditFilter(JdbcTemplate jdbc) {
        return new SecurityAuditFilter(jdbc);
    }
}
