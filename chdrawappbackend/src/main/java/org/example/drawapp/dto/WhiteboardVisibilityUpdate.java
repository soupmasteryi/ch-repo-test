package org.example.drawapp.dto;

import jakarta.validation.constraints.NotNull;

public record WhiteboardVisibilityUpdate(
        @NotNull Boolean isPublic
) {
}
