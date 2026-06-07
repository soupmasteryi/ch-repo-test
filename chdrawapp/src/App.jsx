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
  const [canvasLoadData, setCanvasLoadData] = useState(null);

  const STR =
    '{"version":"7.4.0","_moleculeStuff":{"nodeLabelId":9,"edgeLabelId":7,"graph":{"options":{"type":"undirected","multi":false,"allowSelfLoops":false},"attributes":{},"nodes":[{"key":"2","attributes":{"id":"2","_obj_ref":null,"point_coords":{"x":254.4717441357053,"y":249.06685358388873}}},{"key":"3","attributes":{"id":"3","_obj_ref":null,"point_coords":{"x":315.093522400616,"y":214.0668535838887}}},{"key":"4","attributes":{"id":"4","_obj_ref":null,"point_coords":{"x":375.7153006655267,"y":249.06685358388873}}},{"key":"5","attributes":{"id":"5","_obj_ref":null,"point_coords":{"x":375.7153006655267,"y":319.0668535838887}}}],"edges":[{"key":"geid_171_0","source":"2","target":"3","attributes":{"id":"1","_obj_ref":null,"nodes":[{"id":"2","_obj_ref":null,"point_coords":{"x":254.4717441357053,"y":249.06685358388873}},{"id":"3","_obj_ref":null,"point_coords":{"x":315.093522400616,"y":214.0668535838887}}]}},{"key":"geid_171_1","source":"3","target":"4","attributes":{"id":"2","_obj_ref":null,"nodes":[{"id":"3","_obj_ref":null,"point_coords":{"x":315.093522400616,"y":214.0668535838887}},{"id":"4","_obj_ref":null,"point_coords":{"x":375.7153006655267,"y":249.06685358388873}}]}},{"key":"geid_171_2","source":"4","target":"5","attributes":{"id":"3","_obj_ref":null,"nodes":[{"id":"4","_obj_ref":null,"point_coords":{"x":375.7153006655267,"y":249.06685358388873}},{"id":"5","_obj_ref":null,"point_coords":{"x":375.7153006655267,"y":319.0668535838887}}]}}]}},"_history":{"undoStack":[{"type":"moleculePathAdd","object":{"newNodes":[{"id":"2","_obj_ref":null,"point_coords":{"x":254.4717441357053,"y":249.06685358388873}},{"id":"3","_obj_ref":null,"point_coords":{"x":315.093522400616,"y":214.0668535838887}},{"id":"4","_obj_ref":null,"point_coords":{"x":375.7153006655267,"y":249.06685358388873}},{"id":"5","_obj_ref":null,"point_coords":{"x":375.7153006655267,"y":319.0668535838887}}],"newEdges":[{"id":"1","_obj_ref":null,"nodes":[{"id":"2","_obj_ref":null,"point_coords":{"x":254.4717441357053,"y":249.06685358388873}},{"id":"3","_obj_ref":null,"point_coords":{"x":315.093522400616,"y":214.0668535838887}}]},{"id":"2","_obj_ref":null,"nodes":[{"id":"3","_obj_ref":null,"point_coords":{"x":315.093522400616,"y":214.0668535838887}},{"id":"4","_obj_ref":null,"point_coords":{"x":375.7153006655267,"y":249.06685358388873}}]},{"id":"3","_obj_ref":null,"nodes":[{"id":"4","_obj_ref":null,"point_coords":{"x":375.7153006655267,"y":249.06685358388873}},{"id":"5","_obj_ref":null,"point_coords":{"x":375.7153006655267,"y":319.0668535838887}}]}]}}],"redoStack":[{"type":"moleculePathAdd","object":{"newNodes":[{"id":"6","_obj_ref":null,"point_coords":{"x":315.093522400616,"y":354.0668535838887},"_obj_data":{"radius":14,"startAngle":0,"endAngle":360,"counterClockwise":false,"type":"Circle","version":"7.4.0","originX":"center","originY":"center","left":315.0935,"top":354.0669,"width":28,"height":28,"fill":"transparent","stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0}},{"id":"7","_obj_ref":null,"point_coords":{"x":254.47174413570528,"y":319.0668535838887},"_obj_data":{"radius":14,"startAngle":0,"endAngle":360,"counterClockwise":false,"type":"Circle","version":"7.4.0","originX":"center","originY":"center","left":254.4717,"top":319.0669,"width":28,"height":28,"fill":"transparent","stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0}}],"newEdges":[{"id":"4","_obj_ref":null,"nodes":[{"id":"5","_obj_ref":null,"point_coords":{"x":375.7153006655267,"y":319.0668535838887}},{"id":"6","_obj_ref":null,"point_coords":{"x":315.093522400616,"y":354.0668535838887}}],"_obj_data":{"type":"Line","version":"7.4.0","originX":"center","originY":"center","left":345.4044,"top":336.5669,"width":60.6218,"height":35,"fill":"rgb(0,0,0)","stroke":"#000000","strokeWidth":3,"strokeDashArray":null,"strokeLineCap":"round","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"x1":30.310889132455344,"x2":-30.310889132455344,"y1":-17.5,"y2":17.5}},{"id":"5","_obj_ref":null,"nodes":[{"id":"6","_obj_ref":null,"point_coords":{"x":315.093522400616,"y":354.0668535838887}},{"id":"7","_obj_ref":null,"point_coords":{"x":254.47174413570528,"y":319.0668535838887}}],"_obj_data":{"type":"Line","version":"7.4.0","originX":"center","originY":"center","left":284.7826,"top":336.5669,"width":60.6218,"height":35,"fill":"rgb(0,0,0)","stroke":"#000000","strokeWidth":3,"strokeDashArray":null,"strokeLineCap":"round","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"x1":30.310889132455358,"x2":-30.310889132455358,"y1":17.5,"y2":-17.5}},{"id":"6","_obj_ref":null,"nodes":[{"id":"7","_obj_ref":null,"point_coords":{"x":254.47174413570528,"y":319.0668535838887}},{"id":"2","_obj_ref":null,"point_coords":{"x":254.4717441357053,"y":249.06685358388873}}],"_obj_data":{"type":"Line","version":"7.4.0","originX":"center","originY":"center","left":254.4717,"top":284.0669,"width":0,"height":70,"fill":"rgb(0,0,0)","stroke":"#000000","strokeWidth":3,"strokeDashArray":null,"strokeLineCap":"round","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"x1":-1.4210854715202004e-14,"x2":1.4210854715202004e-14,"y1":34.999999999999986,"y2":-34.999999999999986}}]}}]},"objects":[{"radius":14,"startAngle":0,"endAngle":360,"counterClockwise":false,"_custom_id":"2","type":"Circle","version":"7.4.0","originX":"center","originY":"center","left":254.4717,"top":249.0669,"width":28,"height":28,"fill":"transparent","stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0},{"_custom_id":"1","type":"Line","version":"7.4.0","originX":"center","originY":"center","left":284.7826,"top":231.5669,"width":60.6218,"height":35,"fill":"rgb(0,0,0)","stroke":"#000000","strokeWidth":3,"strokeDashArray":null,"strokeLineCap":"round","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"x1":-30.310889132455344,"x2":30.310889132455344,"y1":17.500000000000014,"y2":-17.500000000000014},{"radius":14,"startAngle":0,"endAngle":360,"counterClockwise":false,"_custom_id":"3","type":"Circle","version":"7.4.0","originX":"center","originY":"center","left":315.0935,"top":214.0669,"width":28,"height":28,"fill":"transparent","stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0},{"_custom_id":"2","type":"Line","version":"7.4.0","originX":"center","originY":"center","left":345.4044,"top":231.5669,"width":60.6218,"height":35,"fill":"rgb(0,0,0)","stroke":"#000000","strokeWidth":3,"strokeDashArray":null,"strokeLineCap":"round","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"x1":-30.310889132455344,"x2":30.310889132455344,"y1":-17.500000000000014,"y2":17.500000000000014},{"radius":14,"startAngle":0,"endAngle":360,"counterClockwise":false,"_custom_id":"4","type":"Circle","version":"7.4.0","originX":"center","originY":"center","left":375.7153,"top":249.0669,"width":28,"height":28,"fill":"transparent","stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0},{"_custom_id":"3","type":"Line","version":"7.4.0","originX":"center","originY":"center","left":375.7153,"top":284.0669,"width":0,"height":70,"fill":"rgb(0,0,0)","stroke":"#000000","strokeWidth":3,"strokeDashArray":null,"strokeLineCap":"round","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"x1":0,"x2":0,"y1":-34.999999999999986,"y2":34.999999999999986},{"radius":14,"startAngle":0,"endAngle":360,"counterClockwise":false,"_custom_id":"5","type":"Circle","version":"7.4.0","originX":"center","originY":"center","left":375.7153,"top":319.0669,"width":28,"height":28,"fill":"transparent","stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0}],"background":"#ffffff"}';
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
