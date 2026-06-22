package org.example.drawapp.repository;

import org.example.drawapp.model.BlacklistedToken;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BlacklistedTokenRepository extends JpaRepository<BlacklistedToken, String> {

    boolean existsByJti(String jti);
}
