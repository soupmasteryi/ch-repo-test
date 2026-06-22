package org.example.drawapp.service;

import io.jsonwebtoken.Claims;
import org.example.drawapp.dto.AuthResponse;
import org.example.drawapp.dto.Credentials;
import org.example.drawapp.dto.UserDto;
import org.example.drawapp.exception.ApiException;
import org.example.drawapp.model.BlacklistedToken;
import org.example.drawapp.model.User;
import org.example.drawapp.repository.BlacklistedTokenRepository;
import org.example.drawapp.repository.UserRepository;
import org.example.drawapp.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BlacklistedTokenRepository blacklistRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       BlacklistedTokenRepository blacklistRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.blacklistRepository = blacklistRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(Credentials credentials) {
        String email = credentials.email().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw ApiException.badRequest("A user with that email already exists");
        }
        User user = new User(email, passwordEncoder.encode(credentials.password()));
        user = userRepository.save(user);
        return issueFor(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(Credentials credentials) {
        String email = credentials.email().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(
                        org.springframework.http.HttpStatus.NOT_FOUND,
                        "invalid_credentials", "Invalid email or password"));

        if (!passwordEncoder.matches(credentials.password(), user.getPasswordHash())) {
            throw new ApiException(org.springframework.http.HttpStatus.NOT_FOUND,
                    "invalid_credentials", "Invalid email or password");
        }
        return issueFor(user);
    }

    @Transactional
    public void logout(String token) {
        Claims claims;
        try {
            claims = jwtService.parse(token);
        } catch (RuntimeException ex) {
            // Already invalid/expired — nothing to revoke.
            return;
        }
        String jti = claims.getId();
        if (jti != null && !blacklistRepository.existsByJti(jti)) {
            Instant expiresAt = claims.getExpiration() != null
                    ? claims.getExpiration().toInstant()
                    : Instant.now();
            blacklistRepository.save(new BlacklistedToken(jti, expiresAt));
        }
    }

    private AuthResponse issueFor(User user) {
        JwtService.IssuedToken issued = jwtService.issue(user);
        return new AuthResponse(issued.jti(), issued.token(), UserDto.from(user));
    }
}
