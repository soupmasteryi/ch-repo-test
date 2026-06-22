package org.example.drawapp.dto;

import jakarta.validation.constraints.NotNull;

import java.time.OffsetDateTime;

/**
 * The JSON {@code whiteboardData} part of the multipart create request.
 */
public record WhiteboardData(
        @NotNull OffsetDateTime createdAt
) {
}
