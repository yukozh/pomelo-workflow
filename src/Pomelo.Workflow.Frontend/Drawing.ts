import { ConnectPolyline } from "./ConnectPolyline";
import { PolylineBase } from "./Polyline";

export class Drawing {
    public shapes: PolylineBase[];
    public connectPolylines: ConnectPolyline[];
}