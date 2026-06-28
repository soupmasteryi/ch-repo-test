package org.example.drawapp.dto;

import jakarta.validation.constraints.NotNull;

public record WhiteboardTitleUpdate(
        @NotNull String title
) {
}
