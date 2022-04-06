import { ConnectPolyline } from "./ConnectPolyline";
import { IUniqueIdentified } from "./IUniqueIdentified";
import { AnchorModel } from "./Models/AnchorModel";
import { ConnectPolylineModel } from "./Models/ConnectPolylineModel";
import { DrawingModel } from "./Models/DrawingModel";
import { ShapeModel } from "./Models/ShapeModel";
import { Shape } from "./Shape";

export class DrawingConfiguration {
    public padding: number = 5;
    public elementBorder: boolean = false;
    public elementBorderColor: string = 'blue';
    public elementBorderStroke: number = 1;
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
        this.config.elementBorder = config.elementBorder || this.config.elementBorder;
        this.config.elementBorderColor = config.elementBorderColor || this.config.elementBorderColor;
        this.config.elementBorderStroke = config.elementBorderStroke || this.config.elementBorderStroke;
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

    public createConnectPolyline(departureGuid: string, departureAnchorIndex: number, destinationGuid: string, destinationAnchorIndex: number): ConnectPolyline {
        let cpl = new ConnectPolyline(this);
        let departure = this.findShapeByGuid(departureGuid);
        let destination = this.findShapeByGuid(destinationGuid);
        cpl.initFromDepartureAndDestination(departure.getAnchors()[departureAnchorIndex], destination.getAnchors()[destinationAnchorIndex]);
        this.connectPolylines.push(cpl);
        return cpl;
    }

    public generateSvg(): string {
        // Render shapes
        let shapes = [];
        if (this.config.elementBorder) {
            shapes = this.getShapes().map(el => `<polyline points="${el.points.map(x => x.x + ',' + x.y).join(' ')} ${el.points[0].x},${el.points[0].y}"
style="fill:none;stroke:${this.config.elementBorderColor};stroke-width:${this.config.elementBorderStroke}"/>`);
        }

        // Render connect polylines
        let lines = this.getConnectPolylines().map(l => `<polyline points="${l.getPaths().points.map(x => x.x + ',' + x.y).join(' ')}"
style="fill:none;stroke:${l.getColor()};stroke-width:${this.config.connectPolylineStroke}"/>`);

        let ret = `<svg width="100%" height="100%" version="1.1"
xmlns="http://www.w3.org/2000/svg">
${shapes.join('\r\n')}
${lines.join('\r\n')}

</svg>`;
        return ret;
    }
}