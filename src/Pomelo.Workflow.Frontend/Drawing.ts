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

export class Drawing implements IUniqueIdentified {
    public guid: string;
    public shapes: Shape[];
    public connectPolylines: ConnectPolyline[];
    private config: DrawingConfiguration;

    public constructor(config: DrawingConfiguration, guid: string | null = null) {
        this.config = new DrawingConfiguration();
        this.config.padding = config.padding || this.config.padding;
        this.config.elementBorder = config.elementBorder || this.config.elementBorder;
        this.config.elementBorderColor = config.elementBorderColor || this.config.elementBorderColor;
        this.config.elementBorderStroke = config.elementBorderStroke || this.config.elementBorderStroke;
        this.config.connectPolylineStroke = config.connectPolylineStroke || this.config.connectPolylineStroke;
        this.guid = guid || this.generateGUID();
    }

    public generateGUID(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    public serializeToJson(): DrawingModel {
        let ret = <DrawingModel>{
            guid: this.guid,
            shapes: this.shapes.map(shape => <ShapeModel>{
                guid: shape.guid,
                left: shape.points[0].x,
                top: shape.points[0].y,
                width: shape.width,
                height: shape.height
            }),
            connectPolylines: this.connectPolylines.map(cpl => <ConnectPolylineModel>{
                guid: cpl.guid,
                departureShapeGuid: cpl.departure.shape.guid,
                destinationShapeGuid: cpl.destination.shape.guid,
                departureAnchorIndex: cpl.departure.shape.anchors.indexOf(cpl.departure),
                destinationAnchorIndex: cpl.destination.shape.anchors.indexOf(cpl.destination),
                path: cpl.path.points,
                color: cpl.color
            })
        };

        return ret;
    }

    public createShape(left: number, top: number, width: number, height: number, guid: string | null = null): Shape {
        let shape = new Shape(left, top, width, height, guid || this.generateGUID());
        this.shapes.push(shape);
        return shape;
    }
}