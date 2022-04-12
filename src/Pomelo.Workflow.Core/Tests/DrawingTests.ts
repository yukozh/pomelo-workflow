import assert = require('assert');
import { Drawing, DrawingConfiguration } from '../Drawing';

let config = new DrawingConfiguration();
config.shapeBorder = true;

describe("Drawing Tests", () => {
    it("Svg Generation Test", () => {
        // Arrange
        let drawing = new Drawing(config);

        let shape1 = drawing.createRect(20, 20, 20, 20);
        let anchor1 = shape1.createAnchor(0, .5);
        assert.equal(drawing.getShapes().length, 1);
        assert.equal(shape1.getAnchors().length, 1);

        let shape2 = drawing.createRect(80, 100, 20, 20);
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
        let svg = drawing.generateSvg();
        console.log(svg);

        // Assert
        assert.ok(ret);
        assert.notEqual(svg, null);
        assert.equal(anchor1.toPoint().x, 20);
        assert.equal(anchor1.toPoint().y, 20 + 10);
        assert.equal(anchor2.toPoint().x, 80 + 20);
        assert.equal(anchor2.toPoint().y, 100 + 10);
        assert.ok(ret, "Generate path should success");
    });


    it("Json Generation Test", () => {
        // Arrange
        let drawing = new Drawing(config);

        let shape1 = drawing.createRect(20, 20, 20, 20);
        let anchor1 = shape1.createAnchor(0, .5);
        assert.equal(anchor1.toPoint().x, 20);
        assert.equal(anchor1.toPoint().y, 20 + 10);

        let shape2 = drawing.createRect(200, 30, 20, 20);
        shape2.createAnchor(1, .5);
        shape2.createAnchor(.5, 1);

        let shape3 = drawing.createRect(100, 20, 20, 20);
        shape3.createAnchor(0, .5);

        let shape4 = drawing.createRect(260, 15, 20, 20);
        shape4.createAnchor(1, .5);
        shape4.createAnchor(.5, 1);

        drawing.createConnectPolyline(shape1.getGuid(), 0, shape2.getGuid(), 0, 'orange');
        drawing.createConnectPolyline(shape3.getGuid(), 0, shape4.getGuid(), 0, 'red');
        drawing.createConnectPolyline(shape2.getGuid(), 1, shape4.getGuid(), 1, 'green');

        // Act
        let json = drawing.serializeToJson();
        console.log(json);

        // Assert
        assert.notEqual(json, null);
    });
});