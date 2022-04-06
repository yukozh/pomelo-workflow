import assert = require('assert');
import { Drawing, DrawingConfiguration } from '../Drawing';

let config = new DrawingConfiguration();
config.elementBorder = true;

describe("ConnectPolyline Tests", () => {
    it("Two Shapes Test", () => {
        // Arrange
        let drawing = new Drawing(config);

        let shape1 = drawing.createShape(20, 20, 20, 20);
        let anchor1 = shape1.createAnchor(0, .5);
        assert.equal(drawing.getShapes().length, 1);
        assert.equal(shape1.getAnchors().length, 1);

        let shape2 = drawing.createShape(80, 100, 20, 20);
        let anchor2 = shape2.createAnchor(1, .5);
        assert.equal(drawing.getShapes().length, 2);
        assert.equal(shape2.getAnchors().length, 1);

        // Act
        let cp = drawing.createConnectPolyline(shape1.getGuid(), 0, shape2.getGuid(), 0);
        assert.equal(drawing.getConnectPolylines().length, 1);
        console.log('Shape 1:');
        console.log(shape1.points);
        console.log('Shape 2:');
        console.log(shape2.points);
        console.log(`Depatrue: (${shape1.getAnchors()[0].toPoint().x},${shape1.getAnchors()[0].toPoint().y})`);
        console.log(`Destination: (${shape2.getAnchors()[0].toPoint().x},${shape2.getAnchors()[0].toPoint().y})`);
        let ret = cp.getPathGenerationResult();
        console.log(drawing.generateSvg());

        // Assert
        assert.equal(anchor1.toPoint().x, 20);
        assert.equal(anchor1.toPoint().y, 20 + 10);
        assert.equal(anchor2.toPoint().x, 80 + 20);
        assert.equal(anchor2.toPoint().y, 100 + 10);
        assert.ok(ret, "Generate path should success");
    });


    it("Three Shapes Test #1", () => {
        // Arrange
        let drawing = new Drawing(config);

        let shape1 = drawing.createShape(20, 20, 20, 20);
        let anchor1 = shape1.createAnchor(0, .5);
        assert.equal(anchor1.toPoint().x, 20);
        assert.equal(anchor1.toPoint().y, 20 + 10);

        let shape2 = drawing.createShape(80, 100, 20, 20);
        let anchor2 = shape2.createAnchor(1, .5);
        assert.equal(anchor2.toPoint().x, 80 + 20);
        assert.equal(anchor2.toPoint().y, 100 + 10);

        drawing.createShape(40, 80, 20, 20);

        // Act
        let cp = drawing.createConnectPolyline(shape1.getGuid(), 0, shape2.getGuid(), 0);
        assert.equal(drawing.getShapes().length, 3);
        console.log(drawing.generateSvg());

        // Assert
        assert.ok(cp.getPathGenerationResult(), "Generate path should success");
    });

    it("Three Shapes Test #2", () => {
        // Arrange
        let drawing = new Drawing(config);

        let shape1 = drawing.createShape(20, 20, 20, 20);
        let anchor1 = shape1.createAnchor(0, .5);
        assert.equal(anchor1.toPoint().x, 20);
        assert.equal(anchor1.toPoint().y, 20 + 10);

        let shape2 = drawing.createShape(80, 100, 20, 20);
        let anchor2 = shape2.createAnchor(1, .5);
        assert.equal(anchor2.toPoint().x, 80 + 20);
        assert.equal(anchor2.toPoint().y, 100 + 10);

        drawing.createShape(20, 40, 20, 20);

        // Act
        let cp = drawing.createConnectPolyline(shape1.getGuid(), 0, shape2.getGuid(), 0);
        assert.equal(drawing.getShapes().length, 3);
        console.log(drawing.generateSvg());

        // Assert
        assert.ok(cp.getPathGenerationResult(), "Generate path should success");
    });

    it("Three Shapes Test #3", () => {
        // Arrange
        let drawing = new Drawing(config);

        let shape1 = drawing.createShape(20, 20, 20, 20);
        let anchor1 = shape1.createAnchor(0, .5);
        assert.equal(anchor1.toPoint().x, 20);
        assert.equal(anchor1.toPoint().y, 20 + 10);

        let shape2 = drawing.createShape(100, 20, 20, 20);
        shape2.createAnchor(1, .5);

        drawing.createShape(50, 20, 20, 20);

        // Act
        let cp = drawing.createConnectPolyline(shape1.getGuid(), 0, shape2.getGuid(), 0);
        assert.equal(drawing.getShapes().length, 3);
        console.log(drawing.generateSvg());

        // Assert
        assert.ok(cp.getPathGenerationResult(), "Generate path should success");
    });

    it("Three Shapes Test #4", () => {
        // Arrange
        let drawing = new Drawing(config);

        let shape1 = drawing.createShape(20, 20, 20, 20);
        let anchor1 = shape1.createAnchor(0, .5);
        assert.equal(anchor1.toPoint().x, 20);
        assert.equal(anchor1.toPoint().y, 20 + 10);

        let shape2 = drawing.createShape(100, 30, 20, 20);
        shape2.createAnchor(1, .5);

        drawing.createShape(50, 20, 20, 20);

        // Act
        let cp = drawing.createConnectPolyline(shape1.getGuid(), 0, shape2.getGuid(), 0);
        assert.equal(drawing.getShapes().length, 3);
        console.log(drawing.generateSvg());


        // Assert
        assert.ok(cp.getPathGenerationResult(), "Generate path should success");
    });

    it("Four Shapes Test #1", () => {
        // Arrange
        let drawing = new Drawing(config);

        let shape1 = drawing.createShape(20, 20, 20, 20);
        let anchor1 = shape1.createAnchor(0, .5);
        assert.equal(anchor1.toPoint().x, 20);
        assert.equal(anchor1.toPoint().y, 20 + 10);

        let shape2 = drawing.createShape(200, 30, 20, 20);
        shape2.createAnchor(1, .5);
        shape2.createAnchor(.5, 1);

        let shape3 = drawing.createShape(100, 20, 20, 20);
        shape3.createAnchor(0, .5);

        let shape4 = drawing.createShape(260, 35, 20, 20);
        shape4.createAnchor(1, .5);
        shape4.createAnchor(.5, 1);

        // Act
        let cp1 = drawing.createConnectPolyline(shape1.getGuid(), 0, shape2.getGuid(), 0, 'orange');
        let cp2 = drawing.createConnectPolyline(shape3.getGuid(), 0, shape4.getGuid(), 0, 'red');
        let cp3 = drawing.createConnectPolyline(shape2.getGuid(), 1, shape4.getGuid(), 1, 'green');
        console.log(drawing.generateSvg());


        // Assert
        assert.ok(cp1.getPathGenerationResult(), "Generate path should success");
        assert.ok(cp2.getPathGenerationResult(), "Generate path should success");
        assert.ok(cp3.getPathGenerationResult(), "Generate path should success");
    });

    it("Four Shapes Test #2", () => {
        // Arrange
        let drawing = new Drawing(config);

        let shape1 = drawing.createShape(20, 20, 20, 20);
        let anchor1 = shape1.createAnchor(0, .5);
        assert.equal(anchor1.toPoint().x, 20);
        assert.equal(anchor1.toPoint().y, 20 + 10);

        let shape2 = drawing.createShape(200, 30, 20, 20);
        shape2.createAnchor(1, .5);
        shape2.createAnchor(.5, 1);

        let shape3 = drawing.createShape(100, 20, 20, 20);
        shape3.createAnchor(0, .5);

        let shape4 = drawing.createShape(260, 15, 20, 20);
        shape4.createAnchor(1, .5);
        shape4.createAnchor(.5, 1);

        // Act
        let cp1 = drawing.createConnectPolyline(shape1.getGuid(), 0, shape2.getGuid(), 0, 'orange');
        let cp2 = drawing.createConnectPolyline(shape3.getGuid(), 0, shape4.getGuid(), 0, 'red');
        let cp3 = drawing.createConnectPolyline(shape2.getGuid(), 1, shape4.getGuid(), 1, 'green');
        console.log(drawing.generateSvg());


        // Assert
        assert.ok(cp1.getPathGenerationResult(), "Generate path should success");
        assert.ok(cp2.getPathGenerationResult(), "Generate path should success");
        assert.ok(cp3.getPathGenerationResult(), "Generate path should success");
    });

    it("Four Shapes Test #3", () => {
        // Arrange
        let drawing = new Drawing(config);

        let shape1 = drawing.createShape(80, 20, 20, 20);
        shape1.createAnchor(.5, 1);

        let shape2 = drawing.createShape(80, 120, 20, 20);
        shape2.createAnchor(.5, 0);

        let shape3 = drawing.createShape(20, 60, 20, 20);
        shape3.createAnchor(1, .5);

        let shape4 = drawing.createShape(140, 60, 20, 20);
        shape4.createAnchor(0, .5);

        // Act
        let cp1 = drawing.createConnectPolyline(shape1.getGuid(), 0, shape2.getGuid(), 0, 'green');
        let cp2 = drawing.createConnectPolyline(shape3.getGuid(), 0, shape4.getGuid(), 0, 'red');
        console.log(drawing.generateSvg());


        // Assert
        assert.ok(cp1.getPathGenerationResult(), "Generate path should success");
        assert.ok(cp2.getPathGenerationResult(), "Generate path should success");
    });
});
