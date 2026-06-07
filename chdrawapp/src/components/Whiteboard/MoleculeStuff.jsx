import { Color } from "fabric";
import { UndirectedGraph } from "graphology";

export default class MoleculeStuff {
  nodeLabelId = 0;
  edgeLabelId = 0;
  graph = new UndirectedGraph({ allowSelfLoops: false });
  constructor(props) {
    for (const key in props) this[key] = props[key];
  }
  getNewNodeId() {
    return "" + this.nodeLabelId++;
  }
  getNewEdgeId() {
    return "" + this.edgeLabelId++;
  }
  getNodeFill(bkgColor) {
    const color = new Color(bkgColor);
    color.getSource()[0] = 255 - color.getSource()[0];
    color.getSource()[1] = 255 - color.getSource()[1];
    color.getSource()[2] = 255 - color.getSource()[2];
    return color.setAlpha(0.2).toRgba();
  }
  getClosestNode(point, distanceMargin) {
    const node = this.graph.findNode((node, attr) => {
      const dx = attr.point_coords.x - point.x;
      const dy = attr.point_coords.y - point.y;
      return Math.hypot(dx, dy) <= distanceMargin + 0.01;
    });
    return node ? this.graph.getNodeAttributes(node) : undefined;
  }
}
