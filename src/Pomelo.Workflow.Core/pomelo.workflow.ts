// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.

import { ConnectPolyline } from "./ConnectPolyline";
import { Diagram, DiagramConfiguration } from "./Diagram";
import { ExtremePoint } from "./ExtremePoint";
import { AnchorModel } from "./Models/AnchorModel";
import { ConnectPolylineModel } from "./Models/ConnectPolylineModel";
import { DiagramModel } from "./Models/DiagramModel";
import { PointModel } from "./Models/PointModel";
import { ShapeModel } from "./Models/ShapeModel";
import { Orientation } from "./Orientation";
import { Point } from "./Point";
import { Polyline } from "./Polyline";
import { Shape } from "./Shape";

(function (exports: any): any {
    // <Clousure />

    // Models
    exports.DiagramModel = DiagramModel;
    exports.ShapeModel = ShapeModel;
    exports.ConnectPolylineModel = ConnectPolylineModel;
    exports.AnchorModel = AnchorModel;
    exports.PointModel = PointModel;

    // Entities
    exports.Diagram = Diagram;
    exports.Shape = Shape;
    exports.ConnectPolyline = ConnectPolyline;
    exports.Polyline = Polyline;
    exports.Point = Point;
    exports.ExtremePoint = ExtremePoint;
    exports.DiagramConfiguration = DiagramConfiguration;

    // Helpers
    exports.Orientation = Orientation;

    return exports;
})(module && module.exports ? module.exports : (<any>window).PomeloWF);