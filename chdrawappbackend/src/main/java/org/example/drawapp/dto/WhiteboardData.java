package org.example.drawapp.dto;

import jakarta.validation.constraints.NotNull;

import java.time.OffsetDateTime;

public record WhiteboardData(
        @NotNull OffsetDateTime createdAt
) {
}
