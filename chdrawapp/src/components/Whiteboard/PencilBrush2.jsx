import { Circle, Color, Line, PencilBrush, Point, Rect } from "fabric";

export default class PencilBrush2 extends PencilBrush {
  edgeLength = 70;
  nodeLabelId = 0;
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

  _getNewNodeId() {
    return "" + this.nodeLabelId++;
  }

  _getWalkbackDistance() {
    return this.edgeLength * 0.3;
  }

  onMouseDown(pointer, ev) {
    this.canvas.moleculeStuff.graph.forEachNode((node, attr) => {
      attr.obj.set({ fill: this.canvas.moleculeStuff.getNodeFill() });
    });
    this.canvas.renderAll();

    const closestNodeKey = this.canvas.moleculeStuff.getClosestNode(
      pointer,
      this._getNodeRadius(),
    );
    if (closestNodeKey) {
      this.nodeStartPoint =
        this.canvas.moleculeStuff.graph.getNodeAttributes(closestNodeKey);
      console.log(this.nodeStartPoint);
      super.onMouseDown(this.nodeStartPoint.point, ev);
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
          this.canvas.remove(this.newEdges.pop().obj, this.newNodes.pop().obj);
          if (!this.nodeStartPoint && this.newNodes.length === 1) {
            this.canvas.remove(this.newNodes.pop().obj);
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

        const correctedAngle = this._roundAngle(Math.atan2(dy, dx));
        const p2Corrected = new Point({
          x: p1.x - this.edgeLength * Math.cos(correctedAngle),
          y: p1.y - this.edgeLength * Math.sin(correctedAngle),
        });

        const edgeObj = new Line([p1.x, p1.y, p2Corrected.x, p2Corrected.y], {
          stroke: this.color,
          strokeWidth: this.width,
          strokeLineCap: "round",
          selectable: false,
          evented: false,
        });

        if (!this.nodeStartPoint && this.newNodes.length === 0) {
          const startNodeObj = new Circle({
            radius: this._getNodeRadius(),
            fill: this.canvas.moleculeStuff.getNodeFill(),
            left: p1.x,
            top: p1.y,
            selectable: false,
            evented: false,
          });

          const startNode = {
            id: this._getNewNodeId(),
            obj: startNodeObj,
            point: p1,
          };

          this.newNodes.push(startNode);
          this.canvas.add(startNodeObj);
        }

        const nodeObj = new Circle({
          radius: this._getNodeRadius(),
          fill: this.canvas.moleculeStuff.getNodeFill(),
          left: p2Corrected.x,
          top: p2Corrected.y,
          selectable: false,
          evented: false,
        });

        const startPointIsPreexisting =
          this.nodeStartPoint && this.newNodes.length === 0;

        const prevNode = startPointIsPreexisting
          ? this.nodeStartPoint
          : this.newNodes.at(-1);

        const currentNode = {
          id: this._getNewNodeId(),
          obj: nodeObj,
          point: p2Corrected,
        };
        this.newNodes.push(currentNode);

        this.newEdges.push({
          obj: edgeObj,
          nodes: [currentNode, prevNode],
        });

        this.prevPointWalkback.push(p1);

        this.canvas.add(edgeObj, nodeObj);
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
    this.nodeStartPoint = undefined;

    this.canvas.moleculeStuff.graph.forEachNode((node, attr) => {
      attr.obj.set({ fill: "transparent" });
    });
    this.canvas.renderAll();

    if (this.newNodes.length > 0) {
      this.canvas.fire("custom:moleculePathAdd", {
        newNodes: this.newNodes.slice(),
        newEdges: this.newEdges.slice(),
      });

      this.newNodes = [];
      this.newEdges = [];
      this.prevPointWalkback = [];
    }
  }
}
