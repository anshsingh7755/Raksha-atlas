package com.raksha.security;

import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/audit")
@PreAuthorize("hasRole('ADMIN')")
public class SecurityAuditController {
    private final JdbcTemplate jdbc;
    public SecurityAuditController(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    @GetMapping
    public List<AuditEvent> list(@RequestParam(defaultValue = "50") int limit) {
        if (limit < 1 || limit > 100) throw new IllegalArgumentException("limit must be between 1 and 100");
        return jdbc.query("""
            SELECT id, occurred_at, actor_subject, actor_roles::text, event_type,
                   http_method, route_template, response_status, correlation_id
            FROM security_audit_events ORDER BY occurred_at DESC, id DESC LIMIT ?
            """, (rs, row) -> new AuditEvent(rs.getLong("id"),
                rs.getObject("occurred_at", OffsetDateTime.class), rs.getString("actor_subject"),
                rs.getString("actor_roles"), rs.getString("event_type"), rs.getString("http_method"),
                rs.getString("route_template"), rs.getInt("response_status"),
                rs.getString("correlation_id")), limit);
    }

    public record AuditEvent(long id, OffsetDateTime occurredAt, String actorSubject, String actorRoles,
            String eventType, String httpMethod, String routeTemplate, int responseStatus, String correlationId) {}
}
