"use strict";
// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Polyline = exports.PolylineBase = void 0;
class PolylineBase {
    constructor() {
        this.points = [];
    }
    isPointInPolygon(point) {
        let checkPoint = [point.x, point.y];
        let polygonPoints = this.points.map(point => [point.x, point.y]);
        let counter = 0;
        let xinters;
        let pointCount = polygonPoints.length;
        let p1 = polygonPoints[0];
        for (let i = 1; i <= pointCount; i++) {
            let p2 = polygonPoints[i % pointCount];
            if (checkPoint[0] > Math.min(p1[0], p2[0]) &&
                checkPoint[0] <= Math.max(p1[0], p2[0])) {
                if (checkPoint[1] <= Math.max(p1[1], p2[1])) {
                    if (p1[0] != p2[0]) {
                        xinters =
                            (checkPoint[0] - p1[0]) *
                                (p2[1] - p1[1]) /
                                (p2[0] - p1[0]) +
                                p1[1];
                        if (p1[1] == p2[1] || checkPoint[1] <= xinters) {
                            counter++;
                        }
                    }
                }
            }
            p1 = p2;
        }
        if (counter % 2 == 0) {
            return false;
        }
        else {
            return true;
        }
    }
    isPolygonCrossed(polygon) {
        return polygon.points.some(point => this.isPointInPolygon(point));
    }
}
exports.PolylineBase = PolylineBase;
class Polyline extends PolylineBase {
}
exports.Polyline = Polyline;
//# sourceMappingURL=Polyline.js.map