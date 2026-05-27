import { Group, Line, PencilBrush, Polygon } from "fabric";

export default class StraightArrowBrush extends PencilBrush {
  _startPoint = null;

  onMouseDown(pointer, ev) {
    super.onMouseDown(pointer, ev);
    this._startPoint = { x: pointer.x, y: pointer.y };
  }

  onMouseUp({ e }) {
    const start = this._startPoint;
    const end =
      this._points && this._points.length
        ? this._points[this._points.length - 1]
        : start;

    this._points = [];
    this.drawStraightLine = false;
    this.oldEnd = undefined;
    this._startPoint = null;

    this.canvas.clearContext(this.canvas.contextTop);

    if (!start || !end) return false;
    if (start.x === end.x && start.y === end.y) {
      this.canvas.renderAll();
      return false;
    }

    const arrow = this._buildArrow(start, end);
    this.canvas.fire("before:path:created", { path: arrow });
    this.canvas.add(arrow);
    this.canvas.fire("path:created", { path: arrow });
    this.canvas.renderAll();
    return false;
  }

  _buildArrow(start, end) {
    const color = this.color;
    const width = this.width;
    const headLen = Math.max(width * 4, 12);
    const headAngle = Math.PI / 7;
    const angle = Math.atan2(end.y - start.y, end.x - start.x);

    const line = new Line([start.x, start.y, end.x, end.y], {
      stroke: color,
      strokeWidth: width,
      strokeLineCap: "round",
    });

    const tip = { x: end.x, y: end.y };
    const left = {
      x: end.x - headLen * Math.cos(angle - headAngle),
      y: end.y - headLen * Math.sin(angle - headAngle),
    };
    const right = {
      x: end.x - headLen * Math.cos(angle + headAngle),
      y: end.y - headLen * Math.sin(angle + headAngle),
    };

    const head = new Polygon([tip, left, right], {
      fill: color,
      stroke: color,
      strokeWidth: 1,
    });

    return new Group([line, head], {
      selectable: false,
      evented: false,
    });
  }
}
