// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.

import { ConnectPolylineModel } from "./ConnectPolylineModel";
import { ShapeModel } from "./ShapeModel";

export class DiagramModel {
    guid: string;
    shapes: ShapeModel[];
    connectPolylines: ConnectPolylineModel[];
    version: string;
}