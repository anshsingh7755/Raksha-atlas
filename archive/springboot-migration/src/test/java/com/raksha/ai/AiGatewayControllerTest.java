package com.raksha.ai;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

class AiGatewayControllerTest {

    @Test
    void gatewayReturnsUnavailableWhenNotEnabled() {
        var controller = new AiGatewayController("http://localhost:8001", "", false);
        var response = controller.answer(new AiGatewayController.AnswerRequest(
                "What is the public evidence?", 5, java.util.List.of(), null));
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, response.getStatusCode());
    }

    @Test
    void chatCompatibilityRouteFailsClosedWhenGatewayIsDisabled() {
        var controller = new AiGatewayController("http://localhost:8001", "", false);
        var response = controller.chat(new AiGatewayController.ChatRequest("Explain the evidence"));
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, response.getStatusCode());
    }

    @Test
    void chatRequestRejectsShortQuestions() {
        org.junit.jupiter.api.Assertions.assertThrows(IllegalArgumentException.class,
                () -> new AiGatewayController.ChatRequest("no"));
    }

    @Test
    void requestRejectsOutOfRangeLimit() {
        org.junit.jupiter.api.Assertions.assertThrows(IllegalArgumentException.class,
                () -> new AiGatewayController.AnswerRequest("valid question", 100, java.util.List.of(), null));
    }
}
