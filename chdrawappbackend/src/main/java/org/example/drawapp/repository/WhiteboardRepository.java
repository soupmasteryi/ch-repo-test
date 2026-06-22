package org.example.drawapp.repository;

import org.example.drawapp.model.Whiteboard;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WhiteboardRepository extends JpaRepository<Whiteboard, Long> {

    List<Whiteboard> findByUserIdOrderByCreatedAtDesc(UUID userId);

    Optional<Whiteboard> findByIdAndUserId(Long id, UUID userId);
}
