import { ConnectPolylineModel } from "./ConnectPolylineModel";
import { ShapeModel } from "./ShapeModel";

export interface DrawingModel {
    guid: string;
    shapes: ShapeModel[],
    connectPolylines: ConnectPolylineModel[]
}