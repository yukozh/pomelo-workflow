import { ConnectPolyline } from "./ConnectPolyline";
import { Drawing, DrawingConfiguration } from "./Drawing";
import { ExtremePoint } from "./ExtremePoint";
import { AnchorModel } from "./Models/AnchorModel";
import { ConnectPolylineModel } from "./Models/ConnectPolylineModel";
import { DrawingModel } from "./Models/DrawingModel";
import { PointModel } from "./Models/PointModel";
import { ShapeModel } from "./Models/ShapeModel";
import { Orientation } from "./Orientation";
import { Point } from "./Point";
import { Polyline } from "./Polyline";
import { Shape } from "./Shape";

(function (exports: any): any {
    // <Clousure />

    // Models
    exports.DrawingModel = DrawingModel;
    exports.ShapeModel = ShapeModel;
    exports.ConnectPolylineModel = ConnectPolylineModel;
    exports.AnchorModel = AnchorModel;
    exports.PointModel = PointModel;

    // Entities
    exports.Drawing = Drawing;
    exports.Shape = Shape;
    exports.ConnectPolyline = ConnectPolyline;
    exports.Polyline = Polyline;
    exports.Point = Point;
    exports.ExtremePoint = ExtremePoint;
    exports.DrawingConfiguration = DrawingConfiguration;

    // Helpers
    exports.Orientation = Orientation;

    return exports;
})(module && module.exports ? module.exports : (<any>window).PomeloWF);