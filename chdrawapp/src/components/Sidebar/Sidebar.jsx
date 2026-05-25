import { useState } from "react";
import "./Sidebar.css";

const TOOLS = [
  { id: "pencil", label: "Pencil", icon: "✏️" },
  { id: "line", label: "Line", icon: "╱" },
  { id: "rectangle", label: "Rectangle", icon: "▭" },
  { id: "circle", label: "Circle", icon: "◯" },
];

export default function Sidebar({
  tool,
  onToolChange,
  color,
  onColorChange,
  colors,
  onClearCanvas,
  onUndo,
  onRedo,
}) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirm = () => {
    onClearCanvas?.();
    setShowConfirm(false);
  };

  return (
    <aside className="sidebar">
      <h1 className="sidebar-title">Whiteboard</h1>

      <section className="sidebar-section">
        <h2 className="sidebar-heading">Tools</h2>
        <div className="tool-list">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`tool-btn ${tool === t.id ? "active" : ""}`}
              onClick={() => onToolChange(t.id)}
              title={t.label}
            >
              <span className="tool-icon">{t.icon}</span>
              <span className="tool-label">{t.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="sidebar-section">
        <h2 className="sidebar-heading">History</h2>
        <div className="history-row">
          <button type="button" className="history-btn" onClick={onUndo} title="Undo (Ctrl+Z)">
            ↶ Undo
          </button>
          <button type="button" className="history-btn" onClick={onRedo} title="Redo (Ctrl+Y)">
            ↷ Redo
          </button>
        </div>
      </section>

      <section className="sidebar-section">
        <h2 className="sidebar-heading">Color</h2>
        <div className="color-grid">
          {colors.map((c) => (
            <button
              key={c}
              type="button"
              className={`color-swatch ${color === c ? "active" : ""}`}
              style={{ background: c }}
              onClick={() => onColorChange(c)}
              title={c}
            />
          ))}
        </div>
      </section>

      <div className="sidebar-footer">
        <button
          type="button"
          className="clear-btn"
          onClick={() => setShowConfirm(true)}
        >
          Clear canvas
        </button>
      </div>

      {showConfirm && (
        <div
          className="modal-overlay"
          onClick={() => setShowConfirm(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Clear canvas?</h3>
            <p className="modal-body">
              This will erase everything on the canvas. This cannot be undone.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="modal-btn modal-btn-cancel"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="modal-btn modal-btn-confirm"
                onClick={handleConfirm}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
