"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RectangleModel = exports.ShapeModel = void 0;
class ShapeModel {
    constructor() {
        this.type = 'Shape';
    }
}
exports.ShapeModel = ShapeModel;
class RectangleModel extends ShapeModel {
    constructor() {
        super(...arguments);
        this.type = "Rectangle";
    }
}
exports.RectangleModel = RectangleModel;
//# sourceMappingURL=ShapeModel.js.map