import { PointModel } from "./PointModel";

export interface ConnectPolylineModel {
    guid: string,
    departureShapeGuid: string;
    departureAnchorIndex: number;
    destinationShapeGuid: string;
    destinationAnchorIndex: number;
    path: PointModel[];
    color: string;
}