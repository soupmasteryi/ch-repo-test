package org.example.drawapp.dto;

import com.google.common.primitives.Longs;
import io.ipfs.multibase.Base58;
import org.example.drawapp.model.Whiteboard;

public record WhiteboardDto(
        String id,
        String title,
        String userId,
        String previewUrl,
        String canvasUrl,
        String createdAt,
        Boolean isPublic
) {

    public static WhiteboardDto from(Whiteboard wb) {
        String userId = wb.getUser().getId().toString();
        String code = getCodeFromId(wb.getId());
        String base = "/users/" + userId + "/whiteboards/" + code;
        return new WhiteboardDto(
                code,
                wb.getTitle(),
                userId,
                base + "/preview",
                base + "/canvas",
                wb.getCreatedAt().toString(),
                wb.isPublic()
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
