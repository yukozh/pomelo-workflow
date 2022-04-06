import { Drawing } from "./Drawing";
import { ExtremePoint } from "./ExtremePoint";
import { AbsoluteOrientation, Orientation, RelativeOrientation } from "./Orientation";
import { Point } from "./Point";
import { PolylineBase, Polyline } from "./Polyline";
import { Segment, SegmentCrossState } from "./Segment";
import { Anchor, Shape } from "./Shape";

enum PointState {
    CrossPoint,
    CrossSegment
}

class bfsState {
    path: Polyline;
    depth: number;

    public constructor(path: Polyline, newPoint: Point, depth: number = 0) {
        this.path = new Polyline();
        for (let i = 0; i < path.points.length; ++i) {
            this.path.points.push(path.points[i]);
        }
        this.path.points.push(newPoint);
        this.depth = depth;
    }
}

export class ConnectPolyline extends PolylineBase {
    private guid: string;
    private departure: Anchor;
    private destination: Anchor;
    private path: PolylineBase = new Polyline();
    private padding = 5;
    private departurePoint: Point;
    private destinationPoint: Point;
    private elementSegments: Segment[];
    private expandedShapeSegments: Segment[];
    private originalShapeSegments: Segment[];
    private polylineSegments: Segment[];
    private color: string = '#555';
    private drawing: Drawing;
    private pathGeneratedSuccessfully: boolean = false;

    public constructor(drawing: Drawing | null = null) {
        super();
        this.drawing = drawing;
    }

    public getGuid(): string {
        return this.guid;
    }

    public setColor(color: string): void {
        this.color = color;
    }

    public getColor(): string {
        return this.color;
    }

    public getPaths(): PolylineBase {
        return this.path;
    }

    public getDepartureAnchor(): Anchor {
        return this.departure;
    }

    public getDestinationAnchor(): Anchor {
        return this.destination;
    }

    private getDrawingElements(): PolylineBase[] {
        return this.drawing.getShapes().map(x => <PolylineBase>x).concat(this.drawing.getConnectPolylines().map(x => <PolylineBase>x));
    }

    private refreshAnchorPositions(): void {
        this.departurePoint = this.departure.toPointWithPadding(this.padding);
        this.destinationPoint = this.destination.toPointWithPadding(this.padding);
    }

    public getPathGenerationResult(): boolean {
        return this.pathGeneratedSuccessfully;
    }

    public initFromDepartureAndDestination(departure: Anchor, destination: Anchor, useBFS: boolean = false): boolean {
        this.pathGeneratedSuccessfully = false;
        this.departure = departure;
        this.destination = destination;
        this.refreshAnchorPositions();
        this.generateElementSegments(this.drawing.getShapes(), this.drawing.getConnectPolylines());
        this.path.points.splice(0, this.path.points.length);
        let ret = useBFS
            ? this.buildPathBFS()
            : this.buildPathDFS(this.departurePoint);
        if (ret) {
            this.path.points = [departure.toPoint()].concat(this.path.points).concat([destination.toPoint()]);
        }

        this.points = this.path.points;
        this.pathGeneratedSuccessfully = ret;
        return ret;
    }

    private generateElementSegments(shapes: Shape[], connectPolylines: ConnectPolyline[]): void {
        let segments: Segment[] = [];
        let expanded = shapes.map(x => x.cloneAndExpand(this.padding));
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
        for (let i = 0; i < connectPolylines.length; ++i) {
            let _segments = ConnectPolyline.polylineToSegments(connectPolylines[i]);
            for (let j = 0; j < _segments.length; ++j) {
                segments.push(_segments[j]);
            }
        }
        this.polylineSegments = segments;
        this.elementSegments = this.polylineSegments.concat(this.expandedShapeSegments);
    }

    private static polylineToSegments(polyline: Polyline): Segment[] {
        let ret: Segment[] = [];

        if (polyline.points.length < 2) {
            return ret;
        }

        for (let i = 0; i < polyline.points.length - 1; ++i) {
            let seg = new Segment(polyline.points[i], polyline.points[i + 1]);
            seg.parent = polyline;
            ret.push(seg);
        }

        if (polyline.points.length > 2) {
            let seg = new Segment(polyline.points[0], polyline.points[polyline.points.length - 1]);
            seg.parent = polyline;
            ret.push(seg);
        }

        return ret;
    }

    private getElementsBorder(elements: PolylineBase[]): Point[] {
        var point1: Point = new Point(this.departurePoint.x, this.departurePoint.y);
        var point2: Point = new Point(this.departurePoint.x, this.departurePoint.y);

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


    private pop(): void {
        this.path.points.splice(this.path.points.length - 1, 1);
    }

    private buildPathDFS(point: Point, depth: number = 0): boolean {
        this.path.points.push(point);
        if (point.equalsTo(this.destinationPoint)) {
            return true;
        }

        let availablePoints = this.generateAvailableNextPoints(this.path);
        for (let i = 0; i < availablePoints.length; ++i) {
            if (this.buildPathDFS(availablePoints[i], depth + 1)) {
                return true;
            } else {
                this.pop();
            }
        }

        return false;
    }

    private buildPathBFS(): boolean {
        let initState = new bfsState(new Polyline(), this.departurePoint);
        let queue: bfsState[] = [initState];
        while (queue.length) {
            let state = queue.splice(0, 1)[0];
            this.path = state.path;
            if (state.depth > 10) {
                return false;
            }
            if (state.path.points[state.path.points.length - 1].equalsTo(this.destinationPoint)) {
                return true;
            }

            let result = this.generateAvailableNextPoints(state.path);
            let destination = result.filter(x => x.equalsTo(this.destinationPoint));
            if (destination.length) {
                let resultState = new bfsState(state.path, destination[0], state.depth + 1);
                this.path = resultState.path;
                return true;
            }

            queue = queue.concat(this.generateAvailableNextPoints(state.path).map(x => new bfsState(state.path, x, state.depth + 1)));
        }
    }

    private getLastOrientation(path: PolylineBase): AbsoluteOrientation | null {
        if (path.points.length < 2) {
            return null;
        }

        return Orientation.getOrientationFromTwoPoints(path.points[path.points.length - 2], path.points[path.points.length - 1]);
    }

    private prioritizeOrientations(path: PolylineBase): AbsoluteOrientation[] {
        let orientations: AbsoluteOrientation[] = [];
        let point = path.points[path.points.length - 1];
        let absX = Math.abs(this.destinationPoint.x - point.x);
        let absY = Math.abs(this.destinationPoint.y - point.y);

        if (absX > absY) {
            if (this.destinationPoint.x - point.x > 0) {
                orientations.push(AbsoluteOrientation.Right);
            } else {
                orientations.push(AbsoluteOrientation.Left);
            }

            if (this.destinationPoint.y - point.y > 0) {
                orientations.push(AbsoluteOrientation.Bottom);
            } else {
                orientations.push(AbsoluteOrientation.Top);
            }
        } else {
            if (this.destinationPoint.y - point.y > 0) {
                orientations.push(AbsoluteOrientation.Bottom);
            } else {
                orientations.push(AbsoluteOrientation.Top);
            }

            if (this.destinationPoint.x - point.x > 0) {
                orientations.push(AbsoluteOrientation.Right);
            } else {
                orientations.push(AbsoluteOrientation.Left);
            }
        }

        // Fill other cases
        let allOrientations = [AbsoluteOrientation.Left, AbsoluteOrientation.Right, AbsoluteOrientation.Top, AbsoluteOrientation.Bottom];
        for (let i = 0; i < allOrientations.length; ++i) {
            let o = allOrientations[i];
            if (orientations.indexOf(o) < 0) {
                orientations.push(o);
            }
        }

        let lastOrientation = this.getLastOrientation(path);
        if (lastOrientation) {
            let reversedOrientation = Orientation.getReversedOrientation(lastOrientation);
            orientations.splice(orientations.indexOf(reversedOrientation), 1);
        }


        return orientations;
    }

    private getElementsX(): number[] {
        let ret: number[] = [];
        for (let i = 0; i < this.getDrawingElements().length; ++i) {
            let element = this.getDrawingElements()[i];
            for (let j = 0; j < element.points.length; ++j) {
                let result = element.points[j].x;
                if (ret.indexOf(result) < 0) {
                    ret.push(result);
                }
            }
        }

        return ret;
    }

    private getElementsY(): number[] {
        let ret: number[] = [];
        for (let i = 0; i < this.getDrawingElements().length; ++i) {
            let element = this.getDrawingElements()[i];
            for (let j = 0; j < element.points.length; ++j) {
                let result = element.points[j].y;
                if (ret.indexOf(result) < 0) {
                    ret.push(result);
                }
            }
        }

        return ret;
    }

    private getCrossedPointsWithSegment(segment: Segment, path: PolylineBase): Point[] {
        let ret: Point[] = [];
        let orientation = Orientation.getOrientationFromTwoPoints(segment.points[0], segment.points[1]);
        switch (orientation) {
            case AbsoluteOrientation.Bottom: {
                let elementYs = this.getElementsY().filter(x => x > segment.points[0].y);
                for (let i = 0; i < elementYs.length; ++i) {
                    ret.push(new Point(segment.points[0].x, elementYs[i]));
                }
                if (this.destinationPoint.y > segment.points[0].y) {
                    ret.push(new Point(segment.points[0].x, this.destinationPoint.y));
                }
                break;
            }
            case AbsoluteOrientation.Top: {
                let elementYs = this.getElementsY().filter(x => x < segment.points[0].y);
                for (let i = 0; i < elementYs.length; ++i) {
                    ret.push(new Point(segment.points[0].x, elementYs[i]));
                }
                if (this.destinationPoint.y < segment.points[0].y) {
                    ret.push(new Point(segment.points[0].x, this.destinationPoint.y));
                }
                break;
            }
            case AbsoluteOrientation.Right: {
                let elementXs = this.getElementsX().filter(x => x > segment.points[0].x);
                for (let i = 0; i < elementXs.length; ++i) {
                    ret.push(new Point(elementXs[i], segment.points[0].y));
                }
                if (this.destinationPoint.x > segment.points[0].x) {
                    ret.push(new Point(this.destinationPoint.x, segment.points[0].y));
                }
                break;
            }
            case AbsoluteOrientation.Left: {
                let elementXs = this.getElementsX().filter(x => x < segment.points[0].x);
                for (let i = 0; i < elementXs.length; ++i) {
                    ret.push(new Point(elementXs[i], segment.points[0].y));
                }
                if (this.destinationPoint.x < segment.points[0].x) {
                    ret.push(new Point(this.destinationPoint.x, segment.points[0].y));
                }
                break;
            }
        }

        return ret;
    }

    private getCurrentPointToDestinationCrossedSegments(point: Point): Segment[] {
        let seg = new Segment(point, this.destinationPoint);
        let ret: Segment[] = [];
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

    private generateAvailableNextPoints(path: PolylineBase): Point[] {
        let points: Point[] = [];
        let orientations = this.prioritizeOrientations(path);
        let lastPoint = path.points[path.points.length - 1];
        let border = this.getElementsBorder(this.elementSegments);
        for (let i = 0; i < orientations.length; ++i) {
            let orientation = orientations[i];
            let halfLine = this.generateHalfLine(lastPoint, orientation, border);
            let crossedPoints = this.getCrossedPointsWithSegment(halfLine, path);
            crossedPoints = crossedPoints
                .filter(x => x);

            // Don't cross segment
            let unavailableRange: number[][] = [];
            if (orientation == AbsoluteOrientation.Bottom || orientation == AbsoluteOrientation.Top) {
                unavailableRange = this.originalShapeSegments.concat(this.polylineSegments).map(x => x.getDeltaY());
                crossedPoints = crossedPoints.filter(point => point.equalsTo(this.destinationPoint)
                    || point.x == this.destinationPoint.x && this.getCurrentPointToDestinationCrossedSegments(point).length <= 1
                    || point.y == this.destinationPoint.y && this.getCurrentPointToDestinationCrossedSegments(point).length <= 1
                    || unavailableRange.every(range => point.y < range[0] || point.y > range[1]));
            } else {
                unavailableRange = this.originalShapeSegments.concat(this.polylineSegments).map(x => x.getDeltaX());
                crossedPoints = crossedPoints.filter(point => point.equalsTo(this.destinationPoint)
                    || point.x == this.destinationPoint.x && this.getCurrentPointToDestinationCrossedSegments(point).length <= 1
                    || point.y == this.destinationPoint.y && this.getCurrentPointToDestinationCrossedSegments(point).length <= 1
                    || unavailableRange.every(range => point.x < range[0] || point.x > range[1]));
            }

            let fixedPoints = [];
            let fixedPoint = this.cutSegment(halfLine, this.padding);
            if (true) {
                let border = this.getElementsBorder(this.elementSegments);
                while (true) {
                    if (fixedPoint.x < border[0].x - this.padding || fixedPoint.y < border[0].y - this.padding
                        || fixedPoint.x > border[1].x + this.padding || fixedPoint.y > border[1].y + this.padding) {
                        break;
                    }

                    if (fixedPoint.equalsTo(this.destinationPoint) && this.isValidPoint(fixedPoint, path)) {
                        break;
                    }

                    if (orientation == AbsoluteOrientation.Bottom || orientation == AbsoluteOrientation.Top) {
                        if (unavailableRange.every(range => fixedPoint.y < range[0] || fixedPoint.y > range[1])) {
                            if (this.isValidPoint(fixedPoint, path)) {
                                fixedPoints.push(fixedPoint);
                                break;
                            }
                        }
                    } else {
                        if (unavailableRange.every(range => fixedPoint.x < range[0] || fixedPoint.x > range[1])) {
                            if (this.isValidPoint(fixedPoint, path)) {
                                fixedPoints.push(fixedPoint);
                                break;
                            }
                        }
                    }

                    fixedPoint = this.extendSegment(new Segment(lastPoint, fixedPoint));
                }
            }

            points = points.concat(crossedPoints).concat(fixedPoints);
        }

        points = points.filter(x => x);
        points = points.filter(x => this.isValidPoint(x, path));
        let origin = this.destinationPoint;
        points.sort((a, b) => {
            return Math.sqrt((origin.x - a.x) * (origin.x - a.x) + (origin.y - a.y) * (origin.y - a.y)) - Math.sqrt((origin.x - b.x) * (origin.x - b.x) + (origin.y - b.y) * (origin.y - b.y));
        });

        return points;
    }

    private isValidPoint(point: Point, path: PolylineBase): boolean {
        let count = 0;

        // 0. Null Check
        if (!point) {
            return false;
        }

        // 1. Orientation Check: The point can only move up, down, left or right
        if (path.points.length) {
            let lastPoint = path.points[path.points.length - 1];
            if (point.x != lastPoint.x && point.y != lastPoint.y) {
                //console.debug('Invalid: Orientation Check: The point can only move up, down, left or right');
                return false;
            }
        }

        // 2. Visit Check: The current point should not exist in path
        if (path.points.filter(x => x.equalsTo(point)).length) {
            //console.debug('Invalid: Visit Check: The current point should not exist in path');
            return false;
        }

        // 3. Border Check
        let border = this.getElementsBorder(this.elementSegments);
        let borderCheckResult = border[0].x - this.padding <= point.x
            && point.x <= border[1].x + this.padding
            && border[0].y - this.padding <= point.y
            && point.y <= border[1].y + this.padding;
        if (!borderCheckResult) {
            //console.debug('Invalid: Border Check');
            return false;
        }

        // 4. Point Cross Check
        {
            let isDestinationOrDeparture = point.equalsTo(this.destinationPoint) || point.equalsTo(this.departurePoint);

            // a) The current point should not in the existed path segment
            for (let i = 0; i < path.points.length - 1; ++i) {
                let seg = new Segment(path.points[i], path.points[i + 1]);
                if (seg.isPointInSegment(point)) {
                    ++count;
                }
            }

            if (!(isDestinationOrDeparture && count <= 1 || count == 0)) {
                //console.debug('Invalid: Point Cross Check: The current point should not in the existed path segment');
                return false;
            }

            // b) The current point should not locate inside of any shapes
            if (this.getDrawingElements().filter(x => x.isPointInPolygon(point)).length && !isDestinationOrDeparture) { // Use actual shape(not expanded)
                //console.debug('Invalid: Point Cross Check: The current point should not locate inside of any shapes');
                return false;
            }

            // c) Current segment should not cross with others
            let lastPoint = path.points[path.points.length - 1];
            let segment = new Segment(lastPoint, point);
            if (this.polylineSegments.some(x => segment.getCrossStateWithSegment(x) == SegmentCrossState.Infinite)
                && !segment.points[0].equalsTo(this.departurePoint)
                && !segment.points[1].equalsTo(this.departurePoint)
                && !segment.points[0].equalsTo(this.destinationPoint)
                && !segment.points[1].equalsTo(this.destinationPoint)) {
                //console.debug('Invalid: Point Cross Check: Current segment should not cross with others');
                return false;
            }

        }

        // 5. Segment Cross Check: The generated segment should not have cross points with others
        let lastPoint = path.points[path.points.length - 1];
        let segment = new Segment(lastPoint, point);
        if (this.polylineSegments.filter(x => x.getCrossStateWithSegment(segment) == SegmentCrossState.Infinite).length) {
            //console.debug('Invalid: Segment Cross Check - 1');
            return false;
        }

        count = this.originalShapeSegments.filter(x => x.getCrossStateWithSegment(segment) == SegmentCrossState.Single).length;
        if (count > 0) {
            let isDestinationOrDeparture = point.equalsTo(this.destinationPoint)
                || point.equalsTo(this.departurePoint)
                || lastPoint.equalsTo(this.destinationPoint)
                || lastPoint.equalsTo(this.departurePoint);
            if (isDestinationOrDeparture && count > 1 || !isDestinationOrDeparture) {
                //console.debug('Invalid: Segment Cross Check - 2');
                return false;
            }
        }

        return true;
    }

    private extendSegment(segment: Segment): Point {
        if (segment.points.some(x => !x)) {
            return null;
        }
        let orientation = Orientation.getOrientationFromTwoPoints(segment.points[0], segment.points[1]);
        if (orientation == AbsoluteOrientation.Top) {
            return new Point(segment.points[1].x, Math.max(segment.points[1].y - this.padding, 0));
        } else if (orientation == AbsoluteOrientation.Bottom) {
            return new Point(segment.points[1].x, segment.points[1].y + this.padding);
        } else if (orientation == AbsoluteOrientation.Left) {
            return new Point(Math.max(segment.points[1].x - this.padding, 0), segment.points[1].y);
        } else { // Right
            return new Point(segment.points[1].x + this.padding, segment.points[1].y);
        }
    }

    private cutSegment(segment: Segment, length: number): Point {
        if (segment.points.some(x => !x)) {
            return null;
        }
        let orientation = Orientation.getOrientationFromTwoPoints(segment.points[0], segment.points[1]);
        if (orientation == AbsoluteOrientation.Top) {
            return new Point(segment.points[0].x, Math.max(segment.points[0].y - length, 0));
        } else if (orientation == AbsoluteOrientation.Bottom) {
            return new Point(segment.points[0].x, segment.points[0].y + length);
        } else if (orientation == AbsoluteOrientation.Left) {
            return new Point(Math.max(segment.points[0].x - length, 0), segment.points[0].y);
        } else { // Right
            return new Point(segment.points[0].x + length, segment.points[0].y);
        }
    }

    private contractSegment(segment: Segment): Point | null {
        if (segment.points.some(x => !x)) {
            return null;
        }
        let ret: Point = null;
        let orientation = Orientation.getOrientationFromTwoPoints(segment.points[0], segment.points[1]);
        if (orientation == AbsoluteOrientation.Top) {
            ret = new Point(segment.points[1].x, Math.max(segment.points[1].y + this.padding, 0));
        } else if (orientation == AbsoluteOrientation.Bottom) {
            ret = new Point(segment.points[1].x, segment.points[1].y - this.padding);
        } else if (orientation == AbsoluteOrientation.Left) {
            ret = new Point(Math.max(segment.points[1].x + this.padding, 0), segment.points[1].y);
        } else { // Right
            ret = new Point(segment.points[1].x - this.padding, segment.points[1].y);
        }

        if (Orientation.getOrientationFromTwoPoints(segment.points[0], ret) != Orientation.getOrientationFromTwoPoints(segment.points[0], segment.points[1])) {
            return null;
        } 

        return ret;
    }

    private generateHalfLine(point: Point, orientation: AbsoluteOrientation, border: Point[]): Segment {
        let destination: Point;
        if (orientation == AbsoluteOrientation.Bottom) {
            destination = new Point(point.x, border[1].y + this.padding);
        } else if (orientation == AbsoluteOrientation.Top) {
            destination = new Point(point.x, Math.max(border[0].y - this.padding, 0));
        } else if (orientation == AbsoluteOrientation.Right) {
            destination = new Point(border[1].x + this.padding, point.y);
        } else { // Left
            destination = new Point(Math.max(border[0].x - this.padding, 0), point.y);
        }

        return new Segment(point, destination);
    }

    public generateSvg(): string {
        let points = this.path.points.map(x => x.x + ',' + x.y);
        let elements = this.getDrawingElements().map(el => `<polyline points="${el.points.map(x => x.x + ',' + x.y).join(' ')} ${el.points[0].x},${el.points[0].y}"
style="fill:none;stroke:blue;stroke-width:2"/>`);
        let ret = `<svg width="100%" height="100%" version="1.1"
xmlns="http://www.w3.org/2000/svg">
${elements.join('\r\n')}
<polyline points="${points.join(' ')}"
style="fill:none;stroke:${this.color};stroke-width:2"/>

</svg>`;
        return ret;
    }
}