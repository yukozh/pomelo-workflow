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

    it("Two Shape Test", () => {
        let cp = new ConnectPolyline();
        let shape1 = new Shape(20, 20, 20, 20, [new Anchor(0, 0.5)]);
        let shape2 = new Shape(80, 100, 20, 20, [new Anchor(1, 0.5)]);
        console.log('Shape 1:');
        console.log(shape1.points);
        console.log('Shape 2:');
        console.log(shape2.points);
        console.log(`Depatrue: (${shape1.anchors[0].toPoint().x},${shape1.anchors[0].toPoint().y})`);
        console.log(`Destination: (${shape2.anchors[0].toPoint().x},${shape2.anchors[0].toPoint().y})`);

        let ret = cp.initFromDepartureAndDestination(shape1.anchors[0], shape2.anchors[0], [shape1, shape2]);
        console.log(cp.generateSvg());

        let anchor1 = shape1.anchors[0].toPoint();
        let anchor2 = shape2.anchors[0].toPoint();
        assert.equal(anchor1.x, 20);
        assert.equal(anchor1.y, 20 + 10);
        assert.equal(anchor2.x, 80 + 20);
        assert.equal(anchor2.y, 100 + 10);
        assert.ok(ret, "This should success");
    });
});
