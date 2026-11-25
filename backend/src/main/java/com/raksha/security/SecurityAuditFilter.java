package com.raksha.security;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class SecurityAuditFilter extends OncePerRequestFilter {
    private final JdbcTemplate jdbc;
    public SecurityAuditFilter(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        try {
            chain.doFilter(request, response);
        } finally {
            String path = request.getRequestURI();
            if (path.startsWith("/api/") && !path.equals("/api/health")
                    && (!List.of("GET", "HEAD", "OPTIONS").contains(request.getMethod())
                    || response.getStatus() >= 400)) {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                String subject = auth != null && auth.isAuthenticated() && auth.getName() != null
                        ? auth.getName() : "anonymous";
                List<String> roles = auth == null ? List.of() : auth.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority).sorted().toList();
                String event = response.getStatus() >= 400 ? "API_REQUEST_REJECTED" : "API_MUTATION_ATTEMPT";
                jdbc.update("""
                    INSERT INTO security_audit_events
                    (actor_subject, actor_roles, event_type, http_method, route_template, response_status, correlation_id)
                    VALUES (?, CAST(? AS jsonb), ?, ?, ?, ?, ?)
                    """, subject, jsonArray(roles), event, request.getMethod(),
                    safeRoute(path), response.getStatus(), safeCorrelationId(request.getHeader("X-Correlation-ID")));
            }
        }
    }
    private static String safeRoute(String path) {
        String bounded = path.length() > 180 ? path.substring(0, 180) : path;
        return bounded.replaceAll("/[0-9a-fA-F-]{24,}", "/{id}");
    }
    private static String safeCorrelationId(String value) {
        return value != null && value.matches("[A-Za-z0-9._-]{1,80}") ? value : null;
    }
    private static String jsonArray(List<String> roles) {
        return roles.stream().map(role -> "\"" + role.replace("\\", "").replace("\"", "") + "\"")
                .collect(Collectors.joining(",", "[", "]"));
    }
}
