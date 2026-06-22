package org.example.drawapp.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

/**
 * A revoked JWT, keyed by its {@code jti} claim. Tokens whose {@code jti} is present
 * in this table are rejected during authentication even if otherwise valid.
 */
@Entity
@Table(name = "token_blacklist")
public class BlacklistedToken {

    @Id
    @Column(name = "jti", nullable = false, updatable = false)
    private String jti;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "revoked_at", nullable = false)
    private Instant revokedAt;

    public BlacklistedToken() {
    }

    public BlacklistedToken(String jti, Instant expiresAt) {
        this.jti = jti;
        this.expiresAt = expiresAt;
        this.revokedAt = Instant.now();
    }

    public String getJti() {
        return jti;
    }

    public void setJti(String jti) {
        this.jti = jti;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }

    public Instant getRevokedAt() {
        return revokedAt;
    }

    public void setRevokedAt(Instant revokedAt) {
        this.revokedAt = revokedAt;
    }
}
