"use strict";
// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtremePoint = void 0;
const Orientation_1 = require("./Orientation");
const Point_1 = require("./Point");
class ExtremePoint extends Point_1.Point {
    constructor(point, prev = null, next = null) {
        super(point.x, point.y);
        this.next = next;
        this.prev = prev;
    }
    getRelativeOrientation() {
        if (this.prev == null || this.next == null) {
            return null;
        }
        if (this.prev.x == this.x && this.x == this.next.x) {
            return Orientation_1.RelativeOrientation.Straight;
        }
        let o1 = Orientation_1.Orientation.getOrientationFromTwoPoints(this.prev, this);
        let o2 = Orientation_1.Orientation.getOrientationFromTwoPoints(this, this.next);
        if (o1 == Orientation_1.Orientation.getReversedOrientation(o2)) {
            return Orientation_1.RelativeOrientation.Backward;
        }
        if (o1 == Orientation_1.AbsoluteOrientation.Bottom && o2 == Orientation_1.AbsoluteOrientation.Left
            || o1 == Orientation_1.AbsoluteOrientation.Left && o2 == Orientation_1.AbsoluteOrientation.Top
            || o1 == Orientation_1.AbsoluteOrientation.Top && o2 == Orientation_1.AbsoluteOrientation.Right
            || o1 == Orientation_1.AbsoluteOrientation.Right && o2 == Orientation_1.AbsoluteOrientation.Bottom) {
            return Orientation_1.RelativeOrientation.Right;
        }
        else {
            return Orientation_1.RelativeOrientation.Left;
        }
    }
}
exports.ExtremePoint = ExtremePoint;
