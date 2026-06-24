package org.example.drawapp.controller;

import org.example.drawapp.exception.ApiException;
import org.example.drawapp.security.AuthPrincipal;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

/**
 * Regression tests for the whiteboard-code decoding guard. A malformed or
 * out-of-range {@code wb/{code}} must surface as a clean 404 rather than an
 * unhandled exception (which the global handler would turn into a 500).
 */
class WhiteboardControllerTest {

    // Service is never reached on the bad-code paths: the code is decoded
    // before any lookup, so a null service is sufficient for these cases.
    private final WhiteboardController controller = new WhiteboardController(null);

    private final UUID userId = UUID.randomUUID();
    private final AuthPrincipal principal =
            new AuthPrincipal(userId, "user@example.com", UUID.randomUUID());

    @Test
    void getCanvas_withNonBase58Code_returnsNotFoundInsteadOf500() {
        ApiException ex = assertThrows(ApiException.class,
                () -> controller.getCanvas(userId.toString(), "0O0Il", principal));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatus());
    }

    @Test
    void getCanvas_withCodeBelowIdStart_returnsNotFound() {
        // "2" decodes to 1 in Base58, which is below ID_START.
        ApiException ex = assertThrows(ApiException.class,
                () -> controller.getCanvas(userId.toString(), "2", principal));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatus());
    }
}
