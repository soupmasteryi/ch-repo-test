package org.example.drawapp.security;

import java.util.UUID;

/** Authenticated caller, attached to the request by {@link JwtAuthFilter}. */
public record AuthPrincipal(UUID userId, String email, String jti) {

    public static final String REQUEST_ATTRIBUTE = "drawapp.principal";
}
