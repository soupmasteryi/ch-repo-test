import { Shadow } from "fabric";
import { Path } from "fabric";
import { PencilBrush } from "fabric";


export class CancellablePencilBrush extends PencilBrush {

  _isMouseDown;
  
  constructor(canvas) {
    super(canvas);
    this._isMouseDown = false;
    this.straightLineKey = null;
  }
  /**
   * Invoked on mouse down
   * @param {Point} pointer
   */
  onMouseDown(pointer, { e }) {
    if (!this._isMouseDown) {
      this._isMouseDown = true;
      return super.onMouseDown(pointer, { e });
    }
  }

  /**
   * Invoked on mouse move
   * @param {Point} pointer
   */
  onMouseMove(pointer, { e }) {
    if (this._isMouseDown) {
      return super.onMouseMove(pointer, { e });
    }
  }

  /**
   * Invoked on mouse up
   */
  onMouseUp({ e }) {
    if (this._isMouseDown) {
      this._isMouseDown = false;
      return super.onMouseUp({ e });
    }
    return false;
  }
}
