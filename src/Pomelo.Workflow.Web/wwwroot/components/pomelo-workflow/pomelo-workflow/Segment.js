"use strict";
// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Segment = exports.SegmentCrossState = void 0;
const Point_1 = require("./Point");
const Polyline_1 = require("./Polyline");
var SegmentCrossState;
(function (SegmentCrossState) {
    SegmentCrossState[SegmentCrossState["None"] = 0] = "None";
    SegmentCrossState[SegmentCrossState["Single"] = 1] = "Single";
    SegmentCrossState[SegmentCrossState["Infinite"] = 2] = "Infinite";
})(SegmentCrossState = exports.SegmentCrossState || (exports.SegmentCrossState = {}));
class Segment extends Polyline_1.PolylineBase {
    getPoints() {
        return this.points;
    }
    constructor(depatrue, destination) {
        super();
        this.parent = null;
        this.points.push(depatrue);
        this.points.push(destination);
    }
    isPointInSegment(point) {
        if (point.equalsTo(this.points[0])
            || point.equalsTo(this.points[1])) {
            return true;
        }
        let p1 = this.points[0];
        let p2 = this.points[1];
        let q = point;
        let k1 = parseFloat(((p2.y - p1.y) / (p2.x - p1.x)).toFixed(3));
        let k2 = parseFloat(((q.y - p1.y) / (q.x - p1.x)).toFixed(3));
        if (!(isNaN(k1) && isNaN(k2))) {
            let error = Math.abs(k2 - k1);
            if (error > 0.000001) {
                return false;
            }
        }
        let minX = Math.min(p1.x, p2.x);
        let maxX = Math.max(p1.x, p2.x);
        let minY = Math.min(p1.y, p2.y);
        let maxY = Math.max(p1.y, p2.y);
        return minX <= point.x && point.x <= maxX && minY <= point.y && point.y <= maxY;
    }
    getCrossStateWithSegment(segment) {
        if (!this.isCrossedBySegment(segment)) {
            return SegmentCrossState.None;
        }
        else {
            if (this.isParallelWith(segment)) {
                let a = segment.points[0];
                let b = segment.points[1];
                let c = this.points[0];
                let d = this.points[1];
                let ab = segment;
                let cd = this;
                if (a.equalsTo(c) && !cd.isPointInSegment(b) && !ab.isPointInSegment(d)
                    || b.equalsTo(c) && !cd.isPointInSegment(a) && !ab.isPointInSegment(d)
                    || a.equalsTo(d) && !cd.isPointInSegment(b) && !ab.isPointInSegment(c)
                    || b.equalsTo(d) && !cd.isPointInSegment(a) && !ab.isPointInSegment(c)
                    || c.equalsTo(a) && !ab.isPointInSegment(d) && !cd.isPointInSegment(b)
                    || d.equalsTo(a) && !ab.isPointInSegment(c) && !cd.isPointInSegment(b)
                    || c.equalsTo(b) && !ab.isPointInSegment(d) && !cd.isPointInSegment(a)
                    || d.equalsTo(b) && !ab.isPointInSegment(c) && !cd.isPointInSegment(a)) {
                    return SegmentCrossState.Single;
                }
                else if (ab.isPointInSegment(c)
                    || ab.isPointInSegment(d)
                    || cd.isPointInSegment(a)
                    || cd.isPointInSegment(b)) {
                    return SegmentCrossState.Infinite;
                }
                else {
                    return SegmentCrossState.None;
                }
            }
            else {
                return SegmentCrossState.Single;
            }
        }
    }
    getSlope() {
        let p1 = this.points[0];
        let p2 = this.points[1];
        let ret = (p1.y - p2.y) / (p1.x - p2.x);
        if (isNaN(ret)) {
            return null;
        }
        else {
            return ret;
        }
    }
    isParallelWith(segment) {
        return this.getSlope() == segment.getSlope();
    }
    getCrossedPointWithSegment(segment) {
        let a = this.points[0];
        let b = this.points[1];
        let c = segment.points[0];
        let d = segment.points[1];
        let denominator = (b.y - a.y) * (d.x - c.x) - (a.x - b.x) * (c.y - d.y);
        if (denominator == 0) {
            return null;
        }
        let x = ((b.x - a.x) * (d.x - c.x) * (c.y - a.y)
            + (b.y - a.y) * (d.x - c.x) * a.x
            - (d.y - c.y) * (b.x - a.x) * c.x) / denominator;
        let y = -((b.y - a.y) * (d.y - c.y) * (c.x - a.x)
            + (b.x - a.x) * (d.y - c.y) * a.y
            - (d.x - c.x) * (b.y - a.y) * c.y) / denominator;
        if ((x - a.x) * (x - b.x) <= 0 && (y - a.y) * (y - b.y) <= 0
            && (x - c.x) * (x - d.x) <= 0 && (y - c.y) * (y - d.y) <= 0) {
            return new Point_1.Point(x, y);
        }
        return null;
    }
    isCrossedBySegment(segment) {
        let x1 = this.points[0].x, y1 = this.points[0].y, x2 = this.points[1].x, y2 = this.points[1].y, x3 = segment.getPoints()[0].x, y3 = segment.getPoints()[0].y, x4 = segment.getPoints()[1].x, y4 = segment.getPoints()[1].y;
        if (!(Math.min(x1, x2) <= Math.max(x3, x4) && Math.min(y3, y4) <= Math.max(y1, y2) && Math.min(x3, x4) <= Math.max(x1, x2) && Math.min(y1, y2) <= Math.max(y3, y4)))
            return false;
        let u, v, w, z;
        u = (x3 - x1) * (y2 - y1) - (x2 - x1) * (y3 - y1);
        v = (x4 - x1) * (y2 - y1) - (x2 - x1) * (y4 - y1);
        w = (x1 - x3) * (y4 - y3) - (x4 - x3) * (y1 - y3);
        z = (x2 - x3) * (y4 - y3) - (x4 - x3) * (y2 - y3);
        return (u * v <= 0.00000001 && w * z <= 0.00000001);
    }
    getDeltaX() {
        return [
            Math.min(this.points[0].x, this.points[1].x),
            Math.max(this.points[0].x, this.points[1].x)
        ];
    }
    getDeltaY() {
        return [
            Math.min(this.points[0].y, this.points[1].y),
            Math.max(this.points[0].y, this.points[1].y)
        ];
    }
}
exports.Segment = Segment;
//# sourceMappingURL=Segment.js.map