import assert = require('assert');
import { Anchor, Shape } from '../Shape';

describe("Shape Tests", () => {
    it("Calculate Anchor Point", () => {
        let shape = new Shape(100, 100, 10, 10, [
            new Anchor(0.5, 0),
            new Anchor(0.5, 1),
        ]);

        let anchorPoint1 = shape.anchors[0].toPoint();
        assert.equal(anchorPoint1.x, 105);
        assert.equal(anchorPoint1.y, 100);

        let anchorPoint2 = shape.anchors[1].toPoint();
        assert.equal(anchorPoint2.x, 105);
        assert.equal(anchorPoint2.y, 110);
    });
});
