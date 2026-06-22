package org.example.drawapp.dto;

import com.google.common.primitives.Longs;
import io.ipfs.multibase.Base58;
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
                getCodeFromId(wb.getId()),
                userId,
                base + "/preview",
                base + "/canvas",
                wb.getCreatedAt().toString()
        );
    }

    private static String getCodeFromId(Long id) {
        return trimLeadingOnes(Base58.encode(Longs.toByteArray(id)));
    }

    private static String trimLeadingOnes(String code) {
        StringBuilder sb = new StringBuilder(code).reverse();
        while (!sb.isEmpty() && sb.charAt(sb.length() - 1) == '1') {
            sb.deleteCharAt(sb.length() - 1);
        }
        return sb.isEmpty() ? "1" : sb.reverse().toString();
    }
}
