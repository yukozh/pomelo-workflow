// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.

import { AbsoluteOrientation, Orientation, RelativeOrientation } from "./Orientation";
import { Point } from "./Point";

export class ExtremePoint extends Point {
    public prev: ExtremePoint | null;
    public next: ExtremePoint | null;

    public constructor(point: Point, prev: ExtremePoint | null = null, next: ExtremePoint | null = null) {
        super(point.x, point.y);
        this.next = next;
        this.prev = prev;
    }

    public getRelativeOrientation(): RelativeOrientation | null {
        if (this.prev == null || this.next == null) {
            return null;
        }

        if (this.prev.x == this.x && this.x == this.next.x) {
            return RelativeOrientation.Straight;
        }

        let o1 = Orientation.getOrientationFromTwoPoints(this.prev, this);
        let o2 = Orientation.getOrientationFromTwoPoints(this, this.next);

        if (o1 == Orientation.getReversedOrientation(o2)) {
            return RelativeOrientation.Backward;
        }

        if (o1 == AbsoluteOrientation.Bottom && o2 == AbsoluteOrientation.Left
            || o1 == AbsoluteOrientation.Left && o2 == AbsoluteOrientation.Top
            || o1 == AbsoluteOrientation.Top && o2 == AbsoluteOrientation.Right
            || o1 == AbsoluteOrientation.Right && o2 == AbsoluteOrientation.Bottom) {
            return RelativeOrientation.Right;
        } else {
            return RelativeOrientation.Left;
        }
    }
}