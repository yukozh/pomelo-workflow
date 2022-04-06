import { AnchorModel } from "./AnchorModel";

export class ShapeModel {
    guid: string;
    top: number;
    left: number;
    width: number;
    height: number;
    anchors: AnchorModel[];
    name: string;
}