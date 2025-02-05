// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.

import assert = require('assert');
import { Point } from '../Point';
import { Segment, SegmentCrossState } from '../Segment';

describe("Segment Tests", () => {
    it("Cross Test", () => {
        let segment1 = new Segment(new Point(1, 1), new Point(3, 3));
        let segment2 = new Segment(new Point(1, 3), new Point(3, 1));
        let segment3 = new Segment(new Point(1, 2), new Point(3, 2));
        let segment4 = new Segment(new Point(2, 1), new Point(2, 3));

        assert.equal(segment1.getCrossStateWithSegment(segment2), SegmentCrossState.Single);
        assert.equal(segment3.getCrossStateWithSegment(segment4), SegmentCrossState.Single);
        assert.ok(segment1.isCrossedBySegment(segment2), "This shouldn't fail");
        assert.ok(segment3.isCrossedBySegment(segment4), "This shouldn't fail");
    });

    it("Not Cross Test", () => {
        let segment1 = new Segment(new Point(0, 0), new Point(3, 3));
        let segment2 = new Segment(new Point(0, 3), new Point(1, 2));

        assert.equal(segment1.getCrossStateWithSegment(segment2), SegmentCrossState.None);
        assert.ok(!segment1.isCrossedBySegment(segment2), "This shouldn't fail");
    });

    it("Same K Segements Cross Test", () => {
        let segment1 = new Segment(new Point(1, 1), new Point(3, 3));
        let segment2 = new Segment(new Point(2, 2), new Point(4, 4));
        let segment3 = new Segment(new Point(3, 3), new Point(4, 4));

        assert.equal(segment1.getCrossStateWithSegment(segment2), SegmentCrossState.Infinite);

        assert.ok(segment1.points[1].equalsTo(segment3.points[0]));
        assert.ok(segment1.isPointInSegment(segment3.points[0]));
        assert.ok(!segment1.isPointInSegment(segment3.points[1]));
        assert.ok(!segment3.isPointInSegment(segment1.points[0]));
        assert.ok(segment3.isPointInSegment(segment1.points[1]));
        assert.equal(segment1.getCrossStateWithSegment(segment3), SegmentCrossState.Single);

        assert.ok(segment1.isCrossedBySegment(segment2), "This shouldn't fail");
        assert.ok(segment1.isCrossedBySegment(segment3), "This shouldn't fail");
    });

    it("Same K Segements Not Cross Test", () => {
        let segment1 = new Segment(new Point(1, 1), new Point(2, 2));
        let segment2 = new Segment(new Point(4, 4), new Point(5, 5));

        assert.equal(segment1.getCrossStateWithSegment(segment2), SegmentCrossState.None);
        assert.ok(!segment1.isCrossedBySegment(segment2), "This shouldn't fail");
    });

    it("Cover Test", () => {
        let segment1 = new Segment(new Point(20, 20), new Point(20, 30));
        let segment2 = new Segment(new Point(20, 20), new Point(20, 130));
        let segment3 = new Segment(new Point(10, 50), new Point(190, 50));
        let segment4 = new Segment(new Point(90, 50), new Point(190, 50));

        assert.ok(segment2.isPointInSegment(segment1.points[0]));
        assert.ok(segment2.isPointInSegment(segment1.points[1]));
        assert.equal(segment1.getCrossStateWithSegment(segment2), SegmentCrossState.Infinite);
        assert.equal(segment3.getCrossStateWithSegment(segment4), SegmentCrossState.Infinite);
    });

    it("Point In Segment Test", () => {
        let segment = new Segment(new Point(1, 1), new Point(3, 3));
        let point = new Point(4, 4);
        let point2 = new Point(2, 2);

        assert.ok(!segment.isPointInSegment(point));
        assert.ok(segment.isPointInSegment(point2));
    });

    it("NaN Test", () => {
        let segment1 = new Segment(new Point(0, 0), new Point(0, 10));
        let segment2 = new Segment(new Point(0, 5), new Point(0, 15));
        let segment3 = new Segment(new Point(0, 11), new Point(0, 15));

        assert.equal(segment1.getCrossStateWithSegment(segment2), SegmentCrossState.Infinite);
        assert.equal(segment1.getCrossStateWithSegment(segment3), SegmentCrossState.None);
        assert.ok(segment1.isCrossedBySegment(segment2), "This shouldn't fail");
        assert.ok(!segment1.isCrossedBySegment(segment3), "This shouldn't fail");
    });
});


