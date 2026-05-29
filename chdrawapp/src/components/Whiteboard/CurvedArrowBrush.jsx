import { Group, Path, PencilBrush, Polygon, Point, Circle } from "fabric";

export default class CurvedArrowBrush extends PencilBrush {
  _getHeadLen() {
    return 4 + this.width * 3;
  }

  _getHeadAngle() {
    return Math.PI / 7;
  }

  _getMaxErr() {
    return 0.15;
  }

  _findArrowBasePointIndex(points, headHeight) {
    let i = points.length - 1;
    const tip = points[i];
    while (i >= 0) {
      const base = points[i];
      const dist = Math.hypot(tip.x - base.x, tip.y - base.y);
      if (dist >= headHeight) {
        return i;
      }
      i--;
    }
    return i;
  }

  _isTipStraight(points, arrowBaseIndex, err) {
    const tip = points[points.length - 1];
    const base = points[arrowBaseIndex];
    const dx = tip.x - base.x;
    const dy = tip.y - base.y;
    const lineLength = Math.hypot(dx, dy);
    let total = 0;
    for (let i = points.length - 1; i >= arrowBaseIndex; i--) {
      const p = points[i];
      total += Math.abs(dy * p.x - dx * p.y + tip.x * base.y - tip.y * base.x);
    }
    const avgDistance = total / ((points.length - arrowBaseIndex) * lineLength);
    return avgDistance < lineLength * this._getMaxErr();
  }

  _getAverageTipTangent(points, arrowBaseIndex) {
    const end = points[points.length - 1];
    const lookback = points[arrowBaseIndex];
    const dx = end.x - lookback.x;
    const dy = end.y - lookback.y;
    const len = Math.hypot(dx, dy);
    if (len === 0) {
      return { x: 1, y: 0 };
    } else {
      return { x: dx / len, y: dy / len };
    }
  }

  onMouseUp({ e }) {
    const points = this._points;

    this._points = [];
    this.drawStraightLine = false;
    this.oldEnd = undefined;

    this.canvas.clearContext(this.canvas.contextTop);

    if (points.length < 2) {
      this.canvas.renderAll();
      return false;
    }

    const start = points[0];
    const end = points[points.length - 1];

    const headLen = this._getHeadLen();
    const headAngle = this._getHeadAngle();
    const headHeight = Math.sin((Math.PI - headAngle) / 2) * headLen;

    const basePointIndex = this._findArrowBasePointIndex(points, headHeight);

    if (
      basePointIndex === -1 ||
      !this._isTipStraight(points, basePointIndex, this._getMaxErr())
    ) {
      this.canvas.renderAll();
      return false;
    }

    const tangent = this._getAverageTipTangent(points, basePointIndex);
    const angle = Math.atan2(tangent.y, tangent.x);

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

    const truncated = points.slice(0, basePointIndex + 1);
    truncated.push(
      new Point((arrLeft.x + arrRight.x) / 2, (arrLeft.y + arrRight.y) / 2),
    );
    const pathLength = (() => {
      let distance = 0;
      for (let i = 0; i < truncated.length - 1; i++) {
        distance += Math.hypot(
          truncated[i].x - truncated[i + 1].x,
          truncated[i].y - truncated[i + 1].y,
        );
      }
      return distance;
    })();
    const pathStr = this.convertPointsToSVGPath(
      this.decimatePoints(truncated, pathLength / 7),
    );

    const path = new Path(pathStr, {
      stroke: this.color,
      strokeWidth: this.width,
      strokeLineCap: "round",
      strokeLineJoin: "round",
      fill: null,
    });

    const arrow = new Group([path, head], {
      selectable: false,
      evented: false,
    });

    this.canvas.fire("before:path:created", { path: arrow });
    this.canvas.add(arrow);
    this.canvas.fire("path:created", { path: arrow });
    this.canvas.renderAll();
    return false;
  }

  _getTipTangent(points) {
    const n = points.length;
    const end = points[n - 1];
    const total = { x: 0, y: 0 };
    let lookbackCount = 0;
    for (let i = n - 2; i >= Math.max(n - 6, 0); i--) {
      lookbackCount++;
      const lookback = points[i];
      const dx = end.x - lookback.x;
      const dy = end.y - lookback.y;
      const len = Math.hypot(dx, dy);
      if (len === 0) {
        ((total.x += 1), (total.y += 0));
      } else {
        total.x += dx / len;
        total.y += dy / len;
      }
    }
    total.x /= lookbackCount;
    total.y /= lookbackCount;
    return total;
  }

  _truncateToTip(points, distance) {
    const out = points.slice();
    let remaining = distance;
    while (out.length >= 2) {
      const last = out[out.length - 1];
      const prev = out[out.length - 2];
      const seg = Math.hypot(last.x - prev.x, last.y - prev.y);
      if (seg >= remaining) {
        const t = remaining / seg;
        out[out.length - 1] = new Point(
          last.x + (prev.x - last.x) * t,
          last.y + (prev.y - last.y) * t,
        );
        return out;
      }
      remaining -= seg;
      out.pop();
    }
    return out;
  }
}
