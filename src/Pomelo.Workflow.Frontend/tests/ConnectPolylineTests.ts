import assert = require('assert');
import { ConnectPolyline } from '../ConnectPolyline';
import { Point } from '../Point';

describe("ConnectPolyline Tests", () => {
    it("No Blocker Test", () => {
        let cp1 = new ConnectPolyline();
        assert.ok(cp1.initFromDepartureAndDestination(new Point(20, 20), new Point(100, 100), []), "This should success");

        let cp2 = new ConnectPolyline();
        assert.ok(cp2.initFromDepartureAndDestination(new Point(20, 20), new Point(60, 100), []), "This should success");
    });
});
