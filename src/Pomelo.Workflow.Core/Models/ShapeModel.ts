import { Point } from "../Point";
import { AnchorModel } from "./AnchorModel";

export class ShapeModel {
    guid: string;
    points: Point[];
    anchors: AnchorModel[];
    name: string;
    viewName: string;
    arguments: object;
}