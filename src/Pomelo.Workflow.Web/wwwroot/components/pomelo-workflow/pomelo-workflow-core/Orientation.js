"use strict";
// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Orientation = exports.RelativeOrientation = exports.AbsoluteOrientation = void 0;
const Segment_1 = require("./Segment");
var AbsoluteOrientation;
(function (AbsoluteOrientation) {
    AbsoluteOrientation["Left"] = "Left";
    AbsoluteOrientation["Right"] = "Right";
    AbsoluteOrientation["Top"] = "Top";
    AbsoluteOrientation["Bottom"] = "Bottom";
})(AbsoluteOrientation = exports.AbsoluteOrientation || (exports.AbsoluteOrientation = {}));
var RelativeOrientation;
(function (RelativeOrientation) {
    RelativeOrientation["Left"] = "Left";
    RelativeOrientation["Right"] = "Right";
    RelativeOrientation["Straight"] = "Straight";
    RelativeOrientation["Backward"] = "Backward";
})(RelativeOrientation = exports.RelativeOrientation || (exports.RelativeOrientation = {}));
class Orientation {
    static getReversedOrientation(orientation) {
        switch (orientation) {
            case AbsoluteOrientation.Bottom:
                return AbsoluteOrientation.Top;
            case AbsoluteOrientation.Top:
                return AbsoluteOrientation.Bottom;
            case AbsoluteOrientation.Left:
                return AbsoluteOrientation.Right;
            case AbsoluteOrientation.Right:
                return AbsoluteOrientation.Left;
        }
    }
    static getOrientationFromTwoPoints(departure, destination) {
        let segment = new Segment_1.Segment(departure, destination);
        if (segment.points[0].y == segment.points[1].y) {
            if (segment.points[1].x > segment.points[0].x) {
                return AbsoluteOrientation.Right;
            }
            else if (segment.points[1].x < segment.points[0].x) {
                return AbsoluteOrientation.Left;
            }
            else {
                return null;
            }
        }
        else if (segment.points[0].x == segment.points[1].x) {
            if (segment.points[1].y > segment.points[0].y) {
                return AbsoluteOrientation.Bottom;
            }
            else if (segment.points[1].y < segment.points[0].y) {
                return AbsoluteOrientation.Top;
            }
            else {
                return null;
            }
        }
        else {
            return null;
        }
    }
}
exports.Orientation = Orientation;
