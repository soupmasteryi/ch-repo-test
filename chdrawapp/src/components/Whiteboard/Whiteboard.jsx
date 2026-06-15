import { useEffect, useRef, useState } from "react";
import {
  Canvas,
  Line,
  Rect,
  Ellipse,
  PencilBrush,
  Circle,
  Color,
  Point,
  util,
} from "fabric";
import { UndirectedGraph } from "graphology";

import "./Whiteboard.css";
import MoleculeStuff from "./MoleculeStuff";
import makeMouseSafeBrush from "./makeMouseSafeBrush";
import StraightArrowBrush from "./StraightArrowBrush";
import CurvedArrowBrush from "./CurvedArrowBrush";
import CircleBrush from "./CircleBrush";
import PencilBrush2 from "./PencilBrush2";

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;

export default function Whiteboard({
  tool,
  color,
  thickness,
  edgeLength,
  lineStyle,
  clearSignal,
  historyApiRef,
  canvasLoadData,
  setCanvasLoadData,
  setIsLoading,
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
    const canvas = new Canvas(canvasElRef.current, {
      backgroundColor: "#ffffff",
      selection: false,
    });

    canvas._history = {
      undoStack: [],
      redoStack: [],
    };

    canvas._moleculeStuff = new MoleculeStuff();

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
            node.point_coords,
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
        if (overlappedNode && edge.nodes[1].id === overlappingNode.id) {
          lastEdgeIndex = ind + 1;
          edge.nodes[1] = { ...overlappedNode };
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
            x2: overlappedNode.point_coords.x,
            y2: overlappedNode.point_coords.y,
          });
          canvas._moleculeStuff.graph.addEdgeWithKey(
            edge.id,
            edge.nodes[0].id,
            edge.nodes[1].id,
            { ...edge },
          );
          break;
        }
        edge._obj_ref.set({ stroke: colorRef.current });
        canvas._moleculeStuff.graph.addEdgeWithKey(
          edge.id,
          edge.nodes[0].id,
          edge.nodes[1].id,
          { ...edge },
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

      if (ev.newNodes.length > 0 || ev.newEdges.length > 0) {
        pushHistory({
          type: "moleculePathAdd",
          object: {
            newNodes: ev.newNodes,
            newEdges: ev.newEdges,
          },
        });
      }
    };

    const onMoleculeEdgeMultiply = (ev) => {
      pushHistory({ type: "moleculeEdgeMultiply", object: ev });
    };

    canvas.on("mouse:down", onMouseDown);
    canvas.on("mouse:move", onMouseMove);
    canvas.on("mouse:up", onMouseUp);
    canvas.on("path:created", onPathCreated);
    canvas.on("custom:moleculePathAdd", onMoleculePathAdd);
    canvas.on("custom:moleculeEdgeMultiply", onMoleculeEdgeMultiply);

    const undo = () => {
      const op = canvas._history.undoStack.pop();
      if (!op) return;
      isRestoringRef.current = true;
      if (op.type === "addBasic") {
        canvas.remove(op.object);
      } else if (op.type === "moleculePathAdd") {
        op.object.newEdges.forEach((e) => {
          canvas._moleculeStuff.graph.dropEdge(e.id);
          canvas.remove(
            e._obj_ref ??
              (e._obj_ref = canvas
                .getObjects("Line")
                .find((o) => o._custom_id === e.id)),
          );
        });
        op.object.newNodes.forEach((n) => {
          canvas._moleculeStuff.graph.dropNode(n.id);
          canvas.remove(
            n._obj_ref ??
              (n._obj_ref = canvas
                .getObjects("Circle")
                .find((o) => o._custom_id === n.id)),
          );
        });
      } else if (op.type === "moleculeEdgeMultiply") {
        const edge = op.object;
        const graphEdge = edge.multipliedEdge;
        canvas._moleculeStuff.graph.mergeEdgeWithKey(
          graphEdge.id,
          graphEdge.nodes[0].id,
          graphEdge.nodes[1].id,
          {
            [edge.slot]: undefined,
          },
        );
        canvas.remove(
          edge._obj_ref ??
            (edge._obj_ref = canvas
              .getObjects("Line")
              .find((o) => o._custom_id === edge.id)),
        );
      }
      canvas._history.redoStack.push(op);

      console.log(
        JSON.stringify(
          (() => {
            const forceInclude = [
              "_moleculeStuff",
              "_history",
              "_obj_ref",
              "_custom_id",
              "selectable",
              "evented",
            ];
            const c = canvas.toObject(forceInclude);
            for (const op of c._history.redoStack) {
              if (op.type === "moleculePathAdd") {
                op.object.newNodes.forEach((n) => {
                  n._obj_data = n._obj_ref.toObject(forceInclude);
                });
                op.object.newEdges.forEach((e) => {
                  e._obj_data = e._obj_ref.toObject(forceInclude);
                });
              } else if (op.type === "moleculeEdgeMultiply") {
                op.object._obj_data = op.object._obj_ref.toObject(forceInclude);
              }
            }
            return c;
          })(),
          (k, v) => (k === "_obj_ref" ? null : v),
        ),
      );
      canvas.renderAll();
      isRestoringRef.current = false;
    };

    const redo = () => {
      const op = canvas._history.redoStack.pop();
      if (!op) return;
      isRestoringRef.current = true;
      if (op.type === "addBasic") {
        canvas.add(op.object);
      } else if (op.type === "moleculePathAdd") {
        op.object.newNodes.forEach((n) => {
          canvas._moleculeStuff.graph.addNode(n.id, n);
          canvas.add(n._obj_ref);
        });
        op.object.newEdges.forEach((e) => {
          canvas._moleculeStuff.graph.addEdgeWithKey(
            e.id,
            e.nodes[0].id,
            e.nodes[1].id,
            e,
          );
          canvas.add(e._obj_ref);
        });
      } else if (op.type === "moleculeEdgeMultiply") {
        const edge = op.object;
        const graphEdge = edge.multipliedEdge;
        canvas._moleculeStuff.graph.mergeEdgeWithKey(
          graphEdge.id,
          graphEdge.nodes[0].id,
          graphEdge.nodes[1].id,
          {
            [edge.slot]: {
              id: edge._obj_ref._custom_id,
              _obj_ref: edge._obj_ref,
            },
          },
        );
        canvas.add(edge._obj_ref);
      }
      canvas._history.undoStack.push(op);
      canvas.renderAll();
      isRestoringRef.current = false;
    };

    if (historyApiRef) {
      historyApiRef.current = {
        undo,
        redo,
      };
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
  }, []);

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
    if (canvas._brushes?.pencil2) {
      canvas._brushes.pencil2.edgeLength = edgeLength;
      canvas._brushes.pencil2.edgeStyle = lineStyle;
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
  }, [tool, color, thickness, edgeLength, lineStyle]);

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

  useEffect(() => {
    if (!canvasLoadData || !fabricRef.current) {
      return;
    }
    const canvas = fabricRef.current;
    const abortController = new AbortController();
    canvas
      .loadFromJSON(
        JSON.parse(canvasLoadData, (k, v) => {
          if (k === "_moleculeStuff") {
            return new MoleculeStuff({
              ...v,
              graph: new UndirectedGraph({ allowSelfLoops: false }).import(
                v.graph,
              ),
            });
          } else if (k === "point_coords") {
            return new Point(v);
          }
          return v;
        }),
        undefined,
        {
          signal: abortController.signal,
        },
      )
      .then((cnv) => {
        const promises = [];
        for (const op of cnv._history.redoStack) {
          if (op.type === "moleculePathAdd") {
            op.object.newNodes.forEach((n) => {
              promises.push(
                util.enlivenObjects([n._obj_data]).then(([obj_data]) => {
                  n._obj_ref = obj_data;
                }),
              );
            });
            op.object.newEdges.forEach((e) => {
              promises.push(
                util.enlivenObjects([e._obj_data]).then(([obj_data]) => {
                  e._obj_ref = obj_data;
                }),
              );
            });
          } else if (op.type === "moleculeEdgeMultiply") {
            promises.push(
              util.enlivenObjects([op.object._obj_data]).then(([obj_data]) => {
                op.object._obj_ref = obj_data;
              }),
            );
          }
        }
        Promise.all(promises).then(() => {
          console.log(
            JSON.stringify(
              cnv.toObject([
                "_moleculeStuff",
                "_history",
                "_obj_ref",
                "_custom_id",
                "selectable",
                "evented",
              ]),
            ),
          );
          cnv.renderAll();
          setCanvasLoadData(null);
          setIsLoading(false);
        });
      })
      .catch((ev) => {
        if (
          ev.target instanceof AbortSignal &&
          ev.target.reason.name === "AbortError"
        ) {
          return;
        }
        throw ev;
      });

    return () => {
      setCanvasLoadData(null);
      setIsLoading(false);
      abortController.abort();
    };
  }, [canvasLoadData]);

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
