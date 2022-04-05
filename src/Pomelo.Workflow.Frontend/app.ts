import { ConnectPolyline } from "./ConnectPolyline";
import { Drawing, DrawingConfiguration } from "./Drawing";
import { AnchorModel } from "./Models/AnchorModel";
import { ConnectPolylineModel } from "./Models/ConnectPolylineModel";
import { DrawingModel } from "./Models/DrawingModel";
import { PointModel } from "./Models/PointModel";
import { ShapeModel } from "./Models/ShapeModel";
import { Point } from "./Point";
import { Polyline } from "./Polyline";
import { Shape } from "./Shape";

var PomeloWF = (function (exports: any): any {
    // <Clousure />

    exports.DrawingModel = DrawingModel;
    exports.ShapeModel = ShapeModel;
    exports.ConnectPolylineModel = ConnectPolylineModel;
    exports.AnchorModel = AnchorModel;
    exports.PointModel = PointModel;

    exports.Drawing = Drawing;
    exports.Shape = Shape;
    exports.ConnectPolyline = ConnectPolyline;
    exports.Polyline = Polyline;
    exports.Point = Point;
    exports.DrawingConfiguration = DrawingConfiguration;
    return exports;
})({});