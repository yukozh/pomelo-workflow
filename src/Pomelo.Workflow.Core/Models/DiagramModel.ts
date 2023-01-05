import { ConnectPolylineModel } from "./ConnectPolylineModel";
import { ShapeModel } from "./ShapeModel";

export class DiagramModel {
    guid: string;
    shapes: ShapeModel[];
    connectPolylines: ConnectPolylineModel[];
    version: string;
}