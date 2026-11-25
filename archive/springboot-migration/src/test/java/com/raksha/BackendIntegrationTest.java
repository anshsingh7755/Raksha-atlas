package com.raksha;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
import org.junit.jupiter.api.BeforeEach;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest
@Testcontainers(disabledWithoutDocker = true)
class BackendIntegrationTest {

    @Container
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:17-alpine")
            .withDatabaseName("raksha_atlas")
            .withUsername("raksha")
            .withPassword("test-password");

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
        registry.add("raksha.security.jwt-secret", () -> "test-secret-that-is-at-least-thirty-two-bytes");
        registry.add("raksha.security.issuer", () -> "raksha-atlas");
    }

    @Autowired
    WebApplicationContext context;

    MockMvc mvc;

    @BeforeEach
    void setUpMockMvc() {
        mvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(SecurityMockMvcConfigurers.springSecurity()).build();
    }

    @Test
    void healthIsPublic() throws Exception {
        mvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ok"));
    }

    @Test
    void protectedInventoryRequiresAuthentication() throws Exception {
        mvc.perform(get("/api/inventory"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void authenticatedInventoryEndpointReturnsList() throws Exception {
        mvc.perform(get("/api/inventory").with(SecurityMockMvcRequestPostProcessors.jwt()
                        .jwt(jwt -> jwt.subject("test-user").claim("roles", List.of("ANALYST"))))
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }


    @Test
    void inventoryPreservesLegacyEnvelopeAndFilters() throws Exception {
        mvc.perform(get("/api/inventory").param("service", "Army")
                        .with(SecurityMockMvcRequestPostProcessors.jwt()
                                .jwt(jwt -> jwt.subject("test-user").claim("roles", List.of("ANALYST")))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isArray())
                .andExpect(jsonPath("$.count").value(0))
                .andExpect(jsonPath("$.availableFilters.serviceDomains").isArray());
    }

    @Test
    void sourceProgrammeAndProcurementEndpointsExposeStableEnvelopes() throws Exception {
        var auth = SecurityMockMvcRequestPostProcessors.jwt()
                .jwt(jwt -> jwt.subject("test-user").claim("roles", List.of("ANALYST")));
        mvc.perform(get("/api/sources").with(auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isArray())
                .andExpect(jsonPath("$.verificationStatuses").isArray());
        mvc.perform(get("/api/programmes").with(auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isArray())
                .andExpect(jsonPath("$.count").value(0))
                .andExpect(jsonPath("$.classificationPolicy").exists());
        mvc.perform(get("/api/procurement-2026").with(auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isArray())
                .andExpect(jsonPath("$.count").value(0));
    }

    @Test
    void inventoryV2RejectsOversizedPage() throws Exception {
        mvc.perform(get("/api/inventory/v2").param("size", "1000")
                        .with(SecurityMockMvcRequestPostProcessors.jwt()
                                .jwt(jwt -> jwt.subject("test-user").claim("roles", List.of("ANALYST")))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Invalid request"));
    }

    @Test
    void viewerCannotReadAdministrativeAuditEvents() throws Exception {
        mvc.perform(get("/api/admin/audit").with(SecurityMockMvcRequestPostProcessors.jwt()
                        .authorities(new SimpleGrantedAuthority("ROLE_VIEWER"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminCanReadBoundedAuditEvents() throws Exception {
        mvc.perform(get("/api/admin/audit").param("limit", "10")
                        .with(SecurityMockMvcRequestPostProcessors.jwt()
                                .authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void healthIncludesSecurityHeaders() throws Exception {
        mvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().string("X-Frame-Options", "DENY"))
                .andExpect(header().exists("Referrer-Policy"));
    }

    @Test
    void auditEndpointRejectsUnboundedLimit() throws Exception {
        mvc.perform(get("/api/admin/audit").param("limit", "500")
                        .with(SecurityMockMvcRequestPostProcessors.jwt()
                                .authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))))
                .andExpect(status().isBadRequest());
    }
}
