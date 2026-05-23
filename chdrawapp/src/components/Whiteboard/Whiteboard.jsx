import { useEffect, useRef, useState } from "react";

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;
import { Canvas, PencilBrush, Line, Rect, Ellipse } from "fabric";
import "./Whiteboard.css";

export default function Whiteboard({ tool, color }) {
  const containerRef = useRef(null);
  const canvasElRef = useRef(null);
  const fabricRef = useRef(null);
  const [pageHeight, setPageHeight] = useState(A4_HEIGHT);
  // Live values read by the long-lived fabric event handlers.
  const toolRef = useRef(tool);
  const colorRef = useRef(color);

  // Initialize the fabric canvas once.
  useEffect(() => {
    const canvas = new Canvas(canvasElRef.current, {
      backgroundColor: "#ffffff",
      selection: false,
    });
    fabricRef.current = canvas;

    const brush = new PencilBrush(canvas);
    canvas.freeDrawingBrush = brush;

    canvas.setDimensions({ width: A4_WIDTH, height: A4_HEIGHT });
    canvas.renderAll();

    let shape = null;
    let origin = null;

    const onMouseDown = (opt) => {
      const t = toolRef.current;
      if (t === "pencil") return;

      const p = canvas.getScenePoint(opt.e);
      origin = { x: p.x, y: p.y };
      const stroke = colorRef.current;

      if (t === "line") {
        shape = new Line([p.x, p.y, p.x, p.y], {
          stroke,
          strokeWidth: 3,
          selectable: false,
          evented: false,
        });
      } else if (t === "rectangle") {
        shape = new Rect({
          left: p.x,
          top: p.y,
          width: 0,
          height: 0,
          fill: "transparent",
          stroke,
          strokeWidth: 3,
          selectable: false,
          evented: false,
        });
      } else if (t === "circle") {
        shape = new Ellipse({
          left: p.x,
          top: p.y,
          rx: 0,
          ry: 0,
          fill: "transparent",
          stroke,
          strokeWidth: 3,
          selectable: false,
          evented: false,
        });
      }

      if (shape) canvas.add(shape);
    };

    const onMouseMove = (opt) => {
      if (!shape || !origin) return;
      const p = canvas.getScenePoint(opt.e);
      const t = toolRef.current;

      if (t === "line") {
        shape.set({ x2: p.x, y2: p.y });
      } else if (t === "rectangle") {
        shape.set({
          left: Math.min(origin.x, p.x),
          top: Math.min(origin.y, p.y),
          width: Math.abs(p.x - origin.x),
          height: Math.abs(p.y - origin.y),
        });
      } else if (t === "circle") {
        shape.set({
          left: Math.min(origin.x, p.x),
          top: Math.min(origin.y, p.y),
          rx: Math.abs(p.x - origin.x) / 2,
          ry: Math.abs(p.y - origin.y) / 2,
        });
      }
      shape.setCoords();
      canvas.renderAll();
    };

    const onMouseUp = () => {
      shape = null;
      origin = null;
    };

    canvas.on("mouse:down", onMouseDown);
    canvas.on("mouse:move", onMouseMove);
    canvas.on("mouse:up", onMouseUp);

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
  }, []);

  // Apply tool / color changes to the canvas.
  useEffect(() => {
    toolRef.current = tool;
    colorRef.current = color;
    const canvas = fabricRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = tool === "pencil";
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = color;
      canvas.freeDrawingBrush.width = 3;
    }
  }, [tool, color]);

  const extendCanvas = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const newHeight = pageHeight + A4_HEIGHT;
    canvas.setDimensions({ width: A4_WIDTH, height: newHeight });
    canvas.renderAll();
    setPageHeight(newHeight);
  };

  return (
    <div className="whiteboard" ref={containerRef}>
      <div className="whiteboard-stack">
        <div className="whiteboard-page" style={{ height: pageHeight }}>
          <canvas ref={canvasElRef} />
        </div>
        <button type="button" className="whiteboard-extend" onClick={extendCanvas}>
          Extend canvas
        </button>
      </div>
    </div>
  );
}
