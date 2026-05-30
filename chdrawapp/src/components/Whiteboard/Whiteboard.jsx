import { useEffect, useRef, useState } from "react";
import { Canvas, Line, Rect, Ellipse, PencilBrush } from "fabric";

import "./Whiteboard.css";
import MakeMouseSafeBrush from "./MakeMouseSafeBrush";
import StraightArrowBrush from "./StraightArrowBrush";
import CurvedArrowBrush from "./CurvedArrowBrush";
import CircleBrush from "./CircleBrush";

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;

export default function Whiteboard({
  tool,
  color,
  thickness,
  clearSignal,
  historyApiRef,
}) {
  const containerRef = useRef(null);
  const canvasElRef = useRef(null);
  const fabricRef = useRef(null);
  const [pageHeight, setPageHeight] = useState(A4_HEIGHT);

  const toolRef = useRef(tool);
  const colorRef = useRef(color);
  const thicknessRef = useRef(thickness);
  const undoStackRef = useRef([]);
  const redoStackRef = useRef([]);
  const isMouseDown = useRef(false);
  const isRestoringRef = useRef(false);

  useEffect(() => {
    const canvas = new Canvas(canvasElRef.current, {
      backgroundColor: "#ffffff",
      selection: false,
    });
    fabricRef.current = canvas;

    const pencilBrush = MakeMouseSafeBrush(new PencilBrush(canvas));
    const arrowBrush = MakeMouseSafeBrush(new StraightArrowBrush(canvas));
    const curvedArrowBrush = MakeMouseSafeBrush(new CurvedArrowBrush(canvas));
    const circleBrush = MakeMouseSafeBrush(new CircleBrush(canvas));
    canvas.freeDrawingBrush = pencilBrush;
    canvas._brushes = {
      pencil: pencilBrush,
      arrow: arrowBrush,
      curvedArrow: curvedArrowBrush,
      circleBrush: circleBrush,
    };

    canvas.setDimensions({ width: A4_WIDTH, height: A4_HEIGHT });
    canvas.renderAll();

    const pushHistory = (op) => {
      if (isRestoringRef.current) return;
      undoStackRef.current.push(op);
      redoStackRef.current = [];
    };

    let shape = null;
    let origin = null;

    const onMouseDown = (opt) => {
      if (isMouseDown.current) return;
      isMouseDown.current = true;
      const t = toolRef.current;
      if (t === "pencil" || t === "arrow" || t === "curvedArrow" || t === "circleBrush") return;

      const p = canvas.getScenePoint(opt.e);
      origin = { x: p.x, y: p.y };
      const stroke = colorRef.current;

      if (t === "line") {
        shape = new Line([p.x, p.y, p.x, p.y], {
          stroke,
          strokeWidth: thicknessRef.current,
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
          strokeWidth: thicknessRef.current,
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
          strokeWidth: thicknessRef.current,
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
      if (!isMouseDown.current) return;
      isMouseDown.current = false;
      if (shape) {
        pushHistory({ type: "add", object: shape });
      }
      shape = null;
      origin = null;
    };

    const onPathCreated = (e) => {
      // Pencil stroke: fabric commits the whole mousedown→mouseup path as one Path object.
      e.path.set({ selectable: false, evented: false });
      pushHistory({ type: "add", object: e.path });
    };

    canvas.on("mouse:down", onMouseDown);
    canvas.on("mouse:move", onMouseMove);
    canvas.on("mouse:up", onMouseUp);
    canvas.on("path:created", onPathCreated);

    const undo = () => {
      const op = undoStackRef.current.pop();
      if (!op) return;
      isRestoringRef.current = true;
      if (op.type === "add") {
        canvas.remove(op.object);
        redoStackRef.current.push(op);
      }
      canvas.renderAll();
      isRestoringRef.current = false;
    };

    const redo = () => {
      const op = redoStackRef.current.pop();
      if (!op) return;
      isRestoringRef.current = true;
      if (op.type === "add") {
        canvas.add(op.object);
        undoStackRef.current.push(op);
      }
      canvas.renderAll();
      isRestoringRef.current = false;
    };

    if (historyApiRef) {
      historyApiRef.current = { undo, redo };
    }

    const onKeyDown = (e) => {
      const key = e.key.toLowerCase();
      const isUndo = key === "z" && !e.shiftKey;
      const isRedo = (key === "z" && e.shiftKey) || key === "y";

      if (!(isUndo || isRedo)) return;

      e.preventDefault();

      if (isMouseDown.current) {
        if (canvas.isDrawingMode) {
          canvas.freeDrawingBrush.onMouseUp({
            e: new PointerEvent("pointerup", { isPrimary: true }),
          });
        } else {
          canvas.fire("mouse:up");
        }
        isMouseDown.current = false;
      }

      if (isUndo) {
        undo();
      } else if (isRedo) {
        redo();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      canvas.dispose();
      fabricRef.current = null;
      if (historyApiRef) historyApiRef.current = null;
    };
  }, [historyApiRef]);

  // Apply tool / color changes to the canvas.
  useEffect(() => {
    toolRef.current = tool;
    colorRef.current = color;
    thicknessRef.current = thickness;
    const canvas = fabricRef.current;
    if (!canvas) return;

    canvas.isDrawingMode =
      tool === "pencil" || tool === "arrow" || tool === "curvedArrow" || tool === "circleBrush";
    if (canvas._brushes) {
      const next =
        tool === "arrow"
          ? canvas._brushes.arrow
          : tool === "curvedArrow"
            ? canvas._brushes.curvedArrow
            : tool === "circleBrush"
              ? canvas._brushes.circleBrush
              : canvas._brushes.pencil;
      canvas.freeDrawingBrush = next;
    }
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = color;
      canvas.freeDrawingBrush.width = thickness;
    }
  }, [tool, color, thickness]);

  useEffect(() => {
    if (!clearSignal) return;
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.clear();
    canvas.backgroundColor = "#ffffff";
    canvas.setDimensions({ width: A4_WIDTH, height: A4_HEIGHT });
    canvas.renderAll();
    undoStackRef.current = [];
    redoStackRef.current = [];
    setPageHeight(A4_HEIGHT);
  }, [clearSignal]);

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
        <button
          type="button"
          className="whiteboard-extend"
          onClick={extendCanvas}
        >
          Extend canvas
        </button>
      </div>
    </div>
  );
}
