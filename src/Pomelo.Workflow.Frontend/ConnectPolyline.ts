import { IUniqueIdentified } from "./IUniqueIdentified";
import { Point } from "./Point";
import { PolylineBase, Polyline } from "./Polyline";
import { Segment, SegmentCrossState } from "./Segment";
import { Anchor, Shape } from "./Shape";

enum Orientation {
    Left = 'Left',
    Right = 'Right',
    Top = 'Top',
    Bottom = 'Bottom'
}

enum PointState {
    CrossPoint,
    CrossSegment
}

class PointStateTuple {
    point: Point;
    state: PointState;
    parent: PolylineBase;

    public constructor(point: Point, parent: PolylineBase | null = null, state: PointState = PointState.CrossPoint) {
        this.point = point;
        this.state = state;
        this.parent = parent;
    }
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

export class ConnectPolyline extends PolylineBase implements IUniqueIdentified {
    public guid: string;
    public departure: Anchor;
    public destination: Anchor;
    public path: PolylineBase = new Polyline();
    public padding = 5;
    public departurePoint: Point;
    public destinationPoint: Point;
    public elements: PolylineBase[];
    public elementSegments: Segment[];

    public constructor() {
        super();
    }

    public initFromDepartureAndDestination(departure: Anchor, destination: Anchor, elements: PolylineBase[], useBFS: boolean = false): boolean {
        this.departure = departure;
        this.destination = destination;
        this.departurePoint = departure.toPoint();
        this.destinationPoint = destination.toPoint();
        this.elements = elements;

        let segments: Segment[] = [];
        for (let i = 0; i < elements.length; ++i) {
            let _segments = ConnectPolyline.polylineToSegments(elements[i]);
            for (let j = 0; j < _segments.length; ++j) {
                segments.push(_segments[j]);
            }
        }
        this.elementSegments = segments;

        let ret = useBFS ? this.buildPathBFS() : this.buildPathDFS(this.departurePoint);
        if (ret) {
            this.optmizePath();
        }
        return ret;
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

        return [point1, point2];
    }

    private getReversedOrientation(orientation: Orientation): Orientation {
        switch (orientation) {
            case Orientation.Bottom:
                return Orientation.Top;
            case Orientation.Top:
                return Orientation.Bottom;
            case Orientation.Left:
                return Orientation.Right;
            case Orientation.Right:
                return Orientation.Left;
        }
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

    private getLastOrientation(path: PolylineBase): Orientation | null {
        if (path.points.length < 2) {
            return null;
        }

        return this.getOrientationFromTwoPoints(path.points[path.points.length - 2], path.points[path.points.length - 1]);
    }

    private getOrientationFromTwoPoints(departure: Point, destination: Point): Orientation | null {
        let segment = new Segment(departure, destination);

        if (segment.points[0].y == segment.points[1].y) {
            if (segment.points[1].x > segment.points[0].x) {
                return Orientation.Right;
            } else if (segment.points[1].x < segment.points[0].x) {
                return Orientation.Left;
            } else {
                return null;
            }
        } else if (segment.points[0].x == segment.points[1].x) {
            if (segment.points[1].y > segment.points[0].y) {
                return Orientation.Bottom;
            } else if (segment.points[1].y < segment.points[0].y) {
                return Orientation.Top;
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    private prioritizeOrientations(path: PolylineBase): Orientation[] {
        let orientations: Orientation[] = [];
        let point = path.points[path.points.length - 1];
        let absX = Math.abs(this.destinationPoint.x - point.x);
        let absY = Math.abs(this.destinationPoint.y - point.y);

        if (absX > absY) {
            if (this.destinationPoint.x - point.x > 0) {
                orientations.push(Orientation.Right);
            } else {
                orientations.push(Orientation.Left);
            }

            if (this.destinationPoint.y - point.y > 0) {
                orientations.push(Orientation.Bottom);
            } else {
                orientations.push(Orientation.Top);
            }
        } else {
            if (this.destinationPoint.y - point.y > 0) {
                orientations.push(Orientation.Bottom);
            } else {
                orientations.push(Orientation.Top);
            }

            if (this.destinationPoint.x - point.x > 0) {
                orientations.push(Orientation.Right);
            } else {
                orientations.push(Orientation.Left);
            }
        }

        // Fill other cases
        let allOrientations = [Orientation.Left, Orientation.Right, Orientation.Top, Orientation.Bottom];
        for (let i = 0; i < allOrientations.length; ++i) {
            let o = allOrientations[i];
            if (orientations.indexOf(o) < 0) {
                orientations.push(o);
            }
        }

        let lastOrientation = this.getLastOrientation(path);
        if (lastOrientation) {
            let reversedOrientation = this.getReversedOrientation(lastOrientation);
            orientations.splice(orientations.indexOf(reversedOrientation), 1);
        }


        return orientations;
    }

    private getElementsX(): number[] {
        let ret: number[] = [];
        for (let i = 0; i < this.elements.length; ++i) {
            let element = this.elements[i];
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
        for (let i = 0; i < this.elements.length; ++i) {
            let element = this.elements[i];
            for (let j = 0; j < element.points.length; ++j) {
                let result = element.points[j].y;
                if (ret.indexOf(result) < 0) {
                    ret.push(result);
                }
            }
        }

        return ret;
    }

    private getCrossedPointsWithSegment2(segment: Segment, path: PolylineBase): Point[] {
        let ret: Point[] = [];
        let orientation = this.getOrientationFromTwoPoints(segment.points[0], segment.points[1]);
        switch (orientation) {
            case Orientation.Bottom: {
                let elementYs = this.getElementsY().filter(x => x > segment.points[0].y);;
                for (let i = 0; i < elementYs.length; ++i) {
                    ret.push(new Point(segment.points[0].x, elementYs[i]));
                }
                if (this.destinationPoint.y > segment.points[0].y) {
                    ret.push(new Point(segment.points[0].x, this.destinationPoint.y));
                }
                break;
            }
            case Orientation.Top: {
                let elementYs = this.getElementsY().filter(x => x < segment.points[0].y);
                for (let i = 0; i < elementYs.length; ++i) {
                    ret.push(new Point(segment.points[0].x, elementYs[i]));
                }
                if (this.destinationPoint.y < segment.points[0].y) {
                    ret.push(new Point(segment.points[0].x, this.destinationPoint.y));
                }
                break;
            }
            case Orientation.Right: {
                let elementXs = this.getElementsX().filter(x => x > segment.points[0].x);
                for (let i = 0; i < elementXs.length; ++i) {
                    ret.push(new Point(elementXs[i], segment.points[0].y));
                }
                if (this.destinationPoint.x > segment.points[0].x) {
                    ret.push(new Point(this.destinationPoint.x, segment.points[0].y));
                }
                break;
            }
            case Orientation.Left: {
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

    private getCrossedPointsWithSegment(segment: Segment, path: PolylineBase): PointStateTuple[] {
        let ret: PointStateTuple[] = [];

        for (let i = 0; i < this.elementSegments.length; ++i) {
            let crossState = segment.getCrossStateWithSegment(this.elementSegments[i]);
            if (crossState == SegmentCrossState.Single) {
                ret.push(new PointStateTuple(segment.getCrossedPointWithSegment(this.elementSegments[i]), this.elementSegments[i].parent, PointState.CrossPoint))
            } else if (crossState == SegmentCrossState.Infinite) {
                ret.push(new PointStateTuple(this.elementSegments[i].points[0], this.elementSegments[i].parent, PointState.CrossSegment));
                ret.push(new PointStateTuple(this.elementSegments[i].points[1], this.elementSegments[i].parent, PointState.CrossSegment));
            }
        }

        let orientation = this.getOrientationFromTwoPoints(segment.points[0], segment.points[1]);
        switch (orientation) {
            case Orientation.Bottom:
                if (this.destinationPoint.y > segment.points[0].y) {
                    ret.push(new PointStateTuple(new Point(segment.points[0].x, this.destinationPoint.y)));
                }
                break;
            case Orientation.Top:
                if (this.destinationPoint.y < segment.points[0].y) {
                    ret.push(new PointStateTuple(new Point(segment.points[0].x, this.destinationPoint.y)));
                }
                break;
            case Orientation.Right:
                if (this.destinationPoint.x > segment.points[0].x) {
                    ret.push(new PointStateTuple(new Point(this.destinationPoint.x, segment.points[0].y)));
                }
                break;
            case Orientation.Left:
                if (this.destinationPoint.x < segment.points[0].x) {
                    ret.push(new PointStateTuple(new Point(this.destinationPoint.x, segment.points[0].y)));
                }
                break;
        }

        ret = ret.filter(x => x && x.point);

        return ret;
    }

    private generateAvailableNextPoints(path: PolylineBase): Point[] {
        let points: Point[] = [];
        let orientations = this.prioritizeOrientations(path);
        let lastPoint = path.points[path.points.length - 1];
        let border = this.getElementsBorder([path].concat(this.elements));
        for (let i = 0; i < orientations.length; ++i) {
            let orientation = orientations[i];
            let halfLine = this.generateHalfLine(lastPoint, orientation, border);
            let crossedPoints = this.getCrossedPointsWithSegment2(halfLine, path);
            crossedPoints = crossedPoints
                .concat(crossedPoints.map(x => this.contractSegment(new Segment(lastPoint, x))))
                .concat(crossedPoints.map(x => this.extendSegment(new Segment(lastPoint, x))));
            let shortestPoint = this.cutSegment(halfLine, this.padding);
            if (shortestPoint) {
                crossedPoints = crossedPoints.concat([shortestPoint]);
            }

            points = points.concat(crossedPoints);
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
        let unionElements: PolylineBase[] = [path].concat(this.elements);
        let border = this.getElementsBorder(unionElements);
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
            if (this.elements.filter(x => x.isPointInPolygon(point)).length && !isDestinationOrDeparture) {
                //console.debug('Invalid: Point Cross Check: The current point should not locate inside of any shapes');
                return false;
            }
        }

        // 5. Segment Cross Check: The generated segment should not have cross points with others
        let lastPoint = path.points[path.points.length - 1];
        let segment = new Segment(lastPoint, point);
        if (this.elementSegments.filter(x => x.getCrossStateWithSegment(segment) == SegmentCrossState.Infinite).length) {
            //console.debug('Invalid: Segment Cross Check - 1');
            return false;
        }

        count = this.elementSegments.filter(x => x.getCrossStateWithSegment(segment) == SegmentCrossState.Single).length;
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
        let orientation = this.getOrientationFromTwoPoints(segment.points[0], segment.points[1]);
        if (orientation == Orientation.Top) {
            return new Point(segment.points[1].x, Math.max(segment.points[1].y - this.padding, 0));
        } else if (orientation == Orientation.Bottom) {
            return new Point(segment.points[1].x, segment.points[1].y + this.padding);
        } else if (orientation == Orientation.Left) {
            return new Point(Math.max(segment.points[1].x - this.padding, 0), segment.points[1].y);
        } else { // Right
            return new Point(segment.points[1].x + this.padding, segment.points[1].y);
        }
    }

    private cutSegment(segment: Segment, length: number): Point {
        if (segment.points.some(x => !x)) {
            return null;
        }
        let orientation = this.getOrientationFromTwoPoints(segment.points[0], segment.points[1]);
        if (orientation == Orientation.Top) {
            return new Point(segment.points[0].x, Math.max(segment.points[0].y - length, 0));
        } else if (orientation == Orientation.Bottom) {
            return new Point(segment.points[0].x, segment.points[0].y + length);
        } else if (orientation == Orientation.Left) {
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
        let orientation = this.getOrientationFromTwoPoints(segment.points[0], segment.points[1]);
        if (orientation == Orientation.Top) {
            ret = new Point(segment.points[1].x, Math.max(segment.points[1].y + this.padding, 0));
        } else if (orientation == Orientation.Bottom) {
            ret = new Point(segment.points[1].x, segment.points[1].y - this.padding);
        } else if (orientation == Orientation.Left) {
            ret = new Point(Math.max(segment.points[1].x + this.padding, 0), segment.points[1].y);
        } else { // Right
            ret = new Point(segment.points[1].x - this.padding, segment.points[1].y);
        }

        if (this.getOrientationFromTwoPoints(segment.points[0], ret) != this.getOrientationFromTwoPoints(segment.points[0], segment.points[1])) {
            return null;
        } 

        return ret;
    }

    private generateHalfLine(point: Point, orientation: Orientation, border: Point[]): Segment {
        let destination: Point;
        if (orientation == Orientation.Bottom) {
            destination = new Point(point.x, border[1].y + this.padding);
        } else if (orientation == Orientation.Top) {
            destination = new Point(point.x, Math.max(border[0].y - this.padding, 0));
        } else if (orientation == Orientation.Right) {
            destination = new Point(border[1].x + this.padding, point.y);
        } else { // Left
            destination = new Point(Math.max(border[0].x - this.padding, 0), point.y);
        }

        return new Segment(point, destination);
    }

    public generateSvg(): string {
        let points = this.path.points.map(x => x.x + ',' + x.y);
        let elements = this.elements.map(el => `<polyline points="${el.points.map(x => x.x + ',' + x.y).join(' ')} ${el.points[0].x},${el.points[0].y}"
style="fill:none;stroke:blue;stroke-width:2"/>`);
        let ret = `<svg width="100%" height="100%" version="1.1"
xmlns="http://www.w3.org/2000/svg">
${elements.join('\r\n')}
<polyline points="${points.join(' ')}"
style="fill:none;stroke:red;stroke-width:2"/>

</svg>`;
        return ret;
    }
}