// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.

import assert = require('assert');
import { Diagram, DiagramConfiguration } from '../Diagram';

let config = new DiagramConfiguration();
config.renderShape = true;

describe("Drawing Tests", () => {
    it("Svg Generation Test", () => {
        // Arrange
        let diagram = new Diagram(config);

        let shape1 = diagram.createRect(20, 20, 20, 20);
        let anchor1 = shape1.createAnchor(0, .5);
        assert.equal(diagram.getShapes().length, 1);
        assert.equal(shape1.getAnchors().length, 1);

        let shape2 = diagram.createRect(80, 100, 20, 20);
        let anchor2 = shape2.createAnchor(1, .5);
        assert.equal(diagram.getShapes().length, 2);
        assert.equal(shape2.getAnchors().length, 1);

        // Act
        let cp = diagram.createConnectPolyline(shape1.getGuid(), 0, shape2.getGuid(), 0);
        assert.equal(diagram.getConnectPolylines().length, 1);
        console.log('Shape 1:');
        console.log(shape1.points);
        console.log('Shape 2:');
        console.log(shape2.points);
        console.log(`Depatrue: (${shape1.getAnchors()[0].toPoint().x},${shape1.getAnchors()[0].toPoint().y})`);
        console.log(`Destination: (${shape2.getAnchors()[0].toPoint().x},${shape2.getAnchors()[0].toPoint().y})`);
        let ret = cp.getPathGenerationResult();
        let svg = diagram.generateSvg();
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
        let diagram = new Diagram(config);

        let shape1 = diagram.createRect(20, 20, 20, 20);
        let anchor1 = shape1.createAnchor(0, .5);
        assert.equal(anchor1.toPoint().x, 20);
        assert.equal(anchor1.toPoint().y, 20 + 10);

        let shape2 = diagram.createRect(200, 30, 20, 20);
        shape2.createAnchor(1, .5);
        shape2.createAnchor(.5, 1);

        let shape3 = diagram.createRect(100, 20, 20, 20);
        shape3.createAnchor(0, .5);

        let shape4 = diagram.createRect(260, 15, 20, 20);
        shape4.createAnchor(1, .5);
        shape4.createAnchor(.5, 1);

        diagram.createConnectPolyline(shape1.getGuid(), 0, shape2.getGuid(), 0, 'orange');
        diagram.createConnectPolyline(shape3.getGuid(), 0, shape4.getGuid(), 0, 'red');
        diagram.createConnectPolyline(shape2.getGuid(), 1, shape4.getGuid(), 1, 'green');

        // Act
        let json = diagram.serializeToJson();
        console.log(json);

        // Assert
        assert.notEqual(json, null);
    });
});