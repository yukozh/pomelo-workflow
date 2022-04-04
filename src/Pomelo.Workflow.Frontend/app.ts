import { ConnectPolyline } from "./ConnectPolyline";
import { Polyline } from "./Polyline";
import { Anchor, Shape } from "./Shape";

let cp = new ConnectPolyline();
let element1 = new Polyline();
let cp1 = new ConnectPolyline();
let shape1 = new Shape(20, 20, 10, 10, [new Anchor(0, 0)]);
let shape2 = new Shape(60, 100, 10, 10, [new Anchor(0, 0)]);

let ret = cp.initFromDepartureAndDestination(shape1.anchors[0], shape2.anchors[0], [
    
]);

console.log(ret);
console.log(JSON.stringify(cp.path));

let ret2 = ret;