"use strict";
// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Diagram = exports.ElementType = exports.DiagramConfiguration = void 0;
const ConnectPolyline_1 = require("./ConnectPolyline");
const Point_1 = require("./Point");
const Shape_1 = require("./Shape");
class DiagramConfiguration {
    constructor() {
        this.padding = 5;
        this.renderShape = false;
        this.shapeStrokeColor = 'blue';
        this.shapeStrokeWidth = 1;
        this.connectPolylineStrokeWidth = 1;
    }
}
exports.DiagramConfiguration = DiagramConfiguration;
var ElementType;
(function (ElementType) {
    ElementType[ElementType["Shape"] = 0] = "Shape";
    ElementType[ElementType["Polyline"] = 1] = "Polyline";
})(ElementType = exports.ElementType || (exports.ElementType = {}));
class Diagram {
    constructor(config, guid = null) {
        // Properties
        this.shapes = [];
        this.connectPolylines = [];
        // Config
        this.config = new DiagramConfiguration();
        this.config.padding = config.padding || this.config.padding;
        this.config.renderShape = config.renderShape || this.config.renderShape;
        this.config.shapeStrokeColor = config.shapeStrokeColor || this.config.shapeStrokeColor;
        this.config.shapeStrokeWidth = config.shapeStrokeWidth || this.config.shapeStrokeWidth;
        this.config.connectPolylineStrokeWidth = config.connectPolylineStrokeWidth || this.config.connectPolylineStrokeWidth;
        this.guid = guid || this.generateGuid();
    }
    getGuid() {
        return this.guid;
    }
    getConfig() {
        return this.config;
    }
    getShapes() {
        return this.shapes;
    }
    getConnectPolylines() {
        return this.connectPolylines;
    }
    generateGuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    toViewModel() {
        return {
            guid: this.guid,
            shapes: this.shapes.map(shape => shape.toViewModel()),
            connectPolylines: this.connectPolylines.map(cpl => ({
                guid: cpl.getGuid(),
                departureShapeGuid: cpl.getDepartureAnchor().shape.getGuid(),
                destinationShapeGuid: cpl.getDestinationAnchor().shape.getGuid(),
                departureAnchorIndex: cpl.getDepartureAnchor().shape.getAnchors().indexOf(cpl.getDepartureAnchor()),
                destinationAnchorIndex: cpl.getDestinationAnchor().shape.getAnchors().indexOf(cpl.getDestinationAnchor()),
                color: cpl.getColor(),
                path: cpl.getPaths().points,
                type: cpl.getType(),
                arguments: cpl.getArguments(),
                dashed: cpl.getDashed()
            }))
        };
    }
    toJson() {
        return JSON.stringify(this.toViewModel());
    }
    clean() {
        this.shapes.splice(0, this.shapes.length);
        this.connectPolylines.splice(0, this.connectPolylines.length);
    }
    load(model) {
        this.clean();
        this.guid = model.guid || this.guid;
        for (let i = 0; i < model.shapes.length; ++i) {
            let shape = model.shapes[i];
            let shapeInstance = shape.type == 'Shape'
                ? this.createShape(shape.points.map(x => new Point_1.Point(x.x, x.y)), shape.guid || this.generateGuid(), shape.node, shape.arguments)
                : this.createRect(shape.points[0].x, shape.points[0].y, shape.width, shape.height, shape.guid || this.generateGuid());
            shapeInstance.node = shape.node;
            shapeInstance.arguments = shape.arguments;
            shapeInstance.name = shape.name;
            for (let j = 0; j < shape.anchors.length; ++j) {
                shapeInstance.createAnchor(shape.anchors[j].xPercentage, shape.anchors[j].yPercentage);
            }
        }
        for (let i = 0; i < model.connectPolylines.length; ++i) {
            let cplModel = model.connectPolylines[i];
            this.createConnectPolyline(cplModel.departureShapeGuid, cplModel.departureAnchorIndex, cplModel.destinationShapeGuid, cplModel.destinationAnchorIndex, cplModel.color, cplModel.type, cplModel.arguments, cplModel.dashed, cplModel.guid || this.generateGuid());
        }
    }
    loadJson(json) {
        this.load(JSON.parse(json));
    }
    findShapeByGuid(guid) {
        let result = this.shapes.filter(x => x.getGuid().toLowerCase() == guid.toLowerCase());
        if (!result.length) {
            return null;
        }
        return result[0];
    }
    createRect(left, top, width, height, guid = null) {
        let shape = new Shape_1.Rectangle(left, top, width, height, guid || this.generateGuid(), this);
        this.shapes.push(shape);
        return shape;
    }
    createShape(points, guid = null, node = null, args = {}) {
        let shape = new Shape_1.Shape(points, guid || this.generateGuid(), this);
        shape.node = node;
        shape.arguments = args;
        this.shapes.push(shape);
        return shape;
    }
    createConnectPolyline(departureGuid, departureAnchorIndex, destinationGuid, destinationAnchorIndex, color = '#555', type = null, args = null, dashed = false, guid = null) {
        let cpl = new ConnectPolyline_1.ConnectPolyline(guid, this);
        cpl.setColor(color);
        cpl.setType(type);
        cpl.setArguments(args);
        cpl.setDashed(dashed);
        let departure = this.findShapeByGuid(departureGuid);
        let destination = this.findShapeByGuid(destinationGuid);
        this.connectPolylines.push(cpl);
        cpl.initFromDepartureAndDestination(departure.getAnchors()[departureAnchorIndex], destination.getAnchors()[destinationAnchorIndex]);
        return cpl;
    }
    getBorder(elements = null) {
        if (elements == null) {
            elements = (this.shapes).concat(this.connectPolylines);
        }
        if (!elements.length) {
            return null;
        }
        let point1 = null;
        let point2 = null;
        let isFisrtPoint = true;
        for (let i = 0; i < elements.length; ++i) {
            for (let j = 0; j < elements[i].points.length; ++j) {
                if (isFisrtPoint) {
                    isFisrtPoint = false;
                    point1 = new Point_1.Point(elements[i].points[j].x, elements[i].points[j].y);
                    point2 = new Point_1.Point(elements[i].points[j].x, elements[i].points[j].y);
                }
                let _point = elements[i].points[j];
                point1.x = Math.min(point1.x, _point.x);
                point1.y = Math.min(point1.y, _point.y);
                point2.x = Math.max(point2.x, _point.x);
                point2.y = Math.max(point2.y, _point.y);
            }
        }
        if (point1.x < 0) {
            point1.x = 0;
        }
        if (point1.y < 0) {
            point1.y = 0;
        }
        return [point1, point2];
    }
    generateSvg() {
        // Get border
        let border = this.getBorder();
        // Render shapes
        let shapes = [];
        if (this.config.renderShape) {
            shapes = this.getShapes().map(el => el.generateSvg());
        }
        // Render connect polylines
        let lines = this.getConnectPolylines().map(l => l.generateSvg());
        let width = border ? border[1].x : 0;
        let height = border ? border[1].y : 0;
        let ret = `<svg width="${width + this.config.padding}px" height="${height + this.config.padding}px" data-diagram="${this.getGuid()}" version="1.1"
xmlns="http://www.w3.org/2000/svg">
${shapes.join('\r\n')}
${lines.join('\r\n')}

</svg>`;
        return ret;
    }
    isShapeNotConflicted(shape) {
        let _shape;
        if (shape instanceof Shape_1.Shape) {
            _shape = shape;
        }
        else {
            let shapes = this.shapes.filter(x => x.getGuid() == shape);
            if (!shapes.length) {
                return null;
            }
            shape = shapes[0];
        }
        let expandedShape = shape.toRectalge().cloneAndExpand(this.config.padding);
        let shapes = this.shapes.filter(x => x.getGuid() != _shape.getGuid()).map(x => x.toRectalge().cloneAndExpand(this.config.padding));
        for (let i = 0; i < expandedShape.points.length; ++i) {
            let point = shape.points[i];
            if (shapes.some(x => x.isPointInPolygon(point))) {
                return false;
            }
        }
        return true;
    }
    isRectangleNotConflicted(leftTop, rightBottom) {
        let rect = new Shape_1.Rectangle(leftTop.x, leftTop.y, rightBottom.x - leftTop.x, rightBottom.y - leftTop.y, null, null);
        return this.isShapeNotConflicted(rect);
    }
}
exports.Diagram = Diagram;
