package com.raksha.ai;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@RestController
@RequestMapping("/api/ai")
@PreAuthorize("hasAnyRole('ADMIN', 'ANALYST', 'VIEWER')")
public class AiGatewayController {

    private final RestClient client;
    private final String serviceToken;
    private final boolean enabled;

    public AiGatewayController(
            @Value("${raksha.ai.base-url:http://localhost:8001}") String baseUrl,
            @Value("${raksha.ai.service-token:}") String serviceToken,
            @Value("${raksha.ai.enabled:false}") boolean enabled) {
        this.client = RestClient.builder().baseUrl(baseUrl).build();
        this.serviceToken = serviceToken;
        this.enabled = enabled;
    }

    @PostMapping("/answer")
    public ResponseEntity<?> answer(@RequestBody AnswerRequest request) {
        if (!enabled || serviceToken.isBlank()) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("detail", "AI gateway is not configured."));
        }
        Map<String, Object> payload = new HashMap<>();
        payload.put("query", request.query());
        payload.put("limit", request.limit());
        payload.put("source_ids", request.sourceIds());
        if (request.model() != null && !request.model().isBlank()) payload.put("model", request.model());
        try {
            JsonNode result = client.post().uri("/v1/assistant/answer")
                    .header("Authorization", "Bearer " + serviceToken)
                    .body(payload).retrieve().body(JsonNode.class);
            return ResponseEntity.ok(result);
        } catch (RestClientException exception) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of("detail", "AI service request failed."));
        }
    }

    /** Compatibility adapter for the current UI's /api/chat question contract. */
    @PostMapping("/chat")
    public ResponseEntity<?> chat(@RequestBody ChatRequest request) {
        ResponseEntity<?> response = answer(new AnswerRequest(request.question(), 5, List.of(), null));
        if (!response.getStatusCode().is2xxSuccessful() || !(response.getBody() instanceof JsonNode result)) {
            return response;
        }
        Map<String, Object> compatible = new HashMap<>();
        compatible.put("answer", result.path("answer").asText("No answer was returned."));
        compatible.put("sources", result.path("citations"));
        compatible.put("needsModelKey", false);
        compatible.put("model", result.path("model").isMissingNode() ? null : result.path("model").asText());
        compatible.put("evidenceCount", result.path("evidence_count").asInt(0));
        return ResponseEntity.ok(compatible);
    }

    public record ChatRequest(String question) {
        public ChatRequest {
            if (question == null || question.trim().length() < 3 || question.length() > 2000)
                throw new IllegalArgumentException("question must contain 3–2000 characters");
        }
    }

    public record AnswerRequest(String query, Integer limit, List<String> sourceIds, String model) {
        public AnswerRequest {
            if (query == null || query.trim().length() < 3 || query.length() > 2000)
                throw new IllegalArgumentException("query must contain 3–2000 characters");
            if (limit == null) limit = 5;
            if (limit < 1 || limit > 20) throw new IllegalArgumentException("limit must be between 1 and 20");
            if (sourceIds == null) sourceIds = List.of();
            if (sourceIds.size() > 50) throw new IllegalArgumentException("at most 50 source IDs are allowed");
        }
    }
}
