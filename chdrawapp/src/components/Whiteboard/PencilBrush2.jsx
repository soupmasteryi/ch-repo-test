import { Circle, Color, Line, PencilBrush, Point, Rect } from "fabric";
import Graph from "graphology";

export default class PencilBrush2 extends PencilBrush {
  edgeLength = 70;
  angleUnit = Math.PI / 12;
  edgeStyle = "solid"

  newNodes = [];
  newEdges = [];
  prevPointWalkback = [];
  nodeStartPoint = undefined;

  _getStrokeArray() {
    if (this.edgeStyle === "solid") {
      return null;
    } else if (this.edgeStyle === "dashed") {
      return [8, 3 + 1.5 * this.width];
    } else if (this.edgeStyle === "dotted") {
      return [1, 2 + 2 * this.width];
    }
    return null;
  }

  _roundAngle(angle) {
    return Math.round(angle / this.angleUnit) * this.angleUnit;
  }

  _getNodeRadius() {
    return this.edgeLength * 0.2;
  }

  _getNodeAttachRadius() {
    return this.edgeLength * 0.3;
  }

  _getWalkbackDistance() {
    return this.edgeLength * 0.3;
  }

  _getMultiBondSeparator() {
    return 8 + this.width * 1.5;
  }

  _getTextBoxBaseLength() {
    return this.edgeLength * 0.35;
  }

  onMouseDown(pointer, ev) {
    this.canvas._moleculeStuff.graph.forEachNode((node, attr) => {
      (
        attr._obj_ref ??
        (attr._obj_ref = this.canvas
          .getObjects("Circle")
          .find((o) => o._custom_id === attr.id))
      ).set({
        fill: this.canvas._moleculeStuff.getNodeFill(
          this.canvas.backgroundColor,
        ),
      });
    });
    this.canvas.renderAll();

    const closestNode = this.canvas._moleculeStuff.getClosestNode(
      pointer,
      this._getNodeAttachRadius(),
    );
    if (closestNode) {
      this.nodeStartPoint = closestNode;
      super.onMouseDown(this.nodeStartPoint.point_coords, ev);
    } else {
      super.onMouseDown(pointer, ev);
    }
  }

  onMouseMove(pointer, ev) {
    super.onMouseMove(pointer, ev);
    const p1 = this._points[0],
      p2 = this._points[this._points.length - 1];

    if (p1 && p2) {
      if (this.prevPointWalkback.length > 0) {
        const p0 = this.prevPointWalkback[this.prevPointWalkback.length - 1];
        if (
          Math.hypot(p2.x - p0.x, p2.y - p0.y) < this._getWalkbackDistance()
        ) {
          const ctx = this.canvas.contextTop;
          this.canvas.clearContext(ctx);
          this._points = [];
          this.oldEnd = undefined;

          this.prevPointWalkback.pop();
          this.canvas.remove(
            this.newEdges.pop()._obj_ref,
            this.newNodes.pop()._obj_ref,
          );
          if (!this.nodeStartPoint && this.newNodes.length === 1) {
            this.canvas.remove(this.newNodes.pop()._obj_ref);
          }
          this.canvas.renderAll();

          super._prepareForDrawing(new Point(p0));
          return;
        }
      }

      let dx = undefined,
        dy = undefined;

      if (
        Math.hypot((dx = p1.x - p2.x), (dy = p1.y - p2.y)) >
        this.edgeLength * 0.9
      ) {
        const ctx = this.canvas.contextTop;
        this.canvas.clearContext(ctx);
        this._points = [];
        this.oldEnd = undefined;

        if (!this.nodeStartPoint && this.newNodes.length === 0) {
          const startNodeObj = new Circle({
            radius: this._getNodeRadius(),
            fill: this.canvas._moleculeStuff.getNodeFill(
              this.canvas.backgroundColor,
            ),
            left: p1.x,
            top: p1.y,
            selectable: false,
            evented: false,
            _custom_id: this.canvas._moleculeStuff.getNewNodeId(),
          });

          const startNode = {
            id: startNodeObj._custom_id,
            _obj_ref: startNodeObj,
            point_coords: p1,
          };

          this.newNodes.push(startNode);
          this.canvas.add(startNodeObj);
        }

        const correctedAngle = this._roundAngle(Math.atan2(dy, dx));
        const p2Corrected = new Point({
          x: p1.x - this.edgeLength * Math.cos(correctedAngle),
          y: p1.y - this.edgeLength * Math.sin(correctedAngle),
        });

        const currentNodeObj = new Circle({
          radius: this._getNodeRadius(),
          fill: this.canvas._moleculeStuff.getNodeFill(
            this.canvas.backgroundColor,
          ),
          left: p2Corrected.x,
          top: p2Corrected.y,
          selectable: false,
          evented: false,
          _custom_id: this.canvas._moleculeStuff.getNewNodeId(),
        });

        const currentNode = {
          id: currentNodeObj._custom_id,
          _obj_ref: currentNodeObj,
          point_coords: p2Corrected,
        };
        this.newNodes.push(currentNode);

        const edgeObj = new Line([p1.x, p1.y, p2Corrected.x, p2Corrected.y], {
          stroke: this.color,
          strokeWidth: this.width,
          strokeDashArray: this._getStrokeArray(),
          strokeLineCap: "round",
          selectable: false,
          evented: false,
          _custom_id: this.canvas._moleculeStuff.getNewEdgeId(),
        });

        const startPointIsPreexisting =
          this.nodeStartPoint && this.newNodes.length === 1;

        const prevNode = startPointIsPreexisting
          ? this.nodeStartPoint
          : this.newNodes.at(-2);

        this.newEdges.push({
          id: edgeObj._custom_id,
          _obj_ref: edgeObj,
          nodes: [
            { id: prevNode.id, point_coords: prevNode.point_coords },
            { id: currentNode.id, point_coords: currentNode.point_coords },
          ],
        });

        this.prevPointWalkback.push(p1);

        this.canvas.add(edgeObj, currentNodeObj);
        this.canvas.renderAll();

        super._prepareForDrawing(p2Corrected);
      }
    }
  }

  onMouseUp(ev) {
    const ctx = this.canvas.contextTop;
    this.canvas.clearContext(ctx);

    const points = this._points;
    this._points = [];
    this.oldEnd = undefined;

    this.canvas._moleculeStuff.graph.forEachNode((node, attr) => {
      attr._obj_ref.set({ fill: "transparent" });
    });
    this.canvas.renderAll();

    const endNode =
      this.newEdges.length <= 1 &&
      this.canvas._moleculeStuff.getClosestNode(
        points.at(-1),
        this._getNodeAttachRadius(),
      );
    const startNode = endNode && (this.nodeStartPoint ?? this.newNodes[0]);
    const edgeAttr =
      startNode &&
      this.canvas._moleculeStuff.graph.areNeighbors(endNode.id, startNode.id) &&
      this.canvas._moleculeStuff.graph.getEdgeAttributes(
        startNode.id,
        endNode.id,
      );
    if (edgeAttr && !(edgeAttr.edgeLeft && edgeAttr.edgeRight)) {
      this.newNodes.forEach((n) => {
        this.canvas.remove(n._obj_ref);
      });
      this.newEdges.forEach((e) => {
        this.canvas.remove(e._obj_ref);
      });
      let pointB, pointA, idA, idB;
      if (
        endNode.point_coords.y - startNode.point_coords.y < -0.01 ||
        (Math.abs(endNode.point_coords.y - startNode.point_coords.y) < 0.01 &&
          endNode.point_coords.x > startNode.point_coords.x)
      ) {
        idA = startNode.id;
        pointA = startNode.point_coords;
        idB = endNode.id;
        pointB = endNode.point_coords;
      } else {
        idA = endNode.id;
        pointA = endNode.point_coords;
        idB = startNode.id;
        pointB = startNode.point_coords;
      }
      let angleBA = Math.atan2(pointA.y - pointB.y, pointA.x - pointB.x);
      if (Math.abs(angleBA - 180) < 0.01) angleBA = 0;
      const angleAB = angleBA === 0 ? 0 : angleBA - Math.PI;

      let sharpestAngleB = Math.PI * 2;
      let widestAngleB = 0;
      for (const {
        neighbor: nodeId,
        attributes: node,
      } of this.canvas._moleculeStuff.graph.neighborEntries(idB)) {
        if (nodeId === idA) continue;
        const pointC = node.point_coords;
        let angleBC = Math.atan2(pointC.y - pointB.y, pointC.x - pointB.x);
        if (angleBC > angleBA) angleBC -= Math.PI * 2;
        const angleABC = angleBA - angleBC;
        sharpestAngleB = Math.min(angleABC, sharpestAngleB);
        widestAngleB = Math.max(angleABC, widestAngleB);
      }

      let sharpestAngleA = Math.PI * 2;
      let widestAngleA = 0;

      for (const {
        neighbor: nodeId,
        attributes: node,
      } of this.canvas._moleculeStuff.graph.neighborEntries(idA)) {
        if (nodeId === idB) continue;
        const pointC = node.point_coords;
        let angleAC = Math.atan2(pointC.y - pointA.y, pointC.x - pointA.x);
        if (angleAC < angleAB) angleAC += Math.PI * 2;
        const angleCAB = angleAC - angleAB;
        sharpestAngleA = Math.min(angleCAB, sharpestAngleA);
        widestAngleA = Math.max(angleCAB, widestAngleA);
      }

      let lineX1, lineY1, lineX2, lineY2;
      if (angleBA === 0) angleBA = Math.PI;
      const angleSumRight = sharpestAngleA + sharpestAngleB;
      const angleSumLeft = Math.PI * 4 - widestAngleA - widestAngleB;
      let freeEdgeSlot;
      if (
        !edgeAttr.edgeLeft &&
        (edgeAttr.edgeRight ||
          angleSumLeft - angleSumRight < -0.01 ||
          (Math.abs(angleSumLeft - angleSumRight) < 0.01 &&
            pointB.x - pointA.x < -0.01))
      ) {
        freeEdgeSlot = "edgeLeft";
        lineX1 =
          pointB.x +
          this._getMultiBondSeparator() * Math.cos(angleBA + Math.PI / 3);
        lineY1 =
          pointB.y +
          this._getMultiBondSeparator() * Math.sin(angleBA + Math.PI / 3);
        lineX2 =
          pointA.x +
          this._getMultiBondSeparator() * Math.cos(angleAB - Math.PI / 3);
        lineY2 =
          pointA.y +
          this._getMultiBondSeparator() * Math.sin(angleAB - Math.PI / 3);
      } else {
        freeEdgeSlot = "edgeRight";
        lineX1 =
          pointB.x +
          this._getMultiBondSeparator() * Math.cos(angleBA - Math.PI / 3);
        lineY1 =
          pointB.y +
          this._getMultiBondSeparator() * Math.sin(angleBA - Math.PI / 3);
        lineX2 =
          pointA.x +
          this._getMultiBondSeparator() * Math.cos(angleAB + Math.PI / 3);
        lineY2 =
          pointA.y +
          this._getMultiBondSeparator() * Math.sin(angleAB + Math.PI / 3);
      }
      const multipliedEdgeObj = new Line([lineX1, lineY1, lineX2, lineY2], {
        stroke: new Color(this.color).setAlpha(1).toRgba(),
        strokeWidth: this.width,
        strokeLineCap: "round",
        strokeDashArray: this._getStrokeArray(),
        selectable: false,
        evented: false,
        _custom_id: this.canvas._moleculeStuff.getNewEdgeId(),
      });
      this.canvas._moleculeStuff.graph.mergeEdgeWithKey(
        edgeAttr.id,
        startNode.id,
        endNode.id,
        {
          [freeEdgeSlot]: {
            id: multipliedEdgeObj._custom_id,
            _obj_ref: multipliedEdgeObj,
          },
        },
      );
      this.canvas.add(multipliedEdgeObj);
      this.canvas.fire("custom:moleculeEdgeMultiply", {
        multipliedEdge: {
          id: edgeAttr.id,
          nodes: edgeAttr.nodes,
        },
        slot: freeEdgeSlot,
        id: multipliedEdgeObj._custom_id,
        _obj_ref: multipliedEdgeObj,
      });
      this.canvas.renderAll();
    } else if (this.newNodes.length > 0) {
      this.canvas.fire("custom:moleculePathAdd", {
        newNodes: this.newNodes.slice(),
        newEdges: this.newEdges.slice(),
        nodeStartPoint: this.nodeStartPoint,
        firstNodeCreatedByBrush: this.nodeStartPoint === undefined,
      });
    }

    this.nodeStartPoint = undefined;
    this.newNodes = [];
    this.newEdges = [];
    this.prevPointWalkback = [];
  }
}
