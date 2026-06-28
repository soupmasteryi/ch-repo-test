package org.example.drawapp.service;

import org.example.drawapp.dto.WhiteboardData;
import org.example.drawapp.exception.ApiException;
import org.example.drawapp.model.User;
import org.example.drawapp.model.Whiteboard;
import org.example.drawapp.repository.UserRepository;
import org.example.drawapp.repository.WhiteboardRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class WhiteboardService {

    private final WhiteboardRepository whiteboardRepository;
    private final UserRepository userRepository;

    public WhiteboardService(WhiteboardRepository whiteboardRepository,
                             UserRepository userRepository) {
        this.whiteboardRepository = whiteboardRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<Whiteboard> list(UUID userId) {
        return whiteboardRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public Whiteboard create(UUID userId, WhiteboardData data, byte[] preview,
                             String previewContentType, byte[] canvas) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("User not found"));

        Whiteboard wb = new Whiteboard();
        wb.setUser(user);
        wb.setTitle(data.title());
        wb.setPreview(preview);
        wb.setPreviewContentType(previewContentType != null ? previewContentType : "image/png");
        wb.setCanvas(canvas);
        wb.setCreatedAt(data.createdAt() != null ? data.createdAt().toInstant() : Instant.now());
        return whiteboardRepository.save(wb);
    }

    @Transactional(readOnly = true)
    public Whiteboard getPublic(UUID userId, Long id) {
        return whiteboardRepository.findByIdAndUserId(id, userId)
                .orElseGet(() -> whiteboardRepository.findByIdAndIsPublicTrue(id)
                        .orElseThrow(() -> ApiException.notFound("Whiteboard not found")));
    }

    @Transactional(readOnly = true)
    public Whiteboard getPrivate(UUID userId, Long id) {
        return whiteboardRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> ApiException.notFound("Whiteboard not found"));
    }

    @Transactional
    public void delete(UUID userId, Long id) {
        Whiteboard wb = getPrivate(userId, id);
        whiteboardRepository.delete(wb);
    }

    @Transactional
    public Whiteboard updatePreview(UUID userId, Long id, byte[] preview, String contentType) {
        Whiteboard wb = getPrivate(userId, id);
        wb.setPreview(preview);
        wb.setPreviewContentType(contentType != null ? contentType : "image/png");
        return whiteboardRepository.save(wb);
    }

    @Transactional
    public Whiteboard updateCanvas(UUID userId, Long id, byte[] canvas) {
        Whiteboard wb = getPrivate(userId, id);
        wb.setCanvas(canvas);
        return whiteboardRepository.save(wb);
    }

    @Transactional
    public Whiteboard updateTitle(UUID userId, Long id, String title) {
        Whiteboard wb = getPrivate(userId, id);
        wb.setTitle(title);
        return whiteboardRepository.save(wb);
    }

    @Transactional
    public Whiteboard updateVisibility(UUID userId, Long id, boolean isPublic) {
        Whiteboard wb = getPrivate(userId, id);
        wb.setPublic(isPublic);
        return whiteboardRepository.save(wb);
    }
}
