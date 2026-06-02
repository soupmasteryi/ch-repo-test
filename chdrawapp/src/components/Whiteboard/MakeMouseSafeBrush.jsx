export default function makeMouseSafeBrush(innerBrush) {
  innerBrush._isMouseDown = false;

  innerBrush.onMouseDown = function (...args) {
    if (!this._isMouseDown) {
      this._isMouseDown = true;
      Object.getPrototypeOf(innerBrush).onMouseDown.call(this, ...args);
    }
  };

  innerBrush.onMouseMove = function (...args) {
    if (this._isMouseDown) {
      Object.getPrototypeOf(innerBrush).onMouseMove.call(this, ...args);
    }
  };

  innerBrush.onMouseUp = function (...args) {
    if (this._isMouseDown) {
      this._isMouseDown = false;
      return Object.getPrototypeOf(innerBrush).onMouseUp.call(this, ...args);
    }
    return false;
  };

  let mouseSafeBrush = Object.create(innerBrush);

  return mouseSafeBrush;
}
