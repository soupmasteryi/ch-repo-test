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
}) {
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
    </aside>
  );
}
