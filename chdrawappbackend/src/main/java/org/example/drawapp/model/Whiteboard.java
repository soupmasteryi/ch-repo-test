package org.example.drawapp.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "whiteboards")
public class Whiteboard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @jakarta.persistence.JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "preview", columnDefinition = "bytea")
    private byte[] preview;

    @Column(name = "preview_content_type")
    private String previewContentType;

    @Column(name = "canvas", columnDefinition = "bytea")
    private byte[] canvas;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    public Whiteboard() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public byte[] getPreview() {
        return preview;
    }

    public void setPreview(byte[] preview) {
        this.preview = preview;
    }

    public String getPreviewContentType() {
        return previewContentType;
    }

    public void setPreviewContentType(String previewContentType) {
        this.previewContentType = previewContentType;
    }

    public byte[] getCanvas() {
        return canvas;
    }

    public void setCanvas(byte[] canvas) {
        this.canvas = canvas;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
