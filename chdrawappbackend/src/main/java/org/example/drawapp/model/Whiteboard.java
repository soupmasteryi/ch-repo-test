package org.example.drawapp.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.example.drawapp.validation.WhiteboardCodeValidator;

import java.time.Instant;

@Entity
@Table(name = "whiteboards")
@Getter
@Setter
public class Whiteboard {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "whiteboard_id_seq")
    @SequenceGenerator(
            name = "whiteboard_id_seq",
            sequenceName = "whiteboard_id_seq",
            initialValue = WhiteboardCodeValidator.ID_START,
            allocationSize = 1)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "preview", columnDefinition = "bytea")
    private byte[] preview;

    @Column(name = "preview_content_type")
    private String previewContentType;

    @Column(name = "canvas", columnDefinition = "bytea")
    private byte[] canvas;

    @Column(name = "is_public", nullable = false)
    @ColumnDefault("false")
    private boolean isPublic = false;

    @Column(name = "title", nullable = false)
    @ColumnDefault("'Untitled Whiteboard'")
    private String title;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    public Whiteboard() {
    }
}
