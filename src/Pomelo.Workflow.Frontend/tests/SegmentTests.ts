import assert = require('assert');
import { Point } from '../Point';
import { Segment, SegmentCrossState } from '../Segment';

describe("Segment Tests", () => {
    it("Cross Test", () => {
        let segment1 = new Segment(<Point>{ x: 1, y: 1 }, <Point>{ x: 3, y: 3 });
        let segment2 = new Segment(<Point>{ x: 1, y: 3 }, <Point>{ x: 3, y: 1 });
        let segment3 = new Segment(<Point>{ x: 1, y: 2 }, <Point>{ x: 3, y: 2 });
        let segment4 = new Segment(<Point>{ x: 2, y: 1 }, <Point>{ x: 2, y: 3 });

        assert.equal(segment1.getCrossStateWithSegment(segment2), SegmentCrossState.Single);
        assert.equal(segment3.getCrossStateWithSegment(segment4), SegmentCrossState.Single);
        assert.ok(segment1.isCrossedBySegment(segment2), "This shouldn't fail");
        assert.ok(segment3.isCrossedBySegment(segment4), "This shouldn't fail");
    });

    it("Not Cross Test", () => {
        let segment1 = new Segment(<Point>{ x: 0, y: 0 }, <Point>{ x: 3, y: 3 });
        let segment2 = new Segment(<Point>{ x: 0, y: 3 }, <Point>{ x: 1, y: 2 });

        assert.equal(segment1.getCrossStateWithSegment(segment2), SegmentCrossState.None);
        assert.ok(!segment1.isCrossedBySegment(segment2), "This shouldn't fail");
    });

    it("Same K Segements Cross Test", () => {
        let segment1 = new Segment(<Point>{ x: 1, y: 1 }, <Point>{ x: 3, y: 3 });
        let segment2 = new Segment(<Point>{ x: 2, y: 2 }, <Point>{ x: 4, y: 4 });
        let segment3 = new Segment(<Point>{ x: 3, y: 3 }, <Point>{ x: 4, y: 4 });

        assert.equal(segment1.getCrossStateWithSegment(segment2), SegmentCrossState.Infinite);
        assert.equal(segment1.getCrossStateWithSegment(segment3), SegmentCrossState.Single);
        assert.ok(segment1.isCrossedBySegment(segment2), "This shouldn't fail");
        assert.ok(segment1.isCrossedBySegment(segment3), "This shouldn't fail");
    });

    it("Same K Segements Not Cross Test", () => {
        let segment1 = new Segment(<Point>{ x: 1, y: 1 }, <Point>{ x: 2, y: 2 });
        let segment2 = new Segment(<Point>{ x: 4, y: 4 }, <Point>{ x: 5, y: 5 });

        assert.equal(segment1.getCrossStateWithSegment(segment2), SegmentCrossState.None);
        assert.ok(!segment1.isCrossedBySegment(segment2), "This shouldn't fail");
    });

    it("NaN Test", () => {
        let segment1 = new Segment(<Point>{ x: 0, y: 0 }, <Point>{ x: 0, y: 10 });
        let segment2 = new Segment(<Point>{ x: 0, y: 5 }, <Point>{ x: 0, y: 15 });
        let segment3 = new Segment(<Point>{ x: 0, y: 11 }, <Point>{ x: 0, y: 15 });

        assert.equal(segment1.getCrossStateWithSegment(segment2), SegmentCrossState.Infinite);
        assert.equal(segment1.getCrossStateWithSegment(segment3), SegmentCrossState.None);
        assert.ok(segment1.isCrossedBySegment(segment2), "This shouldn't fail");
        assert.ok(!segment1.isCrossedBySegment(segment3), "This shouldn't fail");
    });
});


