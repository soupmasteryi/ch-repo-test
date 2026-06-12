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
  const [path, setPath] = useState(window.location.pathname);
  const [clearSignal, setClearSignal] = useState(0);
  const historyApiRef = useRef(null);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [loadCode, setLoadCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const STR =
    '{"version":"7.4.0","_moleculeStuff":{"nodeLabelId":15,"edgeLabelId":18,"graph":{"options":{"type":"undirected","multi":false,"allowSelfLoops":false},"attributes":{},"nodes":[{"key":"0","attributes":{"id":"0","_obj_ref":null,"point_coords":{"x":191.5034821709698,"y":268.0567022036572}}},{"key":"1","attributes":{"id":"1","_obj_ref":null,"point_coords":{"x":191.5034821709698,"y":338.0567022036572}}},{"key":"2","attributes":{"id":"2","_obj_ref":null,"point_coords":{"x":252.12526043588048,"y":373.0567022036572}}},{"key":"3","attributes":{"id":"3","_obj_ref":null,"point_coords":{"x":312.74703870079117,"y":338.0567022036572}}}],"edges":[{"key":"0","source":"0","target":"1","attributes":{"id":"0","_obj_ref":null,"nodes":[{"id":"0","point_coords":{"x":191.5034821709698,"y":268.0567022036572}},{"id":"1","point_coords":{"x":191.5034821709698,"y":338.0567022036572}}]}},{"key":"1","source":"1","target":"2","attributes":{"id":"1","_obj_ref":null,"nodes":[{"id":"1","point_coords":{"x":191.5034821709698,"y":338.0567022036572}},{"id":"2","point_coords":{"x":252.12526043588048,"y":373.0567022036572}}],"edgeRight":{"id":"4","_obj_ref":null}}},{"key":"2","source":"2","target":"3","attributes":{"id":"2","_obj_ref":null,"nodes":[{"id":"2","point_coords":{"x":252.12526043588048,"y":373.0567022036572}},{"id":"3","point_coords":{"x":312.74703870079117,"y":338.0567022036572}}]}}]}},"_history":{"undoStack":[{"type":"moleculePathAdd","object":{"newNodes":[{"id":"0","_obj_ref":null,"point_coords":{"x":191.5034821709698,"y":268.0567022036572}},{"id":"1","_obj_ref":null,"point_coords":{"x":191.5034821709698,"y":338.0567022036572}},{"id":"2","_obj_ref":null,"point_coords":{"x":252.12526043588048,"y":373.0567022036572}},{"id":"3","_obj_ref":null,"point_coords":{"x":312.74703870079117,"y":338.0567022036572}}],"newEdges":[{"id":"0","_obj_ref":null,"nodes":[{"id":"0","point_coords":{"x":191.5034821709698,"y":268.0567022036572}},{"id":"1","point_coords":{"x":191.5034821709698,"y":338.0567022036572}}]},{"id":"1","_obj_ref":null,"nodes":[{"id":"1","point_coords":{"x":191.5034821709698,"y":338.0567022036572}},{"id":"2","point_coords":{"x":252.12526043588048,"y":373.0567022036572}}]},{"id":"2","_obj_ref":null,"nodes":[{"id":"2","point_coords":{"x":252.12526043588048,"y":373.0567022036572}},{"id":"3","point_coords":{"x":312.74703870079117,"y":338.0567022036572}}]}]}},{"type":"moleculeEdgeMultiply","object":{"multipliedEdge":{"id":"1","nodes":[{"id":"1","point_coords":{"x":191.5034821709698,"y":338.0567022036572}},{"id":"2","point_coords":{"x":252.12526043588048,"y":373.0567022036572}}]},"slot":"edgeRight","id":"4","_obj_ref":null}}],"redoStack":[{"type":"moleculeEdgeMultiply","object":{"multipliedEdge":{"id":"5","nodes":[{"id":"3","point_coords":{"x":312.74703870079117,"y":338.0567022036572}},{"id":"5","point_coords":{"x":312.74703870079117,"y":268.0567022036572}}]},"slot":"edgeRight","id":"14","_obj_ref":null,"_obj_data":{"type":"Line","version":"7.4.0","originX":"center","originY":"center","left":323.5724,"top":303.0567,"width":0,"height":57.5,"fill":"rgb(0,0,0)","stroke":"rgba(0,0,0,1)","strokeWidth":3,"strokeDashArray":null,"strokeLineCap":"round","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"x1":0,"x2":0,"y1":-28.75,"y2":28.75}}},{"type":"moleculeEdgeMultiply","object":{"multipliedEdge":{"id":"5","nodes":[{"id":"3","point_coords":{"x":312.74703870079117,"y":338.0567022036572}},{"id":"5","point_coords":{"x":312.74703870079117,"y":268.0567022036572}}]},"slot":"edgeLeft","id":"12","_obj_ref":null,"_obj_data":{"type":"Line","version":"7.4.0","originX":"center","originY":"center","left":301.9217,"top":303.0567,"width":0,"height":57.5,"fill":"rgb(0,0,0)","stroke":"rgba(0,0,0,1)","strokeWidth":3,"strokeDashArray":null,"strokeLineCap":"round","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"x1":0,"x2":0,"y1":-28.75,"y2":28.75}}},{"type":"moleculeEdgeMultiply","object":{"multipliedEdge":{"id":"8","nodes":[{"id":"7","point_coords":{"x":252.12526043588045,"y":233.0567022036572}},{"id":"0","_obj_ref":null,"point_coords":{"x":191.5034821709698,"y":268.0567022036572}}]},"slot":"edgeRight","id":"10","_obj_ref":null,"_obj_data":{"type":"Line","version":"7.4.0","originX":"center","originY":"center","left":227.227,"top":259.9317,"width":49.7965,"height":28.75,"fill":"rgb(0,0,0)","stroke":"rgba(0,0,0,1)","strokeWidth":3,"strokeDashArray":null,"strokeLineCap":"round","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"x1":24.898230358802593,"x2":-24.898230358802593,"y1":-14.375,"y2":14.375}}},{"type":"moleculePathAdd","object":{"newNodes":[{"id":"5","_obj_ref":null,"point_coords":{"x":312.74703870079117,"y":268.0567022036572},"_obj_data":{"radius":14,"startAngle":0,"endAngle":360,"counterClockwise":false,"type":"Circle","version":"7.4.0","originX":"center","originY":"center","left":312.747,"top":268.0567,"width":28,"height":28,"fill":"transparent","stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0}},{"id":"7","_obj_ref":null,"point_coords":{"x":252.12526043588045,"y":233.0567022036572},"_obj_data":{"radius":14,"startAngle":0,"endAngle":360,"counterClockwise":false,"type":"Circle","version":"7.4.0","originX":"center","originY":"center","left":252.1253,"top":233.0567,"width":28,"height":28,"fill":"transparent","stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0}}],"newEdges":[{"id":"5","_obj_ref":null,"nodes":[{"id":"3","point_coords":{"x":312.74703870079117,"y":338.0567022036572}},{"id":"5","point_coords":{"x":312.74703870079117,"y":268.0567022036572}}],"_obj_data":{"type":"Line","version":"7.4.0","originX":"center","originY":"center","left":312.747,"top":303.0567,"width":0,"height":70,"fill":"rgb(0,0,0)","stroke":"#000000","strokeWidth":3,"strokeDashArray":null,"strokeLineCap":"round","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"x1":0,"x2":0,"y1":35,"y2":-35}},{"id":"7","_obj_ref":null,"nodes":[{"id":"5","point_coords":{"x":312.74703870079117,"y":268.0567022036572}},{"id":"7","point_coords":{"x":252.12526043588045,"y":233.0567022036572}}],"_obj_data":{"type":"Line","version":"7.4.0","originX":"center","originY":"center","left":282.4361,"top":250.5567,"width":60.6218,"height":35,"fill":"rgb(0,0,0)","stroke":"#000000","strokeWidth":3,"strokeDashArray":null,"strokeLineCap":"round","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"x1":30.310889132455358,"x2":-30.310889132455358,"y1":17.5,"y2":-17.5}},{"id":"8","_obj_ref":null,"nodes":[{"id":"7","point_coords":{"x":252.12526043588045,"y":233.0567022036572}},{"id":"0","_obj_ref":null,"point_coords":{"x":191.5034821709698,"y":268.0567022036572}}],"_obj_data":{"type":"Line","version":"7.4.0","originX":"center","originY":"center","left":221.8144,"top":250.5567,"width":60.6218,"height":35,"fill":"rgb(0,0,0)","stroke":"#000000","strokeWidth":3,"strokeDashArray":null,"strokeLineCap":"round","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"x1":30.31088913245533,"x2":-30.31088913245533,"y1":-17.5,"y2":17.5}}]}}]},"objects":[{"radius":14,"startAngle":0,"endAngle":360,"counterClockwise":false,"_custom_id":"0","type":"Circle","version":"7.4.0","originX":"center","originY":"center","left":191.5035,"top":268.0567,"width":28,"height":28,"fill":"transparent","stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0},{"_custom_id":"0","type":"Line","version":"7.4.0","originX":"center","originY":"center","left":191.5035,"top":303.0567,"width":0,"height":70,"fill":"rgb(0,0,0)","stroke":"#000000","strokeWidth":3,"strokeDashArray":null,"strokeLineCap":"round","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"x1":0,"x2":0,"y1":-35,"y2":35},{"radius":14,"startAngle":0,"endAngle":360,"counterClockwise":false,"_custom_id":"1","type":"Circle","version":"7.4.0","originX":"center","originY":"center","left":191.5035,"top":338.0567,"width":28,"height":28,"fill":"transparent","stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0},{"_custom_id":"1","type":"Line","version":"7.4.0","originX":"center","originY":"center","left":221.8144,"top":355.5567,"width":60.6218,"height":35,"fill":"rgb(0,0,0)","stroke":"#000000","strokeWidth":3,"strokeDashArray":null,"strokeLineCap":"round","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"x1":-30.310889132455344,"x2":30.310889132455344,"y1":-17.5,"y2":17.5},{"radius":14,"startAngle":0,"endAngle":360,"counterClockwise":false,"_custom_id":"2","type":"Circle","version":"7.4.0","originX":"center","originY":"center","left":252.1253,"top":373.0567,"width":28,"height":28,"fill":"transparent","stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0},{"_custom_id":"2","type":"Line","version":"7.4.0","originX":"center","originY":"center","left":282.4361,"top":355.5567,"width":60.6218,"height":35,"fill":"rgb(0,0,0)","stroke":"#000000","strokeWidth":3,"strokeDashArray":null,"strokeLineCap":"round","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"x1":-30.310889132455344,"x2":30.310889132455344,"y1":17.5,"y2":-17.5},{"radius":14,"startAngle":0,"endAngle":360,"counterClockwise":false,"_custom_id":"3","type":"Circle","version":"7.4.0","originX":"center","originY":"center","left":312.747,"top":338.0567,"width":28,"height":28,"fill":"transparent","stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0},{"_custom_id":"4","type":"Line","version":"7.4.0","originX":"center","originY":"center","left":227.227,"top":346.1817,"width":49.7965,"height":28.75,"fill":"rgb(0,0,0)","stroke":"rgba(0,0,0,1)","strokeWidth":3,"strokeDashArray":null,"strokeLineCap":"round","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"x1":-24.898230358802607,"x2":24.898230358802607,"y1":-14.375,"y2":14.375}],"background":"#ffffff"}';

  const [canvasLoadData, setCanvasLoadData] = useState(() => {
    return STR;
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
          onClearCanvas={() => setClearSignal((n) => n + 1)}
          onUndo={() => historyApiRef.current?.undo()}
          onRedo={() => historyApiRef.current?.redo()}
        />
        <Whiteboard
          tool={tool}
          color={color}
          thickness={thickness}
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
