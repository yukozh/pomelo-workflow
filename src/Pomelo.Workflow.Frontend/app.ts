import { ConnectPolyline } from "./ConnectPolyline";
import { Drawing } from "./Drawing";
import { Shape } from "./Shape";

var PomeloWF = (function (exports: any) {
    exports.Drawing = Drawing;
    exports.Shape = Shape;
    exports.ConnectPolyline = ConnectPolyline;
})({});