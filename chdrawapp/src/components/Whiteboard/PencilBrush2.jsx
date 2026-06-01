import { Circle, Color, Line, PencilBrush, Point, Rect } from "fabric";

export default class PencilBrush2 extends PencilBrush {
  edgeLength = 70;
  tempLines = [];
  prevPointWalkback = [];
  currentMoleculeNodes = [];

  angleUnit = Math.PI / 12;

  _roundAngle(angle) {
    return Math.round(angle / this.angleUnit) * this.angleUnit;
  }

  onMouseMove(pointer, ev) {
    super.onMouseMove(pointer, ev);
    const p1 = this._points[0],
      p2 = this._points[this._points.length - 1];

    if (p1 && p2) {
      if (this.prevPointWalkback.length > 0) {
        const p0 = this.prevPointWalkback[this.prevPointWalkback.length - 1];
        if (Math.hypot(p2.x - p0.x, p2.y - p0.y) < this.edgeLength * 0.2) {
          const ctx = this.canvas.contextTop;
          this.canvas.clearContext(ctx);
          this._points = [];
          this.oldEnd = undefined;

          this.prevPointWalkback.pop();
          this.canvas.remove(this.tempLines.pop());
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
        const p2Corrected = {
          x: p1.x - this.edgeLength * Math.cos(correctedAngle),
          y: p1.y - this.edgeLength * Math.sin(correctedAngle),
        };

        const edge = new Line([p1.x, p1.y, p2Corrected.x, p2Corrected.y], {
          stroke: this.color,
          strokeWidth: this.width,
          strokeLineCap: "round",
          selectable: false,
          evented: false,
        });

        const node = new Rect({
          width: this.edgeLength * 0.143,
          height: this.edgeLength * 0.143,
          fill: "blue",
          left: p2.x,
          top: p2.y
        })

        this.tempLines.push(edge);
        this.prevPointWalkback.push(p1);

        this.canvas.add(edge);
        this.canvas.renderAll();

        super._prepareForDrawing(new Point(p2Corrected));
      }
    }
  }

  onMouseUp(pointer, ev) {
    const ctx = this.canvas.contextTop;
    this.canvas.clearContext(ctx);
    this._points = [];
    this.oldEnd = undefined;

    if (this.tempLines.length > 0) {
      const colorOpaque = new Color(this.color);
      colorOpaque.setAlpha(1);
      this.tempLines.forEach((edge) =>
        edge.set({ stroke: colorOpaque.toRgba() }),
      );

      this.canvas.fire("custom:moleculeEdgeSetAdd", {
        edgeLines: this.tempLines,
      });
      this.canvas.renderAll();

      this.tempLines = [];
      this.prevPointWalkback = [];
    }
  }
}
