import { ConnectPolyline } from "./ConnectPolyline";
import { IUniqueIdentified } from "./IUniqueIdentified";
import { PolylineBase } from "./Polyline";

export class Drawing implements IUniqueIdentified {
    public guid: string;
    public shapes: PolylineBase[];
    public connectPolylines: ConnectPolyline[];
}