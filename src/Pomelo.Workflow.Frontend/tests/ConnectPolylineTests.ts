import assert = require('assert');
import { ConnectPolyline } from '../ConnectPolyline';
import { Drawing, DrawingConfiguration } from '../Drawing';
import { Anchor, Shape } from '../Shape';

describe("ConnectPolyline Tests", () => {
    it("Two Shapes Test", () => {
        // Arrange
        let drawing = new Drawing(new DrawingConfiguration());
        let shape1 = drawing.createShape(20, 20, 20, 20);
        let anchor1 = shape1.createAnchor(0, .5);
        let shape2 = drawing.createShape(20, 20, 20, 20);
        let anchor2 = shape2.createAnchor(1, .5);
        let cp = drawing.createConnectPolyline(shape1.getGuid(), 0, shape2.getGuid(), 0);
        console.log('Shape 1:');
        console.log(shape1.points);
        console.log('Shape 2:');
        console.log(shape2.points);
        console.log(`Depatrue: (${shape1.getAnchors()[0].toPoint().x},${shape1.getAnchors()[0].toPoint().y})`);
        console.log(`Destination: (${shape2.getAnchors()[0].toPoint().x},${shape2.getAnchors()[0].toPoint().y})`);

        // Act
        let ret = cp.initFromDepartureAndDestination(shape1.getAnchors()[0], shape2.getAnchors()[0]);
        console.log(cp.generateSvg());

        // Assert
        assert.equal(anchor1.toPoint().x, 20);
        assert.equal(anchor1.toPoint().y, 20 + 10);
        assert.equal(anchor2.toPoint().x, 80 + 20);
        assert.equal(anchor2.toPoint().y, 100 + 10);
        assert.ok(ret, "Generate path should success");
    });

    //it("Three Shapes Test #1", () => {
    //    let cp = new ConnectPolyline();
    //    let shape1 = new Shape(20, 20, 20, 20, null);
    //    shape1.createAnchor(0, 0.5);
    //    let shape2 = new Shape(80, 100, 20, 20, null);
    //    shape2.createAnchor(1, 0.5);
    //    let shape3 = new Shape(40, 80, 20, 20, null);
    //    console.log('Shape 1:');
    //    console.log(shape1.points);
    //    console.log('Shape 2:');
    //    console.log(shape2.points);
    //    console.log(`Depatrue: (${shape1.anchors[0].toPoint().x},${shape1.anchors[0].toPoint().y})`);
    //    console.log(`Destination: (${shape2.anchors[0].toPoint().x},${shape2.anchors[0].toPoint().y})`);

    //    let ret = cp.initFromDepartureAndDestination(shape1.anchors[0], shape2.anchors[0], [shape1, shape2, shape3]);
    //    console.log(cp.generateSvg());

    //    let anchor1 = shape1.anchors[0].toPoint();
    //    let anchor2 = shape2.anchors[0].toPoint();
    //    assert.ok(ret, "This should success");
    //});

    //it("Three Shapes Test #2", () => {
    //    let cp = new ConnectPolyline();
    //    let shape1 = new Shape(20, 20, 20, 20, null);
    //    shape1.createAnchor(0, 0.5);
    //    let shape2 = new Shape(80, 100, 20, 20, null);
    //    shape2.createAnchor(1, 0.5);
    //    let shape3 = new Shape(20, 40, 20, 20, null);
    //    console.log('Shape 1:');
    //    console.log(shape1.points);
    //    console.log('Shape 2:');
    //    console.log(shape2.points);
    //    console.log(`Depatrue: (${shape1.anchors[0].toPoint().x},${shape1.anchors[0].toPoint().y})`);
    //    console.log(`Destination: (${shape2.anchors[0].toPoint().x},${shape2.anchors[0].toPoint().y})`);

    //    let ret = cp.initFromDepartureAndDestination(shape1.anchors[0], shape2.anchors[0], [shape1, shape2, shape3]);
    //    console.log(cp.generateSvg());

    //    let anchor1 = shape1.anchors[0].toPoint();
    //    let anchor2 = shape2.anchors[0].toPoint();
    //    assert.equal(anchor1.x, 20);
    //    assert.equal(anchor1.y, 20 + 10);
    //    assert.equal(anchor2.x, 80 + 20);
    //    assert.equal(anchor2.y, 100 + 10);
    //    assert.ok(ret, "This should success");
    //});

    //it("Three Shapes Test #3", () => {
    //    let cp = new ConnectPolyline();
    //    let shape1 = new Shape(20, 20, 20, 20, null);
    //    shape1.createAnchor(0, 0.5);
    //    let shape2 = new Shape(100, 20, 20, 20, null);
    //    shape2.createAnchor(1, 0.5);
    //    let shape3 = new Shape(50, 20, 20, 20, null);
    //    console.log('Shape 1:');
    //    console.log(shape1.points);
    //    console.log('Shape 2:');
    //    console.log(shape2.points);
    //    console.log(`Depatrue: (${shape1.anchors[0].toPoint().x},${shape1.anchors[0].toPoint().y})`);
    //    console.log(`Destination: (${shape2.anchors[0].toPoint().x},${shape2.anchors[0].toPoint().y})`);

    //    let ret = cp.initFromDepartureAndDestination(shape1.anchors[0], shape2.anchors[0], [shape1, shape2, shape3]);
    //    console.log(cp.generateSvg());

    //    assert.ok(ret, "This should success");
    //});

    //it("Three Shapes Test #4", () => {
    //    let cp = new ConnectPolyline();
    //    let shape1 = new Shape(20, 20, 20, 20, null);
    //    shape1.createAnchor(0, 0.5);
    //    let shape2 = new Shape(100, 30, 20, 20, null);
    //    shape2.createAnchor(0, 0.5);
    //    let shape3 = new Shape(50, 20, 20, 20, null);
    //    console.log('Shape 1:');
    //    console.log(shape1.points);
    //    console.log('Shape 2:');
    //    console.log(shape2.points);
    //    console.log(`Depatrue: (${shape1.anchors[0].toPoint().x},${shape1.anchors[0].toPoint().y})`);
    //    console.log(`Destination: (${shape2.anchors[0].toPoint().x},${shape2.anchors[0].toPoint().y})`);

    //    let ret = cp.initFromDepartureAndDestination(shape1.anchors[0], shape2.anchors[0], [shape1, shape2, shape3]);
    //    console.log(cp.generateSvg());

    //    assert.ok(ret, "This should success");
    //});
});
