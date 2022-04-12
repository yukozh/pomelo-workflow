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

export class Drawing {
    private guid: string;
    private shapes: Shape[];
    private connectPolylines: ConnectPolyline[];
    private config: DrawingConfiguration;

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
            this.createConnectPolyline(cpl.departureShapeGuid, cpl.departureAnchorIndex, cpl.destinationShapeGuid, cpl.destinationAnchorIndex);
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
        let shape = new Shape(left, top, width, height, guid || this.generateGuid());
        this.shapes.push(shape);
        return shape;
    }

    public createConnectPolyline(departureGuid: string, departureAnchorIndex: number, destinationGuid: string, destinationAnchorIndex: number, color: string = '#555', guid: string | null = null): ConnectPolyline {
        let cpl = new ConnectPolyline(this, guid);
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
            shapes = this.getShapes().map(el => `<polyline data-shape="${el.getGuid()}" points="${el.points.map(x => x.x + ',' + x.y).join(' ')} ${el.points[0].x},${el.points[0].y}"
style="fill:none;stroke:${this.config.shapeBorderColor};stroke-width:${this.config.shapeBorderStrokeWidth}"/>`);
        }

        // Render connect polylines
        let lines = this.getConnectPolylines().map(l => `<polyline data-polyline="${l.getGuid()}" points="${l.getPaths().points.map(x => x.x + ',' + x.y).join(' ')}"
style="fill:none;stroke:${l.getColor()};stroke-width:${this.config.connectPolylineStroke}"/>`);

        let width = border ? border[1].x : 0;
        let height = border ? border[1].y : 0;
        let ret = `<svg width="${width + this.config.padding}px" height="${height + this.config.padding}px" data-drawing="${this.getGuid()}" version="1.1"
xmlns="http://www.w3.org/2000/svg">
${shapes.join('\r\n')}
${lines.join('\r\n')}

</svg>`;
        return ret;
    }
}