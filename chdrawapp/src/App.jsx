import { useEffect, useRef, useState } from "react";
import { Routes, Route, useNavigate, useParams } from "react-router-dom";
import "./App.css";
import Header from "./components/Header/Header";
import Sidebar from "./components/Sidebar/Sidebar";
import Whiteboard from "./components/Whiteboard/Whiteboard";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import Dashboard from "./components/Dashboard/Dashboard";
import {
  createWhiteboard,
  getWhiteboard,
  updateWhiteboardTitle,
  updateWhiteboardVisibility,
} from "./api/whiteboards";
import { logout } from "./api/auth";
import { idbGet, idbRemove } from "./idb";

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

function LoadingOverlay() {
  return (
    <div className="loading-overlay" role="alert" aria-busy="true">
      <div className="loading-text">Loading...</div>
    </div>
  );
}

function WhiteboardLoader() {
  const { code: rawCode } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const code = decodeURIComponent(rawCode);
    getWhiteboard({
      userId: localStorage.getItem("userId"),
      code,
    })
      .catch((err) => {
        console.error("Failed to load whiteboard from /wb route:", err);
      })
      .finally(() => {
        navigate("/", { replace: true });
      });
  }, [rawCode, navigate]);

  return <LoadingOverlay />;
}

function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    const current = localStorage.getItem("token");
    localStorage.clear();
    const rmDone = idbRemove("canvasLoadData");

    const finish = () => navigate("/", { replace: true });

    rmDone.then(current ? logout(current) : Promise.resolve()).finally(finish);
  }, [navigate]);

  return <LoadingOverlay />;
}

function Home() {
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
  const [canvasLoadData, setCanvasLoadData] = useState(null);
  const [title, setTitle] = useState(
    () => localStorage.getItem("title") ?? "Untitled Whiteboard",
  );
  const [isPublic, setIsPublic] = useState(
    () => localStorage.getItem("isPublic") === "true",
  );

  useEffect(() => {
    idbGet("canvasLoadData").then((data) => {
      setCanvasLoadData(data ?? null);
    });
  }, []);

  const handleTitleCommit = async (newTitle) => {
    const trimmed = newTitle.trim();
    const code = localStorage.getItem("whiteboardCode");
    if (!code || !trimmed || trimmed === title) return;
    try {
      const whiteboard = await updateWhiteboardTitle({
        token: localStorage.getItem("token"),
        userId: localStorage.getItem("userId"),
        code,
        title: trimmed,
      });
      setTitle(whiteboard.title);
    } catch (err) {
      console.error("Failed to update title:", err);
      setTitle(localStorage.getItem("title") ?? "Untitled Whiteboard");
    }
  };

  const handleVisibilityToggle = async (nextIsPublic) => {
    const code = localStorage.getItem("whiteboardCode");
    if (!code) return;
    setIsPublic(nextIsPublic);
    try {
      const whiteboard = await updateWhiteboardVisibility({
        token: localStorage.getItem("token"),
        userId: localStorage.getItem("userId"),
        code,
        isPublic: nextIsPublic,
      });
      setIsPublic(whiteboard.isPublic);
    } catch (err) {
      console.error("Failed to update visibility:", err);
      setIsPublic(localStorage.getItem("isPublic") === "true");
    }
  };

  const handleLoadSubmit = async (e) => {
    e?.preventDefault();
    const code = loadCode.trim();
    if (!code || isLoading) return;
    setLoadError("");
    setShowLoadModal(false);
    setIsLoading(true);
    getWhiteboard({
      userId: localStorage.getItem("userId"),
      code,
    })
      .then(({ canvas }) => {
        setCanvasLoadData(canvas);
        setTitle(localStorage.getItem("title") ?? "Untitled Whiteboard");
        setIsPublic(localStorage.getItem("isPublic") === "true");
      })
      .catch((err) => {
        setIsLoading(false);
        setLoadError(err.message);
        setShowLoadModal(true);
        console.error("Failed to load whiteboard from /wb route:", err);
      });
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
    try {
      const whiteboard = await createWhiteboard({
        token: localStorage.getItem("token"),
        userId: localStorage.getItem("userId"),
        title: localStorage.getItem("title") ?? "Untitled Whiteboard",
        canvasData: await idbGet("canvasLoadData"),
        previewDataUrl: canvasApiRef.current?.toPreviewDataUrl(),
      });
      setGeneratedCode(whiteboard.id);
      localStorage.setItem("whiteboardCode", whiteboard.id);
      setTitle(localStorage.getItem("title") ?? "Untitled Whiteboard");
      setIsPublic(localStorage.getItem("isPublic") === "true");
    } catch (err) {
      setGenerateError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="app">
      <Header
        onLoadClick={openLoadModal}
        onSaveClick={openSaveModal}
        title={title}
        onTitleCommit={handleTitleCommit}
        isPublic={isPublic}
        onVisibilityToggle={handleVisibilityToggle}
      />
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
                  continue making edits to this whiteboard, future changes are
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

      {isLoading && <LoadingOverlay />}
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/wb/:code" element={<WhiteboardLoader />} />
    </Routes>
  );
}
