package org.example.drawapp.controller;

import io.ipfs.multibase.Base58;
import jakarta.validation.Valid;
import org.example.drawapp.dto.WhiteboardData;
import org.example.drawapp.dto.WhiteboardDto;
import org.example.drawapp.dto.WhiteboardTitleUpdate;
import org.example.drawapp.dto.WhiteboardVisibilityUpdate;
import org.example.drawapp.exception.ApiException;
import org.example.drawapp.model.Whiteboard;
import org.example.drawapp.security.AuthPrincipal;
import org.example.drawapp.service.WhiteboardService;
import org.example.drawapp.validation.WhiteboardCode;
import org.example.drawapp.validation.WhiteboardCodeValidator;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
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

    @GetMapping("/{code}")
    public WhiteboardDto get(@PathVariable String userId,
                             @PathVariable @WhiteboardCode String code) {
        UUID owner = UUID.fromString(userId);
        Long id = whiteboardIdFromCode(code);
        return WhiteboardDto.from(whiteboardService.getPublic(owner, id));
    }

    @DeleteMapping("/{code}")
    public ResponseEntity<Void> delete(@PathVariable String userId,
                                       @PathVariable @WhiteboardCode String code,
                                       @RequestAttribute(AuthPrincipal.REQUEST_ATTRIBUTE) AuthPrincipal principal) {
        UUID owner = requireOwner(userId, principal);
        Long id = whiteboardIdFromCode(code);
        whiteboardService.delete(owner, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping(value = "/{code}/preview", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> getPreview(@PathVariable String userId,
                                             @PathVariable @WhiteboardCode String code) {
        UUID owner = UUID.fromString(userId);
        Long id = whiteboardIdFromCode(code);
        Whiteboard wb = whiteboardService.getPublic(owner, id);
        byte[] preview = wb.getPreview();
        if (preview == null) {
            throw ApiException.notFound("Whiteboard has no preview");
        }
        return imageResponse(wb, preview);
    }

    @PatchMapping(value = "/{code}/preview", consumes = MediaType.IMAGE_PNG_VALUE, produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> updatePreview(@PathVariable String userId,
                                                @PathVariable @WhiteboardCode String code,
                                                @RequestAttribute(AuthPrincipal.REQUEST_ATTRIBUTE) AuthPrincipal principal,
                                                @RequestBody byte[] body) {
        UUID owner = requireOwner(userId, principal);
        Long id = whiteboardIdFromCode(code);
        if (body == null || body.length == 0) {
            throw ApiException.badRequest("Preview body must not be empty");
        }
        Whiteboard wb = whiteboardService.updatePreview(owner, id, body, MediaType.IMAGE_PNG_VALUE);
        return imageResponse(wb, wb.getPreview());
    }

    @GetMapping(value = "/{code}/canvas", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public ResponseEntity<byte[]> getCanvas(@PathVariable String userId,
                                            @PathVariable @WhiteboardCode String code) {
        UUID owner = UUID.fromString(userId);
        Long id = whiteboardIdFromCode(code);
        Whiteboard wb = whiteboardService.getPublic(owner, id);
        byte[] canvas = wb.getCanvas();
        if (canvas == null) {
            throw ApiException.notFound("Whiteboard has no canvas");
        }
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(canvas);
    }

    @PatchMapping(value = "/{code}/canvas", consumes = MediaType.APPLICATION_OCTET_STREAM_VALUE, produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public ResponseEntity<byte[]> updateCanvas(@PathVariable String userId,
                                               @PathVariable @WhiteboardCode String code,
                                               @RequestAttribute(AuthPrincipal.REQUEST_ATTRIBUTE) AuthPrincipal principal,
                                               @RequestBody byte[] body) {
        UUID owner = requireOwner(userId, principal);
        Long id = whiteboardIdFromCode(code);
        if (body == null || body.length == 0) {
            throw ApiException.badRequest("Canvas body must not be empty");
        }
        Whiteboard wb = whiteboardService.updateCanvas(owner, id, body);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(wb.getCanvas());
    }

    @PatchMapping(value = "/{code}/title", consumes = MediaType.APPLICATION_JSON_VALUE)
    public WhiteboardDto updateTitle(@PathVariable String userId,
                                     @PathVariable @WhiteboardCode String code,
                                     @RequestAttribute(AuthPrincipal.REQUEST_ATTRIBUTE) AuthPrincipal principal,
                                     @RequestBody @Valid WhiteboardTitleUpdate body) {
        UUID owner = requireOwner(userId, principal);
        Long id = whiteboardIdFromCode(code);
        return WhiteboardDto.from(whiteboardService.updateTitle(owner, id, body.title()));
    }

    @PatchMapping(value = "/{code}/visibility", consumes = MediaType.APPLICATION_JSON_VALUE)
    public WhiteboardDto updateVisibility(@PathVariable String userId,
                                          @PathVariable @WhiteboardCode String code,
                                          @RequestAttribute(AuthPrincipal.REQUEST_ATTRIBUTE) AuthPrincipal principal,
                                          @RequestBody @Valid WhiteboardVisibilityUpdate body) {
        UUID owner = requireOwner(userId, principal);
        Long id = whiteboardIdFromCode(code);
        return WhiteboardDto.from(whiteboardService.updateVisibility(owner, id, body.isPublic()));
    }

    private ResponseEntity<byte[]> imageResponse(Whiteboard wb, byte[] data) {
        MediaType type = wb.getPreviewContentType() != null
                ? MediaType.parseMediaType(wb.getPreviewContentType())
                : MediaType.IMAGE_PNG;
        return ResponseEntity.ok().contentType(type).body(data);
    }

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

    private Long whiteboardIdFromCode(String code) {
        long id;
        try {
            id = Base58.decodeToBigInteger(code).longValueExact();
        } catch (RuntimeException ex) {
            // Not valid Base58, or decodes to a value that doesn't fit in a long.
            // An unresolvable code can't reference a whiteboard, so treat it the
            // same as a missing one rather than letting it surface as a 500.
            throw ApiException.notFound("Whiteboard not found");
        }
        if (id < WhiteboardCodeValidator.ID_START) {
            throw ApiException.notFound("Whiteboard not found");
        }
        return id;
    }
}
