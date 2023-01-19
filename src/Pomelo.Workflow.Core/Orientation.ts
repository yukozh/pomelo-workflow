// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.

import { Point } from "./Point";
import { Segment } from "./Segment";

export enum AbsoluteOrientation {
    Left = 'Left',
    Right = 'Right',
    Top = 'Top',
    Bottom = 'Bottom'
}

export enum RelativeOrientation {
    Left = 'Left',
    Right = 'Right',
    Straight = 'Straight',
    Backward = 'Backward'
}

export class Orientation {
    public static getReversedOrientation(orientation: AbsoluteOrientation): AbsoluteOrientation {
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

    public static getOrientationFromTwoPoints(departure: Point, destination: Point): AbsoluteOrientation | null {
        let segment = new Segment(departure, destination);

        if (segment.points[0].y == segment.points[1].y) {
            if (segment.points[1].x > segment.points[0].x) {
                return AbsoluteOrientation.Right;
            } else if (segment.points[1].x < segment.points[0].x) {
                return AbsoluteOrientation.Left;
            } else {
                return null;
            }
        } else if (segment.points[0].x == segment.points[1].x) {
            if (segment.points[1].y > segment.points[0].y) {
                return AbsoluteOrientation.Bottom;
            } else if (segment.points[1].y < segment.points[0].y) {
                return AbsoluteOrientation.Top;
            } else {
                return null;
            }
        } else {
            return null;
        }
    }
}