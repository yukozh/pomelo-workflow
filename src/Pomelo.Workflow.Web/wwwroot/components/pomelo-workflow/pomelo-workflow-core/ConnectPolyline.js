"use strict";
// Copyright (c) Yuko(Yisheng) Zheng. All rights reserved.
// Licensed under the MIT. See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectPolyline = void 0;
const Orientation_1 = require("./Orientation");
const Point_1 = require("./Point");
const Polyline_1 = require("./Polyline");
const Segment_1 = require("./Segment");
class bfsState {
    constructor(path, newPoint, depth = 0) {
        this.path = new Polyline_1.Polyline();
        for (let i = 0; i < path.points.length; ++i) {
            this.path.points.push(path.points[i]);
        }
        this.path.points.push(newPoint);
        this.depth = depth;
        console.log(this.path.points);
    }
}
class ConnectPolyline extends Polyline_1.PolylineBase {
    constructor(guid = null, diagram = null) {
        super();
        this.path = new Polyline_1.Polyline();
        this.padding = 5;
        this.color = '#555';
        this.pathGeneratedSuccessfully = false;
        this.diagram = diagram;
        this.guid = guid || diagram.generateGuid();
        this.padding = diagram.getConfig().padding;
    }
    getGuid() {
        return this.guid;
    }
    getColor() {
        return this.color;
    }
    setColor(color) {
        this.color = color;
    }
    getDashed() {
        return this.dashed;
    }
    setDashed(dashed) {
        this.dashed = dashed;
    }
    setType(type) {
        this.type = type;
    }
    getType() {
        return this.type;
    }
    setArguments(args) {
        this.arguments = args;
    }
    getArguments() {
        return this.arguments;
    }
    getPaths() {
        return this.path;
    }
    getDepartureAnchor() {
        return this.departure;
    }
    getDestinationAnchor() {
        return this.destination;
    }
    getDiagramElements(except) {
        let ret = this.diagram.getShapes().map(x => x).concat(this.diagram.getConnectPolylines().map(x => x));
        if (except) {
            ret = ret.filter(x => !except.some(y => y == x));
        }
        return ret;
    }
    refreshAnchorPositions() {
        this.departurePoint = this.departure.toPointWithPadding(this.padding);
        this.destinationPoint = this.destination.toPointWithPadding(this.padding);
    }
    getPathGenerationResult() {
        return this.pathGeneratedSuccessfully;
    }
    initFromDepartureAndDestination(departure, destination, fastMode = false, except = []) {
        this.pathGeneratedSuccessfully = false;
        this.departure = departure;
        this.destination = destination;
        return this.update(fastMode, except);
    }
    update(fastMode = false, except = null) {
        this.refreshAnchorPositions();
        this.generateElementSegments(this.diagram.getShapes(), this.diagram.getConnectPolylines());
        this.path.points.splice(0, this.path.points.length);
        let ret = fastMode
            ? this.buildPathDFS(this.departurePoint, 0, except)
            : this.buildPathBFS(except);
        if (ret) {
            this.path.points = [this.departure.toPoint()].concat(this.path.points).concat([this.destination.toPoint()]);
        }
        this.optimize();
        this.points = this.path.points;
        this.pathGeneratedSuccessfully = ret;
        return ret;
    }
    optimize() {
        if (this.path.points.length >= 3) {
            if (this.path.points[this.path.points.length - 3].x == this.path.points[this.path.points.length - 2].x
                && this.path.points[this.path.points.length - 2].x == this.path.points[this.path.points.length - 1].x) {
                this.path.points.splice(this.path.points.length - 2, 1);
            }
            if (this.path.points[this.path.points.length - 3].y == this.path.points[this.path.points.length - 2].y
                && this.path.points[this.path.points.length - 2].y == this.path.points[this.path.points.length - 1].y) {
                this.path.points.splice(this.path.points.length - 2, 1);
            }
        }
    }
    generateElementSegments(shapes, connectPolylines) {
        let segments = [];
        let expanded = shapes.map(x => x.toRectalge().cloneAndExpand(this.padding));
        for (let i = 0; i < expanded.length; ++i) {
            let _segments = ConnectPolyline.polylineToSegments(expanded[i]);
            for (let j = 0; j < _segments.length; ++j) {
                segments.push(_segments[j]);
            }
        }
        this.expandedShapeSegments = segments;
        segments = [];
        for (let i = 0; i < shapes.length; ++i) {
            let _segments = ConnectPolyline.polylineToSegments(shapes[i]);
            for (let j = 0; j < _segments.length; ++j) {
                segments.push(_segments[j]);
            }
        }
        this.originalShapeSegments = segments;
        segments = [];
        //for (let i = 0; i < connectPolylines.length; ++i) {
        //    let _segments = ConnectPolyline.polylineToSegments(connectPolylines[i]);
        //    for (let j = 0; j < _segments.length; ++j) {
        //        segments.push(_segments[j]);
        //    }
        //}
        this.polylineSegments = segments;
        this.elementSegments = this.polylineSegments.concat(this.expandedShapeSegments);
    }
    static polylineToSegments(polyline) {
        let ret = [];
        if (polyline.points.length < 2) {
            return ret;
        }
        for (let i = 0; i < polyline.points.length - 1; ++i) {
            let seg = new Segment_1.Segment(polyline.points[i], polyline.points[i + 1]);
            seg.parent = polyline;
            ret.push(seg);
        }
        if (polyline.points.length > 2) {
            let seg = new Segment_1.Segment(polyline.points[0], polyline.points[polyline.points.length - 1]);
            seg.parent = polyline;
            ret.push(seg);
        }
        return ret;
    }
    getElementsBorder(elements) {
        var point1 = new Point_1.Point(this.departurePoint.x, this.departurePoint.y);
        var point2 = new Point_1.Point(this.departurePoint.x, this.departurePoint.y);
        point1.x = Math.min(point1.x, this.destinationPoint.x);
        point1.y = Math.min(point1.y, this.destinationPoint.y);
        point2.x = Math.max(point2.x, this.destinationPoint.x);
        point2.y = Math.max(point2.y, this.destinationPoint.y);
        for (let i = 0; i < elements.length; ++i) {
            for (let j = 0; j < elements[i].points.length; ++j) {
                let _point = elements[i].points[j];
                point1.x = Math.min(point1.x, _point.x);
                point1.y = Math.min(point1.y, _point.y);
                point2.x = Math.max(point2.x, _point.x);
                point2.y = Math.max(point2.y, _point.y);
            }
        }
        if (point1.x < 0) {
            point1.x = 0;
        }
        if (point1.y < 0) {
            point1.y = 0;
        }
        return [point1, point2];
    }
    pop() {
        this.path.points.splice(this.path.points.length - 1, 1);
    }
    buildPathDFS(point, depth = 0, except) {
        this.path.points.push(point);
        if (point.equalsTo(this.destinationPoint)) {
            return true;
        }
        let availablePoints = this.generateAvailableNextPoints(this.path, except);
        for (let i = 0; i < availablePoints.length; ++i) {
            if (this.buildPathDFS(availablePoints[i], depth + 1, except)) {
                return true;
            }
            else {
                this.pop();
            }
        }
        return false;
    }
    buildPathBFS(except) {
        let initState = new bfsState(new Polyline_1.Polyline(), this.departurePoint);
        let queue = [initState];
        while (queue.length) {
            let state = queue.splice(0, 1)[0];
            this.path = state.path;
            if (state.depth > 10) {
                return false;
            }
            if (state.path.points[state.path.points.length - 1].equalsTo(this.destinationPoint)) {
                return true;
            }
            let result = this.generateAvailableNextPoints(state.path, except);
            queue = queue.concat(result.map(x => new bfsState(state.path, x, state.depth + 1)));
        }
    }
    getLastOrientation(path) {
        if (path.points.length < 2) {
            return null;
        }
        return Orientation_1.Orientation.getOrientationFromTwoPoints(path.points[path.points.length - 2], path.points[path.points.length - 1]);
    }
    prioritizeOrientations(path) {
        let orientations = [];
        let point = path.points[path.points.length - 1];
        let absX = Math.abs(this.destinationPoint.x - point.x);
        let absY = Math.abs(this.destinationPoint.y - point.y);
        if (path.points.length == 1) {
            orientations.push(Orientation_1.Orientation.getOrientationFromTwoPoints(this.departure.toPoint(), path.points[0]));
        }
        if (absX > absY) {
            if (this.destinationPoint.x - point.x > 0) {
                if (orientations.indexOf(Orientation_1.AbsoluteOrientation.Right) == -1)
                    orientations.push(Orientation_1.AbsoluteOrientation.Right);
            }
            else {
                if (orientations.indexOf(Orientation_1.AbsoluteOrientation.Left) == -1)
                    orientations.push(Orientation_1.AbsoluteOrientation.Left);
            }
            if (this.destinationPoint.y - point.y > 0) {
                if (orientations.indexOf(Orientation_1.AbsoluteOrientation.Bottom) == -1)
                    orientations.push(Orientation_1.AbsoluteOrientation.Bottom);
            }
            else {
                if (orientations.indexOf(Orientation_1.AbsoluteOrientation.Top) == -1)
                    orientations.push(Orientation_1.AbsoluteOrientation.Top);
            }
        }
        else {
            if (this.destinationPoint.y - point.y > 0) {
                if (orientations.indexOf(Orientation_1.AbsoluteOrientation.Bottom) == -1)
                    orientations.push(Orientation_1.AbsoluteOrientation.Bottom);
            }
            else {
                if (orientations.indexOf(Orientation_1.AbsoluteOrientation.Top) == -1)
                    orientations.push(Orientation_1.AbsoluteOrientation.Top);
            }
            if (this.destinationPoint.x - point.x > 0) {
                if (orientations.indexOf(Orientation_1.AbsoluteOrientation.Right) == -1)
                    orientations.push(Orientation_1.AbsoluteOrientation.Right);
            }
            else {
                if (orientations.indexOf(Orientation_1.AbsoluteOrientation.Left) == -1)
                    orientations.push(Orientation_1.AbsoluteOrientation.Left);
            }
        }
        // Fill other cases
        let allOrientations = [Orientation_1.AbsoluteOrientation.Left, Orientation_1.AbsoluteOrientation.Right, Orientation_1.AbsoluteOrientation.Top, Orientation_1.AbsoluteOrientation.Bottom];
        for (let i = 0; i < allOrientations.length; ++i) {
            let o = allOrientations[i];
            if (orientations.indexOf(o) < 0) {
                orientations.push(o);
            }
        }
        let lastOrientation = this.getLastOrientation(path);
        if (lastOrientation) {
            let reversedOrientation = Orientation_1.Orientation.getReversedOrientation(lastOrientation);
            orientations.splice(orientations.indexOf(reversedOrientation), 1);
        }
        return orientations;
    }
    getElementsX(except) {
        let ret = [];
        for (let i = 0; i < this.getDiagramElements(except).length; ++i) {
            let element = this.getDiagramElements(except)[i];
            for (let j = 0; j < element.points.length; ++j) {
                let result = element.points[j].x;
                if (ret.indexOf(result) < 0) {
                    ret.push(result);
                }
            }
        }
        return ret;
    }
    getElementsY(except) {
        let ret = [];
        for (let i = 0; i < this.getDiagramElements(except).length; ++i) {
            let element = this.getDiagramElements(except)[i];
            for (let j = 0; j < element.points.length; ++j) {
                let result = element.points[j].y;
                if (ret.indexOf(result) < 0) {
                    ret.push(result);
                }
            }
        }
        return ret;
    }
    getCrossedPointsWithSegment(segment, path, except) {
        let ret = [];
        let orientation = Orientation_1.Orientation.getOrientationFromTwoPoints(segment.points[0], segment.points[1]);
        switch (orientation) {
            case Orientation_1.AbsoluteOrientation.Bottom: {
                let elementYs = this.getElementsY(except).filter(x => x > segment.points[0].y);
                for (let i = 0; i < elementYs.length; ++i) {
                    ret.push(new Point_1.Point(segment.points[0].x, elementYs[i]));
                }
                if (this.destinationPoint.y > segment.points[0].y) {
                    ret.push(new Point_1.Point(segment.points[0].x, this.destinationPoint.y));
                }
                break;
            }
            case Orientation_1.AbsoluteOrientation.Top: {
                let elementYs = this.getElementsY(except).filter(x => x < segment.points[0].y);
                for (let i = 0; i < elementYs.length; ++i) {
                    ret.push(new Point_1.Point(segment.points[0].x, elementYs[i]));
                }
                if (this.destinationPoint.y < segment.points[0].y) {
                    ret.push(new Point_1.Point(segment.points[0].x, this.destinationPoint.y));
                }
                break;
            }
            case Orientation_1.AbsoluteOrientation.Right: {
                let elementXs = this.getElementsX(except).filter(x => x > segment.points[0].x);
                for (let i = 0; i < elementXs.length; ++i) {
                    ret.push(new Point_1.Point(elementXs[i], segment.points[0].y));
                }
                if (this.destinationPoint.x > segment.points[0].x) {
                    ret.push(new Point_1.Point(this.destinationPoint.x, segment.points[0].y));
                }
                break;
            }
            case Orientation_1.AbsoluteOrientation.Left: {
                let elementXs = this.getElementsX(except).filter(x => x < segment.points[0].x);
                for (let i = 0; i < elementXs.length; ++i) {
                    ret.push(new Point_1.Point(elementXs[i], segment.points[0].y));
                }
                if (this.destinationPoint.x < segment.points[0].x) {
                    ret.push(new Point_1.Point(this.destinationPoint.x, segment.points[0].y));
                }
                break;
            }
        }
        return ret;
    }
    getCurrentPointToDestinationCrossedSegments(point) {
        let seg = new Segment_1.Segment(point, this.destinationPoint);
        let ret = [];
        let segments = this.originalShapeSegments.filter(x => x.isCrossedBySegment(seg));
        for (let i = 0; i < segments.length; ++i) {
            ret.push(segments[i]);
        }
        segments = this.originalShapeSegments.filter(x => x.isCrossedBySegment(seg));
        for (let i = 0; i < segments.length; ++i) {
            ret.push(segments[i]);
        }
        return ret;
    }
    generateAvailableNextPoints(path, except) {
        let points = [];
        let orientations = this.prioritizeOrientations(path);
        let lastPoint = path.points[path.points.length - 1];
        let border = this.getElementsBorder(this.elementSegments);
        for (let i = 0; i < orientations.length; ++i) {
            let orientation = orientations[i];
            let halfLine = this.generateHalfLine(lastPoint, orientation, border);
            let crossedPoints = this.getCrossedPointsWithSegment(halfLine, path, except);
            crossedPoints = crossedPoints
                .filter(x => x);
            // Don't cross segment
            let unavailableRange = [];
            if (orientation == Orientation_1.AbsoluteOrientation.Bottom || orientation == Orientation_1.AbsoluteOrientation.Top) {
                unavailableRange = this.originalShapeSegments.concat(this.polylineSegments).map(x => x.getDeltaY());
                crossedPoints = crossedPoints.filter(point => point.equalsTo(this.destinationPoint)
                    || point.x == this.destinationPoint.x && this.getCurrentPointToDestinationCrossedSegments(point).length <= 1
                    || point.y == this.destinationPoint.y && this.getCurrentPointToDestinationCrossedSegments(point).length <= 1
                    || unavailableRange.every(range => point.y < range[0] || point.y > range[1]));
            }
            else {
                unavailableRange = this.originalShapeSegments.concat(this.polylineSegments).map(x => x.getDeltaX());
                crossedPoints = crossedPoints.filter(point => point.equalsTo(this.destinationPoint)
                    || point.x == this.destinationPoint.x && this.getCurrentPointToDestinationCrossedSegments(point).length <= 1
                    || point.y == this.destinationPoint.y && this.getCurrentPointToDestinationCrossedSegments(point).length <= 1
                    || unavailableRange.every(range => point.x < range[0] || point.x > range[1]));
            }
            let fixedPoints = [];
            let fixedPoint = this.cutSegment(halfLine, this.padding);
            let elementBorder = this.getElementsBorder(this.elementSegments);
            while (true) {
                if (fixedPoint.x < elementBorder[0].x - this.padding || fixedPoint.y < elementBorder[0].y - this.padding
                    || fixedPoint.x > elementBorder[1].x + this.padding || fixedPoint.y > elementBorder[1].y + this.padding) {
                    break;
                }
                if (fixedPoint.equalsTo(this.destinationPoint) && this.isValidPoint(fixedPoint, path, except)) {
                    break;
                }
                if (orientation == Orientation_1.AbsoluteOrientation.Bottom || orientation == Orientation_1.AbsoluteOrientation.Top) {
                    if (unavailableRange.every(range => fixedPoint.y < range[0] || fixedPoint.y > range[1])) {
                        if (this.isValidPoint(fixedPoint, path, except)) {
                            fixedPoints.push(fixedPoint);
                            break;
                        }
                    }
                }
                else {
                    if (unavailableRange.every(range => fixedPoint.x < range[0] || fixedPoint.x > range[1])) {
                        if (this.isValidPoint(fixedPoint, path, except)) {
                            fixedPoints.push(fixedPoint);
                            break;
                        }
                    }
                }
                fixedPoint = this.extendSegment(new Segment_1.Segment(lastPoint, fixedPoint));
            }
            points = points.concat(crossedPoints).concat(fixedPoints);
        }
        points = points.filter(x => x);
        points = points.filter(x => this.isValidPoint(x, path, except));
        // Greedy: Always try to get closer to the destination
        //let origin = this.destinationPoint;
        //points.sort((a, b) => {
        //    return Math.sqrt((origin.x - a.x) * (origin.x - a.x) + (origin.y - a.y) * (origin.y - a.y)) - Math.sqrt((origin.x - b.x) * (origin.x - b.x) + (origin.y - b.y) * (origin.y - b.y));
        //});
        return points;
    }
    isValidPoint(point, path, except) {
        let count = 0;
        // 0. Null Check
        if (!point) {
            return false;
        }
        // 1. Orientation Check: The point can only move up, down, left or right
        if (path.points.length) {
            let lastPoint = path.points[path.points.length - 1];
            if (point.x != lastPoint.x && point.y != lastPoint.y) {
                return false;
            }
        }
        // 2. Visit Check: The current point should not exist in path
        if (path.points.filter(x => x.equalsTo(point)).length) {
            return false;
        }
        // 3. Avoid turn back
        if (path.points.length >= 3) {
            if (path.points[path.points.length - 2].x == path.points[path.points.length - 1].x
                && path.points[path.points.length - 1].x == point.x) {
                return false;
            }
            if (path.points[path.points.length - 2].y == path.points[path.points.length - 1].y
                && path.points[path.points.length - 1].y == point.y) {
                return false;
            }
        }
        // 4. Border Check
        let border = this.getElementsBorder(this.elementSegments);
        let borderCheckResult = border[0].x - this.padding <= point.x
            && point.x <= border[1].x + this.padding
            && border[0].y - this.padding <= point.y
            && point.y <= border[1].y + this.padding;
        if (!borderCheckResult) {
            return false;
        }
        // 5. Point Cross Check
        {
            let isDestinationOrDeparture = point.equalsTo(this.destinationPoint) || point.equalsTo(this.departurePoint);
            // a) The current point should not in the existed path segment
            for (let i = 0; i < path.points.length - 1; ++i) {
                let seg = new Segment_1.Segment(path.points[i], path.points[i + 1]);
                if (seg.isPointInSegment(point)) {
                    ++count;
                }
            }
            if (!(isDestinationOrDeparture && count <= 1 || count == 0)) {
                //console.debug('Invalid: Point Cross Check: The current point should not in the existed path segment');
                return false;
            }
            // b) The current point should not locate inside of any shapes
            if (this.getDiagramElements(except).filter(x => x.isPointInPolygon(point)).length && !isDestinationOrDeparture) { // Use actual shape(not expanded)
                return false;
            }
            // c) Current segment should not cross with others
            let lastPoint = path.points[path.points.length - 1];
            let segment = new Segment_1.Segment(lastPoint, point);
            if (this.polylineSegments.some(x => segment.getCrossStateWithSegment(x) == Segment_1.SegmentCrossState.Infinite)
                && !segment.points[0].equalsTo(this.departurePoint)
                && !segment.points[1].equalsTo(this.departurePoint)
                && !segment.points[0].equalsTo(this.destinationPoint)
                && !segment.points[1].equalsTo(this.destinationPoint)) {
                return false;
            }
        }
        // 6. Segment Cross Check: The generated segment should not have cross points with others
        let lastPoint = path.points[path.points.length - 1];
        let segment = new Segment_1.Segment(lastPoint, point);
        if (this.polylineSegments.filter(x => x.getCrossStateWithSegment(segment) == Segment_1.SegmentCrossState.Infinite).length) {
            return false;
        }
        count = this.originalShapeSegments.filter(x => x.getCrossStateWithSegment(segment) == Segment_1.SegmentCrossState.Single).length;
        if (count > 0) {
            let isDestinationOrDeparture = point.equalsTo(this.destinationPoint)
                || point.equalsTo(this.departurePoint)
                || lastPoint.equalsTo(this.destinationPoint)
                || lastPoint.equalsTo(this.departurePoint);
            if (isDestinationOrDeparture && count > 1 || !isDestinationOrDeparture) {
                return false;
            }
        }
        return true;
    }
    extendSegment(segment) {
        if (segment.points.some(x => !x)) {
            return null;
        }
        let orientation = Orientation_1.Orientation.getOrientationFromTwoPoints(segment.points[0], segment.points[1]);
        if (orientation == Orientation_1.AbsoluteOrientation.Top) {
            return new Point_1.Point(segment.points[1].x, Math.max(segment.points[1].y - this.padding, 0));
        }
        else if (orientation == Orientation_1.AbsoluteOrientation.Bottom) {
            return new Point_1.Point(segment.points[1].x, segment.points[1].y + this.padding);
        }
        else if (orientation == Orientation_1.AbsoluteOrientation.Left) {
            return new Point_1.Point(Math.max(segment.points[1].x - this.padding, 0), segment.points[1].y);
        }
        else { // Right
            return new Point_1.Point(segment.points[1].x + this.padding, segment.points[1].y);
        }
    }
    cutSegment(segment, length) {
        if (segment.points.some(x => !x)) {
            return null;
        }
        let orientation = Orientation_1.Orientation.getOrientationFromTwoPoints(segment.points[0], segment.points[1]);
        if (orientation == Orientation_1.AbsoluteOrientation.Top) {
            return new Point_1.Point(segment.points[0].x, Math.max(segment.points[0].y - length, 0));
        }
        else if (orientation == Orientation_1.AbsoluteOrientation.Bottom) {
            return new Point_1.Point(segment.points[0].x, segment.points[0].y + length);
        }
        else if (orientation == Orientation_1.AbsoluteOrientation.Left) {
            return new Point_1.Point(Math.max(segment.points[0].x - length, 0), segment.points[0].y);
        }
        else { // Right
            return new Point_1.Point(segment.points[0].x + length, segment.points[0].y);
        }
    }
    contractSegment(segment) {
        if (segment.points.some(x => !x)) {
            return null;
        }
        let ret = null;
        let orientation = Orientation_1.Orientation.getOrientationFromTwoPoints(segment.points[0], segment.points[1]);
        if (orientation == Orientation_1.AbsoluteOrientation.Top) {
            ret = new Point_1.Point(segment.points[1].x, Math.max(segment.points[1].y + this.padding, 0));
        }
        else if (orientation == Orientation_1.AbsoluteOrientation.Bottom) {
            ret = new Point_1.Point(segment.points[1].x, segment.points[1].y - this.padding);
        }
        else if (orientation == Orientation_1.AbsoluteOrientation.Left) {
            ret = new Point_1.Point(Math.max(segment.points[1].x + this.padding, 0), segment.points[1].y);
        }
        else { // Right
            ret = new Point_1.Point(segment.points[1].x - this.padding, segment.points[1].y);
        }
        if (Orientation_1.Orientation.getOrientationFromTwoPoints(segment.points[0], ret) != Orientation_1.Orientation.getOrientationFromTwoPoints(segment.points[0], segment.points[1])) {
            return null;
        }
        return ret;
    }
    generateHalfLine(point, orientation, border) {
        let destination;
        if (orientation == Orientation_1.AbsoluteOrientation.Bottom) {
            destination = new Point_1.Point(point.x, border[1].y + this.padding);
        }
        else if (orientation == Orientation_1.AbsoluteOrientation.Top) {
            destination = new Point_1.Point(point.x, Math.max(border[0].y - this.padding, 0));
        }
        else if (orientation == Orientation_1.AbsoluteOrientation.Right) {
            destination = new Point_1.Point(border[1].x + this.padding, point.y);
        }
        else { // Left
            destination = new Point_1.Point(Math.max(border[0].x - this.padding, 0), point.y);
        }
        return new Segment_1.Segment(point, destination);
    }
    remove() {
        if (!this.diagram) {
            return;
        }
        let elements = this.diagram.getConnectPolylines();
        let index = elements.indexOf(this);
        if (index < 0) {
            return;
        }
        elements.splice(index, 1);
    }
    generateSvg() {
        if (!this.points.length) {
            return '';
        }
        return `<polyline data-polyline="${this.getGuid()}" points="${this.getPaths().points.map(x => x.x + ',' + x.y).join(' ')}"
style="fill:none;stroke:${this.getColor()};stroke-width:${this.diagram.getConfig().connectPolylineStrokeWidth}"/>`;
    }
}
exports.ConnectPolyline = ConnectPolyline;
