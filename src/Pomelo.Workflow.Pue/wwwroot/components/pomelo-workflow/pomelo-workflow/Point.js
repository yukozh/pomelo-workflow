"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Point = void 0;
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    equalsTo(point) {
        return point.x == this.x && point.y == this.y;
    }
}
exports.Point = Point;
//# sourceMappingURL=Point.js.map