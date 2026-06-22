package org.example.drawapp.security;

import java.util.UUID;

public record AuthPrincipal(UUID userId, String email, UUID jti) {

    public static final String REQUEST_ATTRIBUTE = "drawapp.principal";
}
