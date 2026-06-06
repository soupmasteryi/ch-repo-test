import { useEffect, useRef, useState } from "react";
import {
  Canvas,
  Line,
  Rect,
  Ellipse,
  PencilBrush,
  Circle,
  Color,
} from "fabric";
import { UndirectedGraph } from "graphology";

import "./Whiteboard.css";
import makeMouseSafeBrush from "./makeMouseSafeBrush";
import StraightArrowBrush from "./StraightArrowBrush";
import CurvedArrowBrush from "./CurvedArrowBrush";
import CircleBrush from "./CircleBrush";
import PencilBrush2 from "./PencilBrush2";

const STR =
  '{"version":"7.4.0","_history":{"undoStack":[{"type":"moleculePathAdd","object":{"newNodes":[{"id":"0","_obj_ref":null,"point":{"x":307.44504388381614,"y":279.0508250887863}},{"id":"1","_obj_ref":null,"point":{"x":368.0668221487268,"y":244.0508250887863}},{"id":"3","_obj_ref":null,"point":{"x":428.6886004136375,"y":279.0508250887863}},{"id":"4","_obj_ref":null,"point":{"x":428.6886004136375,"y":349.0508250887863}}],"newEdges":[{"id":"0","_obj_ref":null,"nodes":[{"id":"0","_obj_ref":null,"point":{"x":307.44504388381614,"y":279.0508250887863}},{"id":"1","_obj_ref":null,"point":{"x":368.0668221487268,"y":244.0508250887863}}]},{"id":"2","_obj_ref":null,"nodes":[{"id":"1","_obj_ref":null,"point":{"x":368.0668221487268,"y":244.0508250887863}},{"id":"3","_obj_ref":null,"point":{"x":428.6886004136375,"y":279.0508250887863}}]},{"id":"3","_obj_ref":null,"nodes":[{"id":"3","_obj_ref":null,"point":{"x":428.6886004136375,"y":279.0508250887863}},{"id":"4","_obj_ref":null,"point":{"x":428.6886004136375,"y":349.0508250887863}}]}]}}],"redoStack":[]},"_moleculeStuff":{"nodeLabelId":5,"edgeLabelId":4,"graph":{"options":{"type":"undirected","multi":false,"allowSelfLoops":true},"attributes":{},"nodes":[{"key":"0","attributes":{"id":"0","_obj_ref":null,"point":{"x":307.44504388381614,"y":279.0508250887863}}},{"key":"1","attributes":{"id":"1","_obj_ref":null,"point":{"x":368.0668221487268,"y":244.0508250887863}}},{"key":"3","attributes":{"id":"3","_obj_ref":null,"point":{"x":428.6886004136375,"y":279.0508250887863}}},{"key":"4","attributes":{"id":"4","_obj_ref":null,"point":{"x":428.6886004136375,"y":349.0508250887863}}}],"edges":[{"key":"geid_58_0","source":"0","target":"1","attributes":{"id":"0","_obj_ref":null,"nodes":[{"id":"0","_obj_ref":null,"point":{"x":307.44504388381614,"y":279.0508250887863}},{"id":"1","_obj_ref":null,"point":{"x":368.0668221487268,"y":244.0508250887863}}]}},{"key":"geid_58_1","source":"1","target":"3","attributes":{"id":"2","_obj_ref":null,"nodes":[{"id":"1","_obj_ref":null,"point":{"x":368.0668221487268,"y":244.0508250887863}},{"id":"3","_obj_ref":null,"point":{"x":428.6886004136375,"y":279.0508250887863}}]}},{"key":"geid_58_2","source":"3","target":"4","attributes":{"id":"3","_obj_ref":null,"nodes":[{"id":"3","_obj_ref":null,"point":{"x":428.6886004136375,"y":279.0508250887863}},{"id":"4","_obj_ref":null,"point":{"x":428.6886004136375,"y":349.0508250887863}}]}}]}},"objects":[{"radius":14,"startAngle":0,"endAngle":360,"counterClockwise":false,"_custom_id":"0","type":"Circle","version":"7.4.0","originX":"center","originY":"center","left":307.445,"top":279.0508,"width":28,"height":28,"fill":"transparent","stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0},{"_custom_id":"0","type":"Line","version":"7.4.0","originX":"center","originY":"center","left":337.7559,"top":261.5508,"width":60.6218,"height":35,"fill":"rgb(0,0,0)","stroke":"#000000","strokeWidth":3,"strokeDashArray":null,"strokeLineCap":"round","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"x1":-30.310889132455344,"x2":30.310889132455344,"y1":17.500000000000014,"y2":-17.500000000000014},{"radius":14,"startAngle":0,"endAngle":360,"counterClockwise":false,"_custom_id":"1","type":"Circle","version":"7.4.0","originX":"center","originY":"center","left":368.0668,"top":244.0508,"width":28,"height":28,"fill":"transparent","stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0},{"_custom_id":"2","type":"Line","version":"7.4.0","originX":"center","originY":"center","left":398.3777,"top":261.5508,"width":60.6218,"height":35,"fill":"rgb(0,0,0)","stroke":"#000000","strokeWidth":3,"strokeDashArray":null,"strokeLineCap":"round","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"x1":-30.310889132455344,"x2":30.310889132455344,"y1":-17.500000000000014,"y2":17.500000000000014},{"radius":14,"startAngle":0,"endAngle":360,"counterClockwise":false,"_custom_id":"3","type":"Circle","version":"7.4.0","originX":"center","originY":"center","left":428.6886,"top":279.0508,"width":28,"height":28,"fill":"transparent","stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0},{"_custom_id":"3","type":"Line","version":"7.4.0","originX":"center","originY":"center","left":428.6886,"top":314.0508,"width":0,"height":70,"fill":"rgb(0,0,0)","stroke":"#000000","strokeWidth":3,"strokeDashArray":null,"strokeLineCap":"round","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"x1":0,"x2":0,"y1":-35,"y2":35},{"radius":14,"startAngle":0,"endAngle":360,"counterClockwise":false,"_custom_id":"4","type":"Circle","version":"7.4.0","originX":"center","originY":"center","left":428.6886,"top":349.0508,"width":28,"height":28,"fill":"transparent","stroke":null,"strokeWidth":1,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0}],"background":"#ffffff"}';
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
  const isMouseDown = useRef(false);
  const isRestoringRef = useRef(false);

  useEffect(() => {
    console.log(canvasElRef.current);
    const canvas = new Canvas(canvasElRef.current, {
      backgroundColor: "#ffffff",
      selection: false,
    });

    canvas._history = {
      undoStack: [],
      redoStack: [],
    };

    canvas._moleculeStuff = {
      nodeLabelId: 0,
      edgeLabelId: 0,

      getNewNodeId() {
        return "" + this.nodeLabelId++;
      },
      getNewEdgeId() {
        return "" + this.edgeLabelId++;
      },
      getNodeFill() {
        const color = new Color(canvas.backgroundColor);
        color.getSource()[0] = 255 - color.getSource()[0];
        color.getSource()[1] = 255 - color.getSource()[1];
        color.getSource()[2] = 255 - color.getSource()[2];
        return color.setAlpha(0.2).toRgba();
      },
      getClosestNode(point, distanceMargin) {
        const node = this.graph.findNode((node, attr) => {
          const dx = attr.point.x - point.x;
          const dy = attr.point.y - point.y;
          return Math.hypot(dx, dy) <= distanceMargin + 0.01;
        });
        return node ? this.graph.getNodeAttributes(node) : undefined;
      },
      graph: new UndirectedGraph(),
    };

    canvas.setDimensions({ width: A4_WIDTH, height: A4_HEIGHT });

    canvas.renderAll();
    fabricRef.current = canvas;

    const pencilBrush = makeMouseSafeBrush(new PencilBrush(canvas));
    const arrowBrush = makeMouseSafeBrush(new StraightArrowBrush(canvas));
    const curvedArrowBrush = makeMouseSafeBrush(new CurvedArrowBrush(canvas));
    const circleBrush = makeMouseSafeBrush(new CircleBrush(canvas));
    const pencil2Brush = makeMouseSafeBrush(new PencilBrush2(canvas));
    canvas.freeDrawingBrush = pencilBrush;
    canvas._brushes = {
      pencil: pencilBrush,
      arrow: arrowBrush,
      curvedArrow: curvedArrowBrush,
      circleBrush: circleBrush,
      pencil2: pencil2Brush,
    };

    const pushHistory = (op) => {
      if (isRestoringRef.current) return;
      canvas._history.undoStack.push(op);
      canvas._history.redoStack = [];
    };

    let shape = null;
    let origin = null;

    const onMouseDown = (opt) => {
      if (isMouseDown.current) return;
      isMouseDown.current = true;
      const t = toolRef.current;
      if (
        t === "pencil" ||
        t === "arrow" ||
        t === "curvedArrow" ||
        t === "circleBrush" ||
        t === "pencil2"
      )
        return;

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
        pushHistory({ type: "addBasic", object: shape });
      }
      shape = null;
      origin = null;
    };

    const onPathCreated = (ev) => {
      ev.path.set({ selectable: false, evented: false });
      pushHistory({ type: "addBasic", object: ev.path });
    };

    const onMoleculePathAdd = (ev) => {
      let overlappedNode = undefined;
      let overlappingNode = undefined;
      let overlappingNodeCutoff = undefined;
      for (const [ind, node] of ev.newNodes.entries()) {
        const firstNodeNoCheck = ev.firstNodeCreatedByBrush && ind === 0;
        if (!firstNodeNoCheck) {
          overlappedNode = canvas._moleculeStuff.getClosestNode(
            node.point,
            canvas.freeDrawingBrush._getNodeAttachRadius(),
          );
          if (overlappedNode) {
            overlappingNode = node;
            overlappingNodeCutoff = ind;
            break;
          }
        }
        node._obj_ref.set({ fill: "transparent" });
        canvas._moleculeStuff.graph.addNode(node.id, node);
      }
      let lastEdgeIndex = undefined;
      for (const [ind, edge] of ev.newEdges.entries()) {
        if (overlappedNode && edge.nodes[1] === overlappingNode) {
          lastEdgeIndex = ind + 1;
          edge.nodes[1] = overlappedNode;
          if (
            canvas._moleculeStuff.graph.areNeighbors(
              edge.nodes[0].id,
              edge.nodes[1].id,
            )
          ) {
            lastEdgeIndex = ind;
            break;
          }
          edge._obj_ref.set({
            stroke: colorRef.current,
            x2: overlappedNode.point.x,
            y2: overlappedNode.point.y,
          });
          canvas._moleculeStuff.graph.addEdge(
            edge.nodes[0].id,
            edge.nodes[1].id,
            edge,
          );
          break;
        }
        edge._obj_ref.set({ stroke: colorRef.current });
        canvas._moleculeStuff.graph.addEdge(
          edge.nodes[0].id,
          edge.nodes[1].id,
          edge,
        );
      }
      if (overlappedNode !== undefined) {
        ev.newNodes.slice(overlappingNodeCutoff).forEach((n) => {
          canvas.remove(n._obj_ref);
        });
        ev.newNodes = ev.newNodes.slice(0, overlappingNodeCutoff);
      }
      if (lastEdgeIndex !== undefined) {
        ev.newEdges.slice(lastEdgeIndex).forEach((e) => {
          canvas.remove(e._obj_ref);
        });
        ev.newEdges = ev.newEdges.slice(0, lastEdgeIndex);
      }
      canvas.renderAll();
      pushHistory({
        type: "moleculePathAdd",
        object: {
          newNodes: ev.newNodes,
          newEdges: ev.newEdges,
        },
      });
      console.log(
        JSON.stringify(
          canvas.toObject(["_history", "_moleculeStuff", "_custom_id"]),
          (key, val) => (key == "_obj_ref" ? null : val),
        ),
      );
    };

    canvas.on("mouse:down", onMouseDown);
    canvas.on("mouse:move", onMouseMove);
    canvas.on("mouse:up", onMouseUp);
    canvas.on("path:created", onPathCreated);
    canvas.on("custom:moleculePathAdd", onMoleculePathAdd);

    const undo = () => {
      const op = canvas._history.undoStack.pop();
      if (!op) return;
      isRestoringRef.current = true;
      if (op.type === "addBasic") {
        canvas.remove(op.object);
        canvas._history.redoStack.push(op);
      } else if (op.type === "moleculePathAdd") {
        op.object.newEdges.forEach((e) => {
          canvas._moleculeStuff.graph.dropEdge(e.nodes[0].id, e.nodes[1].id);
          canvas.remove(
            e._obj_ref ??
              (e._obj_ref = canvas
                .getObjects("Line")
                .find((o) => o._custom_id == e.id)),
          );
        });
        op.object.newNodes.forEach((n) => {
          canvas._moleculeStuff.graph.dropNode(n.id);
          canvas.remove(
            n._obj_ref ??
              (n._obj_ref = canvas
                .getObjects()
                .find((o) => o._custom_id == n.id)),
          );
        });
        canvas._history.redoStack.push(op);
      }
      canvas.renderAll();
      isRestoringRef.current = false;
    };

    const redo = () => {
      const op = canvas._history.redoStack.pop();
      if (!op) return;
      isRestoringRef.current = true;
      if (op.type === "addBasic") {
        canvas.add(op.object);
        canvas._history.undoStack.push(op);
      } else if (op.type === "moleculePathAdd") {
        op.object.newNodes.forEach((n) => {
          canvas._moleculeStuff.graph.addNode(n.id, n);
          canvas.add(
            n._obj_ref ??
              (n._obj_ref = canvas
                .getObjects()
                .find((o) => o._custom_id == n.id)),
          );
        });
        op.object.newEdges.forEach((e) => {
          canvas.add(
            e._obj_ref ??
              (e._obj_ref = canvas
                .getObjects("Line")
                .find((o) => o._custom_id == e.id)),
          );
          canvas._moleculeStuff.graph.addEdge(e.nodes[0].id, e.nodes[1].id, e);
        });
        canvas._history.undoStack.push(op);
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
      tool === "pencil" ||
      tool === "arrow" ||
      tool === "curvedArrow" ||
      tool === "circleBrush" ||
      tool === "pencil2";
    if (canvas._brushes) {
      const next =
        tool === "arrow"
          ? canvas._brushes.arrow
          : tool === "curvedArrow"
            ? canvas._brushes.curvedArrow
            : tool === "circleBrush"
              ? canvas._brushes.circleBrush
              : tool === "pencil2"
                ? canvas._brushes.pencil2
                : canvas._brushes.pencil;
      canvas.freeDrawingBrush = next;
    }
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = colorRef.current;
      if (canvas.freeDrawingBrush instanceof PencilBrush2) {
        canvas.freeDrawingBrush.color = new Color(canvas.freeDrawingBrush.color)
          .setAlpha(0.4)
          .toRgba();
      }
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
