import { ConnectPolyline } from "./ConnectPolyline";
import { AnchorModel } from "./Models/AnchorModel";
import { ConnectPolylineModel } from "./Models/ConnectPolylineModel";
import { DiagramModel } from "./Models/DiagramModel";
import { ShapeModel } from "./Models/ShapeModel";
import { Point } from "./Point";
import { PolylineBase } from "./Polyline";
import { Anchor, Rectangle, Shape } from "./Shape";

export class DiagramConfiguration
{
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

export class Diagram {
    private guid: string;
    private shapes: Shape[];
    private connectPolylines: ConnectPolyline[];
    private config: DiagramConfiguration;

    public constructor(config: DiagramConfiguration, guid: string | null = null) {
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

    public getGuid(): string {
        return this.guid;
    }

    public getConfig(): DiagramConfiguration {
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
        let ret = <DiagramModel>{
            guid: this.guid,
            shapes: this.shapes.map(shape => shape.toViewModel()),
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
    }

    public deserializeFromJson(json: string): void {
        let model: DiagramModel = JSON.parse(json);

        this.clean();

        this.guid = model.guid || this.guid;

        for (let i = 0; i < model.shapes.length; ++i) {
            let shape:any = model.shapes[i];
            let shapeInstance = shape.type == 'Shape'
                ? this.createShape(shape.points.map(x => new Point(x.x, x.y)), shape.guid || this.generateGuid(), shape.node, shape.arguments)
                : this.createRect(shape.points[0].x, shape.points[0].y, shape.width, shape.height, shape.guid || this.generateGuid());
            shapeInstance.node = shape.node;
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

    public createShape(points: Point[], guid: string | null = null, node: string = null, args: object = {}): Shape {
        let shape = new Shape(points, guid || this.generateGuid(), this);
        shape.node = node;
        shape.arguments = args;
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
        let ret = `<svg width="${width + this.config.padding}px" height="${height + this.config.padding}px" data-diagram="${this.getGuid()}" version="1.1"
xmlns="http://www.w3.org/2000/svg">
${shapes.join('\r\n')}
${lines.join('\r\n')}

</svg>`;
        return ret;
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