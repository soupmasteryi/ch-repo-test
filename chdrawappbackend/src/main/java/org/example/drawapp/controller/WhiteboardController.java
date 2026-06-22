package org.example.drawapp.controller;

import jakarta.validation.Valid;
import org.example.drawapp.dto.WhiteboardData;
import org.example.drawapp.dto.WhiteboardDto;
import org.example.drawapp.exception.ApiException;
import org.example.drawapp.model.Whiteboard;
import org.example.drawapp.security.AuthPrincipal;
import org.example.drawapp.service.WhiteboardService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users/{userId}/whiteboards")
public class WhiteboardController {

    private final WhiteboardService whiteboardService;

    public WhiteboardController(WhiteboardService whiteboardService) {
        this.whiteboardService = whiteboardService;
    }

    @GetMapping
    public List<WhiteboardDto> list(@PathVariable String userId,
                                    @RequestAttribute(AuthPrincipal.REQUEST_ATTRIBUTE) AuthPrincipal principal) {
        UUID owner = requireOwner(userId, principal);
        return whiteboardService.list(owner).stream().map(WhiteboardDto::from).toList();
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<WhiteboardDto> create(
            @PathVariable String userId,
            @RequestAttribute(AuthPrincipal.REQUEST_ATTRIBUTE) AuthPrincipal principal,
            @RequestPart("whiteboardData") @Valid WhiteboardData whiteboardData,
            @RequestPart("preview") MultipartFile preview,
            @RequestPart("canvas") MultipartFile canvas) throws IOException {
        UUID owner = requireOwner(userId, principal);
        Whiteboard wb = whiteboardService.create(
                owner, whiteboardData, preview.getBytes(), preview.getContentType(), canvas.getBytes());
        return ResponseEntity.status(HttpStatus.CREATED).body(WhiteboardDto.from(wb));
    }

    @GetMapping("/{id}")
    public WhiteboardDto get(@PathVariable String userId,
                             @PathVariable Long id,
                             @RequestAttribute(AuthPrincipal.REQUEST_ATTRIBUTE) AuthPrincipal principal) {
        UUID owner = requireOwner(userId, principal);
        return WhiteboardDto.from(whiteboardService.get(owner, id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String userId,
                                       @PathVariable Long id,
                                       @RequestAttribute(AuthPrincipal.REQUEST_ATTRIBUTE) AuthPrincipal principal) {
        UUID owner = requireOwner(userId, principal);
        whiteboardService.delete(owner, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping(value = "/{id}/preview", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> getPreview(@PathVariable String userId,
                                             @PathVariable Long id,
                                             @RequestAttribute(AuthPrincipal.REQUEST_ATTRIBUTE) AuthPrincipal principal) {
        UUID owner = requireOwner(userId, principal);
        Whiteboard wb = whiteboardService.get(owner, id);
        byte[] preview = wb.getPreview();
        if (preview == null) {
            throw ApiException.notFound("Whiteboard has no preview");
        }
        return imageResponse(wb, preview);
    }

    @PatchMapping(value = "/{id}/preview", consumes = MediaType.IMAGE_PNG_VALUE, produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> updatePreview(@PathVariable String userId,
                                                @PathVariable Long id,
                                                @RequestAttribute(AuthPrincipal.REQUEST_ATTRIBUTE) AuthPrincipal principal,
                                                @RequestBody byte[] body) {
        UUID owner = requireOwner(userId, principal);
        if (body == null || body.length == 0) {
            throw ApiException.badRequest("Preview body must not be empty");
        }
        Whiteboard wb = whiteboardService.updatePreview(owner, id, body, MediaType.IMAGE_PNG_VALUE);
        return imageResponse(wb, wb.getPreview());
    }

    @GetMapping(value = "/{id}/canvas", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public ResponseEntity<byte[]> getCanvas(@PathVariable String userId,
                                            @PathVariable Long id,
                                            @RequestAttribute(AuthPrincipal.REQUEST_ATTRIBUTE) AuthPrincipal principal) {
        UUID owner = requireOwner(userId, principal);
        Whiteboard wb = whiteboardService.get(owner, id);
        byte[] canvas = wb.getCanvas();
        if (canvas == null) {
            throw ApiException.notFound("Whiteboard has no canvas");
        }
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(canvas);
    }

    @PatchMapping(value = "/{id}/canvas", consumes = MediaType.APPLICATION_OCTET_STREAM_VALUE, produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public ResponseEntity<byte[]> updateCanvas(@PathVariable String userId,
                                               @PathVariable Long id,
                                               @RequestAttribute(AuthPrincipal.REQUEST_ATTRIBUTE) AuthPrincipal principal,
                                               @RequestBody byte[] body) {
        UUID owner = requireOwner(userId, principal);
        if (body == null || body.length == 0) {
            throw ApiException.badRequest("Canvas body must not be empty");
        }
        Whiteboard wb = whiteboardService.updateCanvas(owner, id, body);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(wb.getCanvas());
    }

    private ResponseEntity<byte[]> imageResponse(Whiteboard wb, byte[] data) {
        MediaType type = wb.getPreviewContentType() != null
                ? MediaType.parseMediaType(wb.getPreviewContentType())
                : MediaType.IMAGE_PNG;
        return ResponseEntity.ok().contentType(type).body(data);
    }

    /**
     * Ensures the path {@code userId} refers to the authenticated caller and returns it as a UUID.
     * Callers may only operate on their own whiteboards.
     */
    private UUID requireOwner(String pathUserId, AuthPrincipal principal) {
        UUID parsed;
        try {
            parsed = UUID.fromString(pathUserId);
        } catch (IllegalArgumentException ex) {
            throw ApiException.forbidden("You may not access another user's whiteboards");
        }
        if (!parsed.equals(principal.userId())) {
            throw ApiException.forbidden("You may not access another user's whiteboards");
        }
        return parsed;
    }
}
