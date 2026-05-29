import { Group, Line, PencilBrush, Polygon, Rect } from "fabric";

export default class StraightArrowBrush extends PencilBrush {
  _startPoint = null;

  _getHeadLen() {
    return 4 + this.width * 3;
  }

  _getHeadAngle() {
    return Math.PI / 7;
  }

  _getMaxErr() {
    return 0.25;
  }

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

    const points = this._points;

    this._points = [];
    this.drawStraightLine = false;
    this.oldEnd = undefined;
    this._startPoint = null;

    this.canvas.clearContext(this.canvas.contextTop);

    const lineLength =
      start && end ? Math.hypot(start.x - end.x, start.y - end.y) : 0;

    if (lineLength < this._getHeadLen()) {
      this.canvas.renderAll();
      return false;
    }

    if (
      !this._isLineStraight(start, end, points, lineLength, this._getMaxErr())
    ) {
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

  _isLineStraight(start, end, points, lineLength, err) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    let total = 0;
    for (const p of points) {
      total += Math.abs(
        dy * p.x - dx * p.y + end.x * start.y - end.y * start.x,
      );
    }
    const avgDistance = total / (points.length * lineLength);
    return avgDistance < lineLength * this._getMaxErr();
  }

  _buildArrow(start, end) {
    const headLen = this._getHeadLen();
    const headAngle = this._getHeadAngle();
    const angle = Math.atan2(end.y - start.y, end.x - start.x);

    const tip = { x: end.x, y: end.y };
    const arrLeft = {
      x: end.x - headLen * Math.cos(angle - headAngle),
      y: end.y - headLen * Math.sin(angle - headAngle),
    };
    const arrRight = {
      x: end.x - headLen * Math.cos(angle + headAngle),
      y: end.y - headLen * Math.sin(angle + headAngle),
    };

    const head = new Polygon([tip, arrLeft, arrRight], {
      fill: this.color,
      stroke: this.color,
      strokeWidth: 1,
    });

    const headBase = Math.hypot(arrLeft.x - arrRight.x, arrLeft.y - arrRight.y);
    const headHeight = Math.sqrt(headLen * headLen - (headBase * headBase) / 4);

    const lineEnd = {
      x: end.x - headHeight * Math.cos(angle),
      y: end.y - headHeight * Math.sin(angle),
    };

    const line = new Line([start.x, start.y, lineEnd.x, lineEnd.y], {
      stroke: this.color,
      strokeWidth: this.width,
      strokeLineCap: "round",
    });

    return new Group([line, head], {
      selectable: false,
      evented: false,
    });
  }
}
