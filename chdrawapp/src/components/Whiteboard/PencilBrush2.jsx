import { Circle, Color, Line, PencilBrush, Point, Rect } from "fabric";

export default class PencilBrush2 extends PencilBrush {
  edgeLength = 70;
  newNodes = [];
  newEdges = [];
  prevPointWalkback = [];
  nodeStartPoint = undefined;

  angleUnit = Math.PI / 12;

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

  onMouseDown(pointer, ev) {
    this.canvas._moleculeStuff.graph.forEachNode((node, attr) => {
      (
        attr._obj_ref ??
        (attr._obj_ref = this.canvas
          .getObjects("Circle")
          .find((o) => o._custom_id == attr.id))
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
          nodes: [{ ...prevNode }, { ...currentNode }],
        });

        this.prevPointWalkback.push(p1);

        this.canvas.add(edgeObj, currentNodeObj);
        this.canvas.renderAll();

        super._prepareForDrawing(p2Corrected);
      }
    }
  }

  onMouseUp(pointer, ev) {
    const ctx = this.canvas.contextTop;
    this.canvas.clearContext(ctx);
    this._points = [];
    this.oldEnd = undefined;

    this.canvas._moleculeStuff.graph.forEachNode((node, attr) => {
      attr._obj_ref.set({ fill: "transparent" });
    });
    this.canvas.renderAll();

    if (this.newNodes.length > 0) {
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
