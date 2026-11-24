package com.raksha.domain;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class DomainReadService {
    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper;

    public DomainReadService(JdbcTemplate jdbc, ObjectMapper mapper) {
        this.jdbc = jdbc;
        this.mapper = mapper;
    }

    private List<JsonNode> records(String table, String where, Object... args) {
        String sql = "SELECT raw_record FROM " + table + where + " ORDER BY id";
        return jdbc.query(sql, (rs, row) -> {
            try {
                return mapper.readTree(rs.getString(1));
            } catch (java.io.IOException exception) {
                throw new java.sql.SQLException("Stored raw_record is not valid JSON", exception);
            }
        }, args);
    }

    public Map<String, Object> inventory(String service, String category, String quantityStatus, String originCountry) {
        List<JsonNode> all = records("inventory_items", "");
        List<JsonNode> items = all.stream()
                .filter(item -> blank(service) || service.equals(item.path("service").asText()))
                .filter(item -> blank(category) || category.equals(item.path("category").asText()))
                .filter(item -> blank(quantityStatus) || quantityStatus.equals(item.path("quantityStatus").asText()))
                .filter(item -> blank(originCountry) || originCountry.equals(item.path("originCountry").asText()))
                .toList();
        Map<String, Object> available = new LinkedHashMap<>();
        available.put("serviceDomains", unique(all, "service"));
        available.put("categories", unique(all, "category"));
        available.put("quantityStatuses", unique(all, "quantityStatus"));
        available.put("originCountries", unique(all, "originCountry"));
        String asOf = all.stream().map(item -> item.path("asOfDate").asText(""))
                .filter(value -> !value.isBlank()).max(String::compareTo).orElse(null);
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("items", items);
        response.put("count", items.size());
        response.put("filters", Map.of("service", safe(service), "category", safe(category),
                "quantityStatus", safe(quantityStatus), "originCountry", safe(originCountry)));
        response.put("availableFilters", available);
        response.put("asOf", asOf);
        response.put("latestRecordAsOf", asOf);
        return response;
    }

    private static List<String> unique(List<JsonNode> items, String field) {
        return items.stream().map(item -> item.path(field).asText(""))
                .filter(value -> !value.isBlank()).distinct().sorted().toList();
    }

    public Map<String, Object> sources() {
        return Map.of("items", records("sources", " WHERE active = TRUE"),
                "verificationStatuses", List.of("official", "verified", "reported", "unverified", "disputed", "corrected", "withdrawn"));
    }

    public Map<String, Object> programmes(String service, String status, String stageClassification,
                                          String evidenceQuality, String query) {
        List<JsonNode> all = records("programmes", "");
        String q = query == null ? "" : query.trim().toLowerCase();
        List<JsonNode> items = all.stream().filter(item ->
                blank(service) || "all".equals(service) || service.equals(item.path("serviceDomain").asText()) )
                .filter(item -> blank(status) || "all".equals(status) || status.equals(item.path("status").asText()))
                .filter(item -> blank(stageClassification) || "all".equals(stageClassification) || stageClassification.equals(item.path("stageClassification").asText()))
                .filter(item -> blank(evidenceQuality) || "all".equals(evidenceQuality) || evidenceQuality.equals(item.path("evidenceQuality").asText()))
                .filter(item -> q.isEmpty() || item.toString().toLowerCase().contains(q))
                .toList();
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("items", items);
        response.put("count", items.size());
        response.put("filters", Map.of("service", safe(service), "status", safe(status),
                "stageClassification", safe(stageClassification), "evidenceQuality", safe(evidenceQuality), "q", q.isEmpty() ? "" : q));
        response.put("asOf", "database");
        response.put("classificationPolicy", "Heuristic stage labels remain unverified; consult source records.");
        return response;
    }

    public Map<String, Object> procurement(String scope, String status) {
        List<JsonNode> all = records("procurement_records", " WHERE dataset = 'procurement-2026'");
        List<JsonNode> items = all.stream()
                .filter(item -> blank(scope) || scope.equals(item.path("scope").asText()))
                .filter(item -> blank(status) || status.equals(item.path("status").asText()))
                .toList();
        return Map.of("items", items, "count", items.size(), "filters",
                Map.of("scope", safe(scope), "status", safe(status)), "asOf", "database");
    }

    private static boolean blank(String value) { return value == null || value.isBlank(); }
    private static String safe(String value) { return value == null ? "" : value; }
}
