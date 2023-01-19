import { PointModel } from "./PointModel";

export class ConnectPolylineModel {
    guid: string;
    departureShapeGuid: string;
    departureAnchorIndex: number;
    destinationShapeGuid: string;
    destinationAnchorIndex: number;
    path: PointModel[];
    color: string;
    dashed: boolean;
    type: string;
    arguments: object;
}