import { Circle, PencilBrush } from "fabric";

export default class CircleBrush extends PencilBrush {
  _getMaxErr() {
    return 0.3;
  }

  onMouseUp({ e }) {
    const points = this._points || [];

    this._points = [];
    this.drawStraightLine = false;
    this.oldEnd = undefined;

    this.canvas.clearContext(this.canvas.contextTop);

    if (points.length < 2) {
      this.canvas.renderAll();
      return false;
    }

    let sumX = 0;
    let sumY = 0;
    for (const p of points) {
      sumX += p.x;
      sumY += p.y;
    }
    const center = { x: sumX / points.length, y: sumY / points.length };

    let totalDist = 0;
    for (const p of points) {
      totalDist += Math.hypot(p.x - center.x, p.y - center.y);
    }
    const radius = totalDist / points.length;

    if (radius <= 5) {
      this.canvas.renderAll();
      return false;
    }

    const avgErr = (() => {
      let err = 0;
      for (const p of points) {
        err += Math.abs(Math.hypot(p.x - center.x, p.y - center.y) - radius);
      }
      return err / points.length / radius;
    })();

    if (avgErr > this._getMaxErr()) {
      this.canvas.renderAll();
      return false;
    }

    const circle = new Circle({
      left: center.x,
      top: center.y,
      radius,
      fill: "",
      stroke: this.color,
      strokeWidth: this.width,
      selectable: false,
      evented: false,
    });

    this.canvas.fire("before:path:created", { path: circle });
    this.canvas.add(circle);
    this.canvas.fire("path:created", { path: circle });
    this.canvas.renderAll();
    return false;
  }
}
