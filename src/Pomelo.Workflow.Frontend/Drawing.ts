import { ConnectPolyline } from "./ConnectPolyline";
import { IUniqueIdentified } from "./IUniqueIdentified";
import { ConnectPolylineModel } from "./Models/ConnectPolylineModel";
import { DrawingModel } from "./Models/DrawingModel";
import { ShapeModel } from "./Models/ShapeModel";
import { PolylineBase } from "./Polyline";
import { Shape } from "./Shape";

export class Drawing implements IUniqueIdentified {
    public guid: string;
    public shapes: Shape[];
    public connectPolylines: ConnectPolyline[];

    public serializeToJson() {
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
                color: null
            })
        };
    }
}