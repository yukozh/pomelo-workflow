import assert = require('assert');
import { ConnectPolyline } from '../ConnectPolyline';
import { Anchor, Shape } from '../Shape';

describe("ConnectPolyline Tests", () => {
    it("No Blocker Test", () => {
        let cp1 = new ConnectPolyline();
        let shape1 = new Shape(20, 20, 10, 10, [new Anchor(0, 0)]);
        let shape2 = new Shape(60, 100, 10, 10, [new Anchor(0, 0)]);
        console.log(`Depatrue: (${shape1.anchors[0].toPoint().x},${shape1.anchors[0].toPoint().y})`);
        console.log(`Destination: (${shape2.anchors[0].toPoint().x},${shape2.anchors[0].toPoint().y})`);

        assert.ok(cp1.initFromDepartureAndDestination(shape1.anchors[0], shape2.anchors[0], []), "This should success");
    });

    it("Two Shapes Test", () => {
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

    it("Three Shapes Test #1", () => {
        let cp = new ConnectPolyline();
        let shape1 = new Shape(20, 20, 20, 20, [new Anchor(0, 0.5)]);
        let shape2 = new Shape(80, 100, 20, 20, [new Anchor(1, 0.5)]);
        let shape3 = new Shape(40, 80, 20, 20, []);
        console.log('Shape 1:');
        console.log(shape1.points);
        console.log('Shape 2:');
        console.log(shape2.points);
        console.log(`Depatrue: (${shape1.anchors[0].toPoint().x},${shape1.anchors[0].toPoint().y})`);
        console.log(`Destination: (${shape2.anchors[0].toPoint().x},${shape2.anchors[0].toPoint().y})`);

        let ret = cp.initFromDepartureAndDestination(shape1.anchors[0], shape2.anchors[0], [shape1, shape2, shape3]);
        console.log(cp.generateSvg());

        let anchor1 = shape1.anchors[0].toPoint();
        let anchor2 = shape2.anchors[0].toPoint();
        assert.ok(ret, "This should success");
    });

    it("Three Shapes Test #2", () => {
        let cp = new ConnectPolyline();
        let shape1 = new Shape(20, 20, 20, 20, [new Anchor(0, 0.5)]);
        let shape2 = new Shape(80, 100, 20, 20, [new Anchor(1, 0.5)]);
        let shape3 = new Shape(20, 40, 20, 20, []);
        console.log('Shape 1:');
        console.log(shape1.points);
        console.log('Shape 2:');
        console.log(shape2.points);
        console.log(`Depatrue: (${shape1.anchors[0].toPoint().x},${shape1.anchors[0].toPoint().y})`);
        console.log(`Destination: (${shape2.anchors[0].toPoint().x},${shape2.anchors[0].toPoint().y})`);

        let ret = cp.initFromDepartureAndDestination(shape1.anchors[0], shape2.anchors[0], [shape1, shape2, shape3]);
        console.log(cp.generateSvg());

        let anchor1 = shape1.anchors[0].toPoint();
        let anchor2 = shape2.anchors[0].toPoint();
        assert.equal(anchor1.x, 20);
        assert.equal(anchor1.y, 20 + 10);
        assert.equal(anchor2.x, 80 + 20);
        assert.equal(anchor2.y, 100 + 10);
        assert.ok(ret, "This should success");
    });

    it("Three Shapes Test #3", () => {
        let cp = new ConnectPolyline();
        let shape1 = new Shape(20, 20, 20, 20, [new Anchor(0, 0.5)]);
        let shape2 = new Shape(100, 20, 20, 20, [new Anchor(1, 0.5)]);
        let shape3 = new Shape(50, 20, 20, 20, []);
        console.log('Shape 1:');
        console.log(shape1.points);
        console.log('Shape 2:');
        console.log(shape2.points);
        console.log(`Depatrue: (${shape1.anchors[0].toPoint().x},${shape1.anchors[0].toPoint().y})`);
        console.log(`Destination: (${shape2.anchors[0].toPoint().x},${shape2.anchors[0].toPoint().y})`);

        let ret = cp.initFromDepartureAndDestination(shape1.anchors[0], shape2.anchors[0], [shape1, shape2, shape3]);
        console.log(cp.generateSvg());

        assert.ok(ret, "This should success");
    });

    it("Three Shapes Test #4", () => {
        let cp = new ConnectPolyline();
        let shape1 = new Shape(20, 20, 20, 20, [new Anchor(0, 0.5)]);
        let shape2 = new Shape(100, 30, 20, 20, [new Anchor(1, 0.5)]);
        let shape3 = new Shape(50, 20, 20, 20, []);
        console.log('Shape 1:');
        console.log(shape1.points);
        console.log('Shape 2:');
        console.log(shape2.points);
        console.log(`Depatrue: (${shape1.anchors[0].toPoint().x},${shape1.anchors[0].toPoint().y})`);
        console.log(`Destination: (${shape2.anchors[0].toPoint().x},${shape2.anchors[0].toPoint().y})`);

        let ret = cp.initFromDepartureAndDestination(shape1.anchors[0], shape2.anchors[0], [shape1, shape2, shape3]);
        console.log(cp.generateSvg());

        assert.ok(ret, "This should success");
    });
});
