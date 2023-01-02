import { Point } from "../Point";
import { AnchorModel } from "./AnchorModel";

export class ShapeModel {
    type: string = 'Shape';
    guid: string;
    points: Point[];
    anchors: AnchorModel[];
    name: string;
    viewName: string;
    arguments: object;
}

export class RectangleModel extends ShapeModel {
    override type = "Rectangle";
    width: number;
    height: number;
}