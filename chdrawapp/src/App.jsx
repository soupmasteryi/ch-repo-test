import { useEffect, useRef, useState } from "react";
import "./App.css";
import Header from "./components/Header/Header";
import Sidebar from "./components/Sidebar/Sidebar";
import Whiteboard from "./components/Whiteboard/Whiteboard";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import { createWhiteboard, getWhiteboard } from "./api/whiteboards";

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
  const canvasApiRef = useRef(null);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [loadCode, setLoadCode] = useState("");
  const [loadError, setLoadError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState(null);
  const [generateError, setGenerateError] = useState("");
  const [canvasLoadData, setCanvasLoadData] = useState(() => {
    return localStorage.getItem("canvasLoadData") ?? null;
  });

  const handleLoadSubmit = async (e) => {
    e?.preventDefault();
    const code = loadCode.trim();
    if (!code || isLoading) return;
    setLoadError("");
    setShowLoadModal(false);
    setIsLoading(true);
    try {
      const { canvasData } = await getWhiteboard({
        token: localStorage.getItem("token"),
        userId: localStorage.getItem("userId"),
        code,
      });
      localStorage.setItem("whiteboardCode", code);
      localStorage.setItem("canvasLoadData", canvasData);
      setCanvasLoadData(canvasData);
    } catch (err) {
      setIsLoading(false);
      setLoadError(err.message);
      setShowLoadModal(true);
    }
  };

  const openLoadModal = () => {
    setLoadError("");
    setShowLoadModal(true);
  };

  const openSaveModal = () => {
    setGeneratedCode(localStorage.getItem("whiteboardCode"));
    setGenerateError("");
    setShowSaveModal(true);
  };

  const handleGenerateCode = async (e) => {
    e?.preventDefault();
    if (generating) return;
    setGenerateError("");
    setGenerating(true);
    let canvasData = localStorage.getItem("canvasLoadData") ?? null;
    try {
      const whiteboard = await createWhiteboard({
        token: localStorage.getItem("token"),
        userId: localStorage.getItem("userId"),
        canvasData: localStorage.getItem("canvasLoadData"),
        previewDataUrl: canvasApiRef.current?.toPreviewDataUrl(),
      });
      setGeneratedCode(whiteboard.id);
      localStorage.setItem("whiteboardCode", whiteboard.id);
    } catch (err) {
      setGenerateError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    const match = window.location.pathname.match(/^\/wb\/(.+)$/);
    if (!match) return;
    const code = decodeURIComponent(match[1]);
    getWhiteboard({
      token: localStorage.getItem("token"),
      userId: localStorage.getItem("userId"),
      code,
    })
      .then(({ canvasData }) => {
        localStorage.setItem("whiteboardCode", code);
        console.log(`setcode: ${code}`);
        localStorage.setItem("canvasLoadData", canvasData);
        console.log(`setdata: ${canvasData.slice(0, 100)}`);
      })
      .catch((err) => {
        console.error("Failed to load whiteboard from /wb route:", err);
      })
      .finally(() => {
        /*window.history.replaceState(null, "", "/");
        setPath("/");
        window.location.reload();*/
      });
  }, []);

  if (path.startsWith("/wb/")) {
    return (
      <div className="loading-overlay" role="alert" aria-busy="true">
        <div className="loading-text">Loading...</div>
      </div>
    );
  }

  if (path === "/login") {
    return <Login />;
  }

  if (path === "/register") {
    return <Register />;
  }

  return (
    <div className="app">
      <Header onLoadClick={openLoadModal} onSaveClick={openSaveModal} />
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
          canvasApiRef={canvasApiRef}
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
            <p className="modal-warning">Any unsaved data will be lost.</p>
            <input
              type="text"
              className="load-input"
              value={loadCode}
              onChange={(e) => setLoadCode(e.target.value)}
              autoFocus
              placeholder="Code"
            />
            {loadError && <p className="modal-error">{loadError}</p>}
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

      {showSaveModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowSaveModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <form
            className="modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleGenerateCode}
          >
            <h3 className="modal-title">Save</h3>
            {generatedCode ? (
              <>
                <p className="modal-body">
                  Use this code to access this whiteboard later. You can
                  continue making editing this whiteboard, future changes are
                  saved too.
                </p>
                <input
                  type="text"
                  className="load-input"
                  value={generatedCode}
                  readOnly
                  onFocus={(e) => e.target.select()}
                />
                <div className="modal-actions">
                  <button
                    type="button"
                    className="modal-btn modal-btn-confirm"
                    onClick={() => setShowSaveModal(false)}
                  >
                    Done
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="modal-body">
                  Generate a code so you can access this whiteboard later?
                </p>
                {generateError && (
                  <p className="modal-error">{generateError}</p>
                )}
                <div className="modal-actions">
                  <button
                    type="button"
                    className="modal-btn modal-btn-cancel"
                    onClick={() => setShowSaveModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="modal-btn modal-btn-confirm"
                    disabled={generating}
                  >
                    {generating ? "Generating…" : "Generate code"}
                  </button>
                </div>
              </>
            )}
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
