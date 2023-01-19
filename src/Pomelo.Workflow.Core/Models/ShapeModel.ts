// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.

import { Point } from "../Point";
import { AnchorModel } from "./AnchorModel";

export class ShapeModel {
    type: string = 'Shape';
    guid: string;
    points: Point[];
    anchors: AnchorModel[];
    name: string;
    node: string;
    arguments: object;
}

export class RectangleModel extends ShapeModel {
    override type = "Rectangle";
    width: number;
    height: number;
}