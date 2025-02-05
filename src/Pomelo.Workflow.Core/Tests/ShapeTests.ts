// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.

import assert = require('assert');
import { Rectangle } from '../Shape';

describe("Shape Tests", () => {
    it("Calculate Anchor Point", () => {
        let shape = new Rectangle(100, 100, 10, 10, null);

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
