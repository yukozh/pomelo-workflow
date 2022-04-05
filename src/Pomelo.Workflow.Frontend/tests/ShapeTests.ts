import assert = require('assert');
import { Shape } from '../Shape';

describe("Shape Tests", () => {
    it("Calculate Anchor Point", () => {
        let shape = new Shape(100, 100, 10, 10, null);

        shape.createAnchor(0.5, 0);
        shape.createAnchor(0.5, 1);

        let anchorPoint1 = shape.getAnchors()[0].toPoint();
        assert.equal(anchorPoint1.x, 105);
        assert.equal(anchorPoint1.y, 100);

        let anchorPoint2 = shape.getAnchors()[1].toPoint();
        assert.equal(anchorPoint2.x, 105);
        assert.equal(anchorPoint2.y, 110);
    });
});
