import { ConnectPolylineModel } from "./ConnectPolylineModel";
import { ShapeModel } from "./ShapeModel";

export class DrawingModel {
    guid: string;
    shapes: ShapeModel[];
    connectPolylines: ConnectPolylineModel[];
    version: string;
}