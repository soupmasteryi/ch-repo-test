package org.example.drawapp.dto;

public record AuthResponse(String tokenId, String accessToken, UserDto user) {
}
