import { ConnectPolyline } from "./ConnectPolyline";
import { AnchorModel } from "./Models/AnchorModel";
import { ConnectPolylineModel } from "./Models/ConnectPolylineModel";
import { DrawingModel } from "./Models/DrawingModel";
import { ShapeModel } from "./Models/ShapeModel";
import { Point } from "./Point";
import { PolylineBase } from "./Polyline";
import { Shape } from "./Shape";

export class DrawingConfiguration {
    public padding: number = 5;
    public shapeBorder: boolean = false;
    public shapeBorderColor: string = 'blue';
    public shapeBorderStrokeWidth: number = 1;
    public connectPolylineStroke: number = 1;
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
        this.config.shapeBorder = config.shapeBorder || this.config.shapeBorder;
        this.config.shapeBorderColor = config.shapeBorderColor || this.config.shapeBorderColor;
        this.config.shapeBorderStrokeWidth = config.shapeBorderStrokeWidth || this.config.shapeBorderStrokeWidth;
        this.config.connectPolylineStroke = config.connectPolylineStroke || this.config.connectPolylineStroke;

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

    public serializeToJson(): string {
        let ret = <DrawingModel>{
            guid: this.guid,
            shapes: this.shapes.map(shape => <ShapeModel>{
                guid: shape.getGuid(),
                left: shape.points[0].x,
                top: shape.points[0].y,
                width: shape.getWidth(),
                height: shape.getHeight(),
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

    public deserializeFromJson(json: string): void {
        let model: DrawingModel = JSON.parse(json);
        this.guid = model.guid || this.guid;

        for (let i = 0; i < model.shapes.length; ++i) {
            let shape = model.shapes[i];
            this.createShape(shape.left, shape.top, shape.width, shape.height, shape.guid);
        }

        for (let i = 0; i < model.connectPolylines.length; ++i) {
            let cpl = model.connectPolylines[i];
            this.createConnectPolyline(cpl.departureShapeGuid, cpl.departureAnchorIndex, cpl.destinationShapeGuid, cpl.destinationAnchorIndex, cpl.guid);
        }
    }

    public findShapeByGuid(guid: string): Shape | null {
        let result = this.shapes.filter(x => x.getGuid().toLowerCase() == guid.toLowerCase());
        if (!result.length) {
            return null;
        }

        return result[0];
    }

    public createShape(left: number, top: number, width: number, height: number, guid: string | null = null): Shape {
        let shape = new Shape(left, top, width, height, guid || this.generateGuid(), this);
        this.shapes.push(shape);
        return shape;
    }

    public createConnectPolyline(departureGuid: string, departureAnchorIndex: number, destinationGuid: string, destinationAnchorIndex: number, color: string = '#555', guid: string | null = null): ConnectPolyline {
        let cpl = new ConnectPolyline(guid, this);
        cpl.setColor(color);
        let departure = this.findShapeByGuid(departureGuid);
        let destination = this.findShapeByGuid(destinationGuid);
        cpl.initFromDepartureAndDestination(departure.getAnchors()[departureAnchorIndex], destination.getAnchors()[destinationAnchorIndex]);
        this.connectPolylines.push(cpl);
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
        if (this.config.shapeBorder) {
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
        this.mountedElement.innerHTML = `<div id="${this.maskLayerHtmlId}"></div><div id="${this.svgLayerHtmlId}"></div>`;
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

    public getShapeDOM(guid: string): any {
        return this.getDocument().querySelector(`[data-shape="${guid}"]`);
    }

    public getConnectPolylineDOM(guid: string): any {
        return this.getDocument().querySelector(`[data-polyline="${guid}"]`);
    }

    private setSvgElement(elementType: ElementType, guid: string, points: Point[] = null, stylePatch: any = null): void {
        let dom = elementType == ElementType.Shape
            ? this.getShapeDOM(guid)
            : this.getConnectPolylineDOM(guid);

        if (dom == null) {
            throw `[Pomelo Workflow] ${guid} was not found`;
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
    }

    public refresh(): void {
        let shapes = this.drawing.getShapes();
        for (let i = 0; i < shapes.length; ++i) {
            let shape = shapes[i];
            let dom = this.getShapeDOM(shape.getGuid());
            if (dom) {
                this.setShape(shape.getGuid(), shape.points,
                    {
                        stroke: this.drawing.getConfig().shapeBorderColor,
                        'stroke-width': this.drawing.getConfig().shapeBorderStrokeWidth
                    });
            }
        }

        let polylines = this.drawing.getConnectPolylines();
        for (let i = 0; i < polylines.length; ++i) {
            let polyline = polylines[i];
            let dom = this.getConnectPolylineDOM(polyline.getGuid());
            if (dom) {
                this.setShape(polyline.getGuid(), polyline.points,
                    {
                        stroke: polyline.getColor(),
                        'stroke-width': this.drawing.getConfig().connectPolylineStroke
                    });
            }
        }
    }
}