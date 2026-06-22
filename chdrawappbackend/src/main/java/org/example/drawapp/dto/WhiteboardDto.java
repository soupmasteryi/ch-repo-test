package org.example.drawapp.dto;

import org.example.drawapp.model.Whiteboard;

public record WhiteboardDto(
        String id,
        String userId,
        String previewUrl,
        String canvasUrl,
        String createdAt
) {

    public static WhiteboardDto from(Whiteboard wb) {
        String userId = wb.getUser().getId().toString();
        String base = "/api/v1/users/" + userId + "/whiteboards/" + wb.getId();
        return new WhiteboardDto(
                wb.getId().toString(),
                userId,
                base + "/preview",
                base + "/canvas",
                wb.getCreatedAt().toString()
        );
    }
}
