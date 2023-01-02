"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrawingHtmlHelper = exports.Drawing = exports.ElementType = exports.DrawingConfiguration = void 0;
const ConnectPolyline_1 = require("./ConnectPolyline");
const Point_1 = require("./Point");
const Shape_1 = require("./Shape");
class DrawingConfiguration {
    constructor() {
        this.padding = 5;
        this.renderShape = false;
        this.shapeStrokeColor = 'blue';
        this.shapeStrokeWidth = 1;
        this.connectPolylineStrokeWidth = 1;
    }
}
exports.DrawingConfiguration = DrawingConfiguration;
var ElementType;
(function (ElementType) {
    ElementType[ElementType["Shape"] = 0] = "Shape";
    ElementType[ElementType["Polyline"] = 1] = "Polyline";
})(ElementType = exports.ElementType || (exports.ElementType = {}));
class Drawing {
    constructor(config, guid = null) {
        // Properties
        this.shapes = [];
        this.connectPolylines = [];
        // Config
        this.config = new DrawingConfiguration();
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
    getHtmlHelper() {
        return this.htmlHelper;
    }
    serializeToJson() {
        let ret = {
            guid: this.guid,
            shapes: this.shapes.map(shape => shape.toViewModel()),
            connectPolylines: this.connectPolylines.map(cpl => ({
                guid: cpl.getGuid(),
                departureShapeGuid: cpl.getDepartureAnchor().shape.getGuid(),
                destinationShapeGuid: cpl.getDestinationAnchor().shape.getGuid(),
                departureAnchorIndex: cpl.getDepartureAnchor().shape.getAnchors().indexOf(cpl.getDepartureAnchor()),
                destinationAnchorIndex: cpl.getDestinationAnchor().shape.getAnchors().indexOf(cpl.getDestinationAnchor()),
                color: cpl.getColor(),
                path: cpl.getPaths().points
            }))
        };
        return JSON.stringify(ret);
    }
    clean() {
        this.shapes.splice(0, this.shapes.length);
        this.connectPolylines.splice(0, this.connectPolylines.length);
        let html = this.getHtmlHelper();
        if (!html) {
            return;
        }
        html.clean();
    }
    deserializeFromJson(json) {
        let model = JSON.parse(json);
        this.clean();
        //let html = this.getHtmlHelper();
        //if (html && model.guid) {
        //    html.getDrawingSvg().setAttribute('data-drawing', model.guid);
        //}
        this.guid = model.guid || this.guid;
        for (let i = 0; i < model.shapes.length; ++i) {
            let shape = model.shapes[i];
            let shapeInstance = shape.type == 'Shape'
                ? this.createShape(shape.points.map(x => new Point_1.Point(x.x, x.y)), shape.guid || this.generateGuid(), shape.viewName, shape.arguments)
                : this.createRect(shape.points[0].x, shape.points[0].y, shape.width, shape.height, shape.guid || this.generateGuid());
            shapeInstance.viewName = shape.viewName;
            shapeInstance.arguments = shape.arguments;
            for (let j = 0; j < shape.anchors.length; ++j) {
                shapeInstance.createAnchor(shape.anchors[j].xPercentage, shape.anchors[j].yPercentage);
            }
        }
        for (let i = 0; i < model.connectPolylines.length; ++i) {
            let cpl = model.connectPolylines[i];
            this.createConnectPolyline(cpl.departureShapeGuid, cpl.departureAnchorIndex, cpl.destinationShapeGuid, cpl.destinationAnchorIndex, cpl.color, cpl.guid || this.generateGuid());
        }
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
    createShape(points, guid = null, viewName = null, args = {}) {
        let shape = new Shape_1.Shape(points, guid || this.generateGuid(), this);
        shape.viewName = viewName;
        shape.arguments = args;
        this.shapes.push(shape);
        return shape;
    }
    createConnectPolyline(departureGuid, departureAnchorIndex, destinationGuid, destinationAnchorIndex, color = '#555', guid = null) {
        let cpl = new ConnectPolyline_1.ConnectPolyline(guid, this);
        cpl.setColor(color);
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
        let ret = `<svg width="${width + this.config.padding}px" height="${height + this.config.padding}px" data-drawing="${this.getGuid()}" version="1.1"
xmlns="http://www.w3.org/2000/svg">
${shapes.join('\r\n')}
${lines.join('\r\n')}

</svg>`;
        return ret;
    }
    mount(selector) {
        if (this.htmlHelper) {
            throw `[Pomelo Workflow] This drawing is already mounted.`;
        }
        this.htmlHelper = new DrawingHtmlHelper(this, selector);
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
exports.Drawing = Drawing;
class DrawingHtmlHelper {
    constructor(drawing, selector) {
        this.mountedElement = null;
        this.maskLayerHtmlId = null;
        this.svgLayerHtmlId = null;
        this.drawing = drawing;
        let doms = this.getDocument().querySelectorAll(selector);
        if (!doms.length) {
            throw `[Pomelo Workflow] ${selector} was not found`;
        }
        this.mountedElement = doms[0];
        this.maskLayerHtmlId = 'pomelo-wf-mask-' + drawing.getGuid();
        this.svgLayerHtmlId = 'pomelo-wf-svg-' + drawing.getGuid();
        this.mountedElement.innerHTML = `<div id="${this.maskLayerHtmlId}"></div><div id="${this.svgLayerHtmlId}">${this.drawing.generateSvg()}</div>`;
    }
    getWindow() {
        return eval('window');
    }
    getDocument() {
        return this.getWindow().document;
    }
    generateAttributeCollection(style) {
        let ret = {};
        if (!style) {
            return ret;
        }
        let splited = style.split(';').map(x => x.trim());
        for (let i = 0; i < splited.length; ++i) {
            let stylePair = splited[0].split(':').map(x => x.trim());
            if (stylePair.length != 2) {
                continue;
            }
            ret[stylePair[0]] = stylePair[1];
        }
        return ret;
    }
    generateAttributeString(style) {
        if (!style) {
            return '';
        }
        return Object.getOwnPropertyNames(style).map(x => `${x}: ${style[x]}`).join('; ');
    }
    setShape(guid, points = null, stylePatch = null) {
        this.setSvgElement(ElementType.Shape, guid, points, stylePatch);
    }
    setConnectPolyline(guid, points = null, stylePatch = null) {
        this.setSvgElement(ElementType.Polyline, guid, points, stylePatch);
    }
    getDrawingSvg() {
        return this.mountedElement.querySelector(`[data-drawing="${this.drawing.getGuid()}"]`);
    }
    getShapeDOM(guid) {
        return this.mountedElement.querySelector(`[data-shape="${guid}"]`);
    }
    getConnectPolylineDOM(guid) {
        return this.mountedElement.querySelector(`[data-polyline="${guid}"]`);
    }
    getShapeDOMs() {
        let ret = this.mountedElement.querySelectorAll('[data-shape]');
        return this.convertNodeListToArray(ret);
    }
    getConnectPolylineDOMs() {
        let ret = this.mountedElement.querySelectorAll('[data-polyline]');
        return this.convertNodeListToArray(ret);
    }
    setSvgElement(elementType, guid, points = null, stylePatch = null) {
        let dom = elementType == ElementType.Shape
            ? this.getShapeDOM(guid)
            : this.getConnectPolylineDOM(guid);
        if (dom == null) {
            //console.warn(`[Pomelo Workflow] ${guid} was not found`);
            return;
        }
        if (points != null) {
            dom.setAttribute('points', points.map(x => `${x.x},${x.y}`).join(' '));
        }
        if (stylePatch != null) {
            let styles = this.generateAttributeCollection(dom.getAttribute('style'));
            let keys = Object.getOwnPropertyNames(stylePatch);
            for (let i = 0; i < keys.length; ++i) {
                styles[keys[i]] = stylePatch[keys[i]];
            }
            dom.setAttribute('style', this.generateAttributeString(styles));
        }
        this.updateSvgBorder();
    }
    clean() {
        this.getDrawingSvg().innerHTML = '';
    }
    refresh() {
        // Clean up
        this.clean();
        // Update
        let shapes = this.drawing.getShapes();
        for (let i = 0; i < shapes.length; ++i) {
            let shape = shapes[i];
            this.updateShape(shape);
        }
        let polylines = this.drawing.getConnectPolylines();
        for (let i = 0; i < polylines.length; ++i) {
            let polyline = polylines[i];
            this.updateConnectPolyline(polyline);
        }
        // Remove
        let shapeGuidsToRemove = this.getShapeDOMs().map(x => x.getAttribute('data-shape')).filter(x => x == 'null' || shapes.every(y => y.getGuid() != x));
        for (let i = 0; i < shapeGuidsToRemove.length; ++i) {
            this.removeShape(shapeGuidsToRemove[i]);
        }
        let connectPolylineGuidsToRemove = this.getConnectPolylineDOMs().map(x => x.getAttribute('data-polyline')).filter(x => x == 'null' || polylines.every(y => y.getGuid() != x));
        for (let i = 0; i < connectPolylineGuidsToRemove.length; ++i) {
            this.removeConnectPolyline(connectPolylineGuidsToRemove[i]);
        }
        // Append
        let shapesToAppend = shapes.filter(x => this.getShapeDOMs().map(x => x.getAttribute('data-shape')).every(y => x.getGuid() != y));
        for (let i = 0; i < shapesToAppend.length; ++i) {
            this.appendShape(shapesToAppend[i]);
        }
        let connectPolylinesToAppend = polylines.filter(x => this.getConnectPolylineDOMs().map(x => x.getAttribute('data-polyline')).every(y => x.getGuid() != y));
        for (let i = 0; i < connectPolylinesToAppend.length; ++i) {
            this.appendConnectPolyline(connectPolylinesToAppend[i]);
        }
        this.updateSvgBorder();
    }
    updateShape(shape) {
        let shapeDOM = this.getShapeDOM(shape.getGuid());
        if (!shapeDOM) {
            return;
        }
        let points = shape.points.concat([shape.points[0]]);
        this.setShape(shape.getGuid(), points, { stroke: this.drawing.getConfig().shapeStrokeColor, 'stroke-width': this.drawing.getConfig().shapeStrokeWidth });
    }
    updateConnectPolyline(connectPolyline) {
        let connectPolylineDOM = this.getShapeDOM(connectPolyline.getGuid());
        if (!connectPolylineDOM) {
            return;
        }
        this.setShape(connectPolyline.getGuid(), connectPolyline.points, { stroke: connectPolyline.getColor(), 'stroke-width': this.drawing.getConfig().connectPolylineStrokeWidth });
    }
    appendShape(shape) {
        let shapeDOM = this.getShapeDOM(shape.getGuid());
        if (shapeDOM) {
            return;
        }
        let svg = shape.generateSvg();
        let element = this.getDocument().createElement('div');
        this.getDrawingSvg().appendChild(element);
        element.outerHTML = svg;
        this.updateSvgBorder();
    }
    appendConnectPolyline(connectPolyline) {
        let connectPolylineDOM = this.getConnectPolylineDOM(connectPolyline.getGuid());
        if (connectPolylineDOM) {
            return;
        }
        let svg = connectPolyline.generateSvg();
        let element = this.getDocument().createElement('div');
        this.getDrawingSvg().appendChild(element);
        element.outerHTML = svg;
        this.updateSvgBorder();
    }
    removeShape(guid) {
        let dom = this.getShapeDOM(guid);
        if (dom) {
            dom.outerHTML = '';
        }
        this.updateSvgBorder();
    }
    removeConnectPolyline(guid) {
        let dom = this.getConnectPolylineDOM(guid);
        if (dom) {
            dom.outerHTML = '';
        }
        this.updateSvgBorder();
    }
    updateSvgBorder() {
        let border = this.drawing.getBorder();
        if (!border) {
            return;
        }
        this.getDrawingSvg().setAttribute('width', (border[1].x + this.drawing.getConfig().padding) + 'px');
        this.getDrawingSvg().setAttribute('height', (border[1].y + this.drawing.getConfig().padding) + 'px');
    }
    convertNodeListToArray(nodes) {
        var array = null;
        try {
            array = Array.prototype.slice.call(nodes, 0);
        }
        catch (ex) {
            array = new Array();
            for (var i = 0, len = nodes.length; i < len; i++) {
                array.push(nodes[i]);
            }
        }
        return array;
    }
}
exports.DrawingHtmlHelper = DrawingHtmlHelper;
//# sourceMappingURL=Drawing.js.map