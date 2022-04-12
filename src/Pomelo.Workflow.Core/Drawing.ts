import { ConnectPolyline } from "./ConnectPolyline";
import { AnchorModel } from "./Models/AnchorModel";
import { ConnectPolylineModel } from "./Models/ConnectPolylineModel";
import { DrawingModel } from "./Models/DrawingModel";
import { ShapeModel } from "./Models/ShapeModel";
import { Point } from "./Point";
import { PolylineBase } from "./Polyline";
import { Anchor, Rectangle, Shape } from "./Shape";

export class DrawingConfiguration {
    public padding: number = 5;
    public renderShape: boolean = false;
    public shapeStrokeColor: string = 'blue';
    public shapeStrokeWidth: number = 1;
    public connectPolylineStrokeWidth: number = 1;
}

export enum ElementType {
    Shape,
    Polyline
}

export class Drawing {
    private guid: string;
    private shapes: Shape[];
    private connectPolylines: ConnectPolyline[];
    private config: DrawingConfiguration;
    private htmlHelper: DrawingHtmlHelper;

    public constructor(config: DrawingConfiguration, guid: string | null = null) {
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

    public getGuid(): string {
        return this.guid;
    }

    public getConfig(): DrawingConfiguration {
        return this.config;
    }

    public getShapes(): Shape[] {
        return this.shapes;
    }

    public getConnectPolylines(): ConnectPolyline[] {
        return this.connectPolylines;
    }

    public generateGuid(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    public getHtmlHelper(): DrawingHtmlHelper {
        return this.htmlHelper;
    }

    public serializeToJson(): string {
        let ret = <DrawingModel>{
            guid: this.guid,
            shapes: this.shapes.map(shape => <ShapeModel>{
                guid: shape.getGuid(),
                points: shape.points,
                anchors: shape.getAnchors().map(anchor => <AnchorModel>{
                    xPercentage: anchor.xPercentage,
                    yPercentage: anchor.yPercentage
                })
            }),
            connectPolylines: this.connectPolylines.map(cpl => <ConnectPolylineModel>{
                guid: cpl.getGuid(),
                departureShapeGuid: cpl.getDepartureAnchor().shape.getGuid(),
                destinationShapeGuid: cpl.getDestinationAnchor().shape.getGuid(),
                departureAnchorIndex: cpl.getDepartureAnchor().shape.getAnchors().indexOf(cpl.getDepartureAnchor()),
                destinationAnchorIndex: cpl.getDestinationAnchor().shape.getAnchors().indexOf(cpl.getDestinationAnchor()),
                color: cpl.getColor(),
                path: cpl.getPaths().points
            })
        };

        return JSON.stringify(ret);
    }

    public clean(): void {
        this.shapes.splice(0, this.shapes.length);
        this.connectPolylines.splice(0, this.connectPolylines.length);
        let html = this.getHtmlHelper();
        if (!html) {
            return;
        }

        html.clean();
    }

    public deserializeFromJson(json: string): void {
        let model: DrawingModel = JSON.parse(json);

        this.clean();

        let html = this.getHtmlHelper();
        if (html && model.guid) {
            html.getDrawingSvg().setAttribute('data-drawing', model.guid);
        }

        this.guid = model.guid || this.guid;

        for (let i = 0; i < model.shapes.length; ++i) {
            let shape = model.shapes[i];
            let shapeInstance = this.createShape(shape.points.map(x => new Point(x.x, x.y)), shape.guid || this.generateGuid());
            for (let j = 0; j < shape.anchors.length; ++j) {
                shapeInstance.createAnchor(shape.anchors[j].xPercentage, shape.anchors[j].yPercentage);
            }
        }

        for (let i = 0; i < model.connectPolylines.length; ++i) {
            let cpl = model.connectPolylines[i];
            this.createConnectPolyline(cpl.departureShapeGuid, cpl.departureAnchorIndex, cpl.destinationShapeGuid, cpl.destinationAnchorIndex, cpl.color, cpl.guid || this.generateGuid());
        }
    }

    public findShapeByGuid(guid: string): Shape | null {
        let result = this.shapes.filter(x => x.getGuid().toLowerCase() == guid.toLowerCase());
        if (!result.length) {
            return null;
        }

        return result[0];
    }

    public createRect(left: number, top: number, width: number, height: number, guid: string | null = null): Rectangle {
        let shape = new Rectangle(left, top, width, height, guid || this.generateGuid(), this);
        this.shapes.push(shape);
        return shape;
    }

    public createShape(points: Point[], guid: string | null = null): Shape {
        let shape = new Shape(points, guid || this.generateGuid(), this);
        this.shapes.push(shape);
        return shape;
    }

    public createConnectPolyline(departureGuid: string, departureAnchorIndex: number, destinationGuid: string, destinationAnchorIndex: number, color: string = '#555', guid: string | null = null): ConnectPolyline {
        let cpl = new ConnectPolyline(guid, this);
        cpl.setColor(color);
        let departure = this.findShapeByGuid(departureGuid);
        let destination = this.findShapeByGuid(destinationGuid);
        this.connectPolylines.push(cpl);
        cpl.initFromDepartureAndDestination(departure.getAnchors()[departureAnchorIndex], destination.getAnchors()[destinationAnchorIndex]);
        return cpl;
    }

    public getBorder(elements: PolylineBase[] | null = null): Point[] {
        if (elements == null) {
            elements = (<PolylineBase[]>(this.shapes)).concat(<PolylineBase[]>this.connectPolylines);
        }

        if (!elements.length) {
            return null;
        }

        let point1: Point = null;
        let point2: Point = null;
        let isFisrtPoint = true;

        for (let i = 0; i < elements.length; ++i) {
            for (let j = 0; j < elements[i].points.length; ++j) {
                if (isFisrtPoint) {
                    isFisrtPoint = false;
                    point1 = new Point(elements[i].points[j].x, elements[i].points[j].y);
                    point2 = new Point(elements[i].points[j].x, elements[i].points[j].y);
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

    public generateSvg(): string {
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

    public mount(selector: string) {
        if (this.htmlHelper) {
            throw `[Pomelo Workflow] This drawing is already mounted.`;
        }

        this.htmlHelper = new DrawingHtmlHelper(this, selector);
    }

    public isShapeNotConflicted(shape: string | Shape): boolean | null {
        let _shape: Shape;
        if (shape instanceof Shape) {
            _shape = shape;
        } else {
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

    public isRectangleNotConflicted(leftTop: Point, rightBottom: Point): boolean {
        let rect = new Rectangle(leftTop.x, leftTop.y, rightBottom.x - leftTop.x, rightBottom.y - leftTop.y, null, null);
        return this.isShapeNotConflicted(rect);
    }
}

export class DrawingHtmlHelper {
    private drawing: Drawing;
    private mountedElement: any = null;
    private maskLayerHtmlId: string = null;
    private svgLayerHtmlId: string = null;

    public constructor(drawing: Drawing, selector) {
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
    private getWindow(): any {
        return eval('window');
    }

    private getDocument(): any {
        return this.getWindow().document;
    }

    private generateAttributeCollection(style: string): any {
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

    private generateAttributeString(style: any): string {
        if (!style) {
            return '';
        }

        return Object.getOwnPropertyNames(style).map(x => `${x}: ${style[x]}`).join('; ');
    }

    public setShape(guid: string, points: Point[] = null, stylePatch: any = null): void {
        this.setSvgElement(ElementType.Shape, guid, points, stylePatch);
    }

    public setConnectPolyline(guid: string, points: Point[] = null, stylePatch: any = null): void {
        this.setSvgElement(ElementType.Polyline, guid, points, stylePatch);
    }

    public getDrawingSvg(): any {
        return this.mountedElement.querySelector(`[data-drawing="${this.drawing.getGuid()}"]`);
    }

    public getShapeDOM(guid: string): any {
        return this.mountedElement.querySelector(`[data-shape="${guid}"]`);
    }

    public getConnectPolylineDOM(guid: string): any {
        return this.mountedElement.querySelector(`[data-polyline="${guid}"]`);
    }

    public getShapeDOMs(): any[] {
        let ret = this.mountedElement.querySelectorAll('[data-shape]');
        return this.convertNodeListToArray(ret);
    }

    public getConnectPolylineDOMs(): any[] {
        let ret = this.mountedElement.querySelectorAll('[data-polyline]');
        return this.convertNodeListToArray(ret);
    }

    private setSvgElement(elementType: ElementType, guid: string, points: Point[] = null, stylePatch: any = null): void {
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

    public clean(): void {
        this.getDrawingSvg().innerHTML = '';
    }

    public refresh(): void {
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

    public updateShape(shape: Shape): void {
        let shapeDOM = this.getShapeDOM(shape.getGuid());
        if (!shapeDOM) {
            return;
        }

        let points = shape.points.concat([shape.points[0]]);
        this.setShape(shape.getGuid(), points, { stroke: this.drawing.getConfig().shapeStrokeColor, 'stroke-width': this.drawing.getConfig().shapeStrokeWidth });
    }

    public updateConnectPolyline(connectPolyline: ConnectPolyline): void {
        let connectPolylineDOM = this.getShapeDOM(connectPolyline.getGuid());
        if (!connectPolylineDOM) {
            return;
        }

        this.setShape(connectPolyline.getGuid(), connectPolyline.points, { stroke: connectPolyline.getColor(), 'stroke-width': this.drawing.getConfig().connectPolylineStrokeWidth });
    }

    public appendShape(shape: Shape): void {
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

    public appendConnectPolyline(connectPolyline: ConnectPolyline): void {
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

    public removeShape(guid: string): void {
        let dom = this.getShapeDOM(guid);
        if (dom) {
            dom.outerHTML = '';
        }

        this.updateSvgBorder();
    }

    public removeConnectPolyline(guid: string): void {
        let dom = this.getConnectPolylineDOM(guid);
        if (dom) {
            dom.outerHTML = '';
        }

        this.updateSvgBorder();
    }

    public updateSvgBorder(): void {
        let border = this.drawing.getBorder();
        if (!border) {
            return;
        }

        this.getDrawingSvg().setAttribute('width', (border[1].x + this.drawing.getConfig().padding) + 'px');
        this.getDrawingSvg().setAttribute('height', (border[1].y + this.drawing.getConfig().padding) + 'px');
    }

    private convertNodeListToArray(nodes) {
        var array = null;
        try {
            array = Array.prototype.slice.call(nodes, 0);
        } catch (ex) {
            array = new Array();
            for (var i = 0, len = nodes.length; i < len; i++) {
                array.push(nodes[i]);
            }
        }

        return array;
    }
}