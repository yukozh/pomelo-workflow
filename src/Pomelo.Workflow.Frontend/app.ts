import { ConnectPolyline } from "./ConnectPolyline";
import { Point } from "./Point";
import { Polyline } from "./Polyline";

let cp = new ConnectPolyline();
let element1 = new Polyline();
let ret = cp.initFromDepartureAndDestination(new Point(20, 20), new Point(100, 50), [
    
]);

console.log(ret);
console.log(JSON.stringify(cp.path));

let ret2 = ret;