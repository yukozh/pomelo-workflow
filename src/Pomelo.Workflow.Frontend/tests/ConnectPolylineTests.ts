import assert = require('assert');
import { ConnectPolyline } from '../ConnectPolyline';
import { Point } from '../Point';
import { Anchor, Shape } from '../Shape';

describe("ConnectPolyline Tests", () => {
    it("No Blocker Test", () => {
        let cp1 = new ConnectPolyline();
        let shape1 = new Shape(20, 20, 10, 10, [new Anchor(0, 0)]);
        let shape2 = new Shape(60, 100, 10, 10, [new Anchor(0, 0)]);
        assert.ok(cp1.initFromDepartureAndDestination(shape1.anchors[0], shape2.anchors[0], []), "This should success");
    });
});
