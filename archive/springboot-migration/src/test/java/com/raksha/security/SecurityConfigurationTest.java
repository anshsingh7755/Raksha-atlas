package com.raksha.security;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.JwtDecoder;

class SecurityConfigurationTest {
    private final SecurityConfiguration configuration = new SecurityConfiguration();

    @Test
    void localHs256ModeBuildsDecoderWithSufficientSecret() {
        JwtDecoder decoder = configuration.jwtDecoder("hs256",
                "local-test-secret-with-at-least-32-characters",
                "raksha-atlas", "", "raksha-atlas-api");
        assertNotNull(decoder);
    }

    @Test
    void oidcModeRequiresHttpsIssuerUri() {
        assertThrows(IllegalStateException.class, () -> configuration.jwtDecoder(
                "oidc", "", "raksha-atlas", "http://identity.example/issuer", "raksha-atlas-api"));
    }

    @Test
    void unsupportedJwtModeFailsClosed() {
        assertThrows(IllegalStateException.class, () -> configuration.jwtDecoder(
                "none", "", "raksha-atlas", "", "raksha-atlas-api"));
    }

    @Test
    void shortHs256SecretFailsClosed() {
        assertThrows(IllegalStateException.class, () -> configuration.jwtDecoder(
                "hs256", "short", "raksha-atlas", "", "raksha-atlas-api"));
    }
}
