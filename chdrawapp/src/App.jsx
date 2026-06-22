import { useEffect, useRef, useState } from "react";
import "./App.css";
import Header from "./components/Header/Header";
import Sidebar from "./components/Sidebar/Sidebar";
import Whiteboard from "./components/Whiteboard/Whiteboard";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";

const COLORS = [
  "#000000",
  "#ffffff",
  "#e63946",
  "#f4a261",
  "#f9c74f",
  "#2a9d8f",
  "#1d7be3",
  "#7b2ff7",
];

export default function App() {
  const [tool, setTool] = useState("pencil");
  const [color, setColor] = useState(COLORS[0]);
  const [thicknessByTool, setThicknessByTool] = useState({
    pencil: 3,
    line: 3,
    arrow: 3,
    rectangle: 3,
    circle: 3,
  });
  const thickness = thicknessByTool[tool] ?? 3;
  const setThickness = (n) => setThicknessByTool((m) => ({ ...m, [tool]: n }));
  const [edgeLength, setEdgeLength] = useState(70);
  const [lineStyle, setLineStyle] = useState("solid");
  const [path, setPath] = useState(window.location.pathname);
  const [clearSignal, setClearSignal] = useState(0);
  const historyApiRef = useRef(null);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [loadCode, setLoadCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [canvasLoadData, setCanvasLoadData] = useState(() => {
    return localStorage.getItem("canvasLoadData");
  });

  const handleLoadSubmit = (e) => {
    e?.preventDefault();
    setShowLoadModal(false);
    setIsLoading(true);
    setTimeout(() => {
      setCanvasLoadData(STR);
    }, 2000);
  };

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  if (path === "/login") {
    return <Login />;
  }

  if (path === "/register") {
    return <Register />;
  }

  return (
    <div className="app">
      <Header onLoadClick={() => setShowLoadModal(true)} />
      <div className="app-body">
        <Sidebar
          tool={tool}
          onToolChange={setTool}
          color={color}
          onColorChange={setColor}
          colors={COLORS}
          thickness={thickness}
          onThicknessChange={setThickness}
          edgeLength={edgeLength}
          onEdgeLengthChange={setEdgeLength}
          lineStyle={lineStyle}
          onLineStyleChange={setLineStyle}
          onClearCanvas={() => setClearSignal((n) => n + 1)}
          onUndo={() => historyApiRef.current?.undo()}
          onRedo={() => historyApiRef.current?.redo()}
        />
        <Whiteboard
          tool={tool}
          color={color}
          thickness={thickness}
          edgeLength={edgeLength}
          lineStyle={lineStyle}
          clearSignal={clearSignal}
          historyApiRef={historyApiRef}
          canvasLoadData={canvasLoadData}
          setCanvasLoadData={setCanvasLoadData}
          setIsLoading={setIsLoading}
        />
      </div>

      {showLoadModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowLoadModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <form
            className="modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleLoadSubmit}
          >
            <h3 className="modal-title">Load</h3>
            <p className="modal-body">Enter a code to load.</p>
            <input
              type="text"
              className="load-input"
              value={loadCode}
              onChange={(e) => setLoadCode(e.target.value)}
              autoFocus
              placeholder="Code"
            />
            <div className="modal-actions">
              <button
                type="button"
                className="modal-btn modal-btn-cancel"
                onClick={() => setShowLoadModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="modal-btn modal-btn-confirm">
                Submit
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading && (
        <div className="loading-overlay" role="alert" aria-busy="true">
          <div className="loading-text">Loading...</div>
        </div>
      )}
    </div>
  );
}
