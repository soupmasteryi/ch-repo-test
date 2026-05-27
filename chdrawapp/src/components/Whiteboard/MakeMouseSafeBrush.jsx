export default function MakeMouseSafeBrush(innerBrush) {
  innerBrush._isMouseDown = false;

  innerBrush.onMouseDown = function (pointer, { e }) {
    if (!this._isMouseDown) {
      this._isMouseDown = true;
      Object.getPrototypeOf(innerBrush).onMouseDown.call(this, pointer, {
        e,
      });
    }
  };

  innerBrush.onMouseMove = function (pointer, { e }) {
    if (this._isMouseDown) {
      Object.getPrototypeOf(innerBrush).onMouseMove.call(this, pointer, { e });
    }
  };

  innerBrush.onMouseUp = function ({ e }) {
    if (this._isMouseDown) {
      this._isMouseDown = false;
      return Object.getPrototypeOf(innerBrush).onMouseUp.call(this, { e });
    }
    return false;
  };

  let mouseSafeBrush = Object.create(innerBrush);

  return mouseSafeBrush;
}
