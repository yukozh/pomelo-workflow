// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.

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