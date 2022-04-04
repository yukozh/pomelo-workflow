import { IUniqueIdentified } from "./IUniqueIdentified";
import { Point } from "./Point";
import { PolylineBase, Polyline } from "./Polyline";
import { Segment, SegmentCrossState } from "./Segment";
import { Anchor, Shape } from "./Shape";

enum Orientation {
    Left,
    Right,
    Top,
    Bottom
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

class GetCrossPointResult {
    isValid: boolean;
    points: PointStateTuple[];
}

export class ConnectPolyline extends PolylineBase implements IUniqueIdentified {
    public guid: string;
    public departure: Anchor;
    public destination: Anchor;
    public path: PolylineBase = new Polyline();
    public padding = 10;
    public departurePoint: Point;
    public destinationPoint: Point;
    public elements: PolylineBase[];

    public constructor() {
        super();
    }

    public initFromDepartureAndDestination(departure: Anchor, destination: Anchor, elements: PolylineBase[]): boolean {
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

        //console.log('Element Segments:');
        //console.log(segments.map(x => `(${x.points[0].x},${x.points[0].y}) (${x.points[1].x},${x.points[1].y})`));
        let ret = this.buildPath(departure.toPoint(), segments, null, 0);
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

    private calculateBorder(elements: PolylineBase[]): Point[] {
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
                point2.x = Math.max(point2.x, _point.x + this.padding);
                point2.y = Math.max(point2.y, _point.y + this.padding);
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

    private buildPath(point: Point, elements: Segment[]/*, shapes: Shape[]*/, previousOrientation: Orientation | null = null, depth = 0): boolean {
        console.debug(`Current point: (${point.x},${point.y})`);
        if (this.path.points.filter(x => x.equalsTo(point)).length) {
            return false;
        }

        this.path.points.push(point);

        if (point.equalsTo(this.destinationPoint)) {
            return true;
        }

        if (depth >= 100 || this.path.points.length >= 100) {
            return false;
        }

        if (this.path.points.length >= 2) {
            let currentSegment = new Segment(this.path.points[this.path.points.length - 2], this.path.points[this.path.points.length - 1]);
            if (elements.some(x => x.getCrossStateWithSegment(currentSegment) == SegmentCrossState.Infinite)) {
                this.pop();
                return false;
            }
        }

        // Greedy to decrease distance between departure and destination
        let orientations: Orientation[] = [];

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
        for (let i = 0; i < 4; ++i) {
            let o = <Orientation>i;
            if (orientations.indexOf(o) < 0) {
                orientations.push(o);
            }
        }

        // Don't go back
        if (previousOrientation != null) {
            let reversedOrientation = this.getReversedOrientation(previousOrientation);
            if (orientations.indexOf(reversedOrientation)) {
                orientations.splice(orientations.indexOf(reversedOrientation), 1);
            }
        }

        //console.log(orientations);

        // Get whole shape border, determine if the point is overflow
        let border = this.calculateBorder(elements);

        if (point.x < 0) {
            this.pop();
            return false;
        }

        if (point.y < 0) {
            this.pop();
            return false;
        }

        if (point.x > border[1].x + 1 * this.padding) {
            this.pop();
            return false;
        }

        if (point.y > border[1].y + 1 * this.padding) {
            this.pop();
            return false;
        }

        // DFS for 4 orientations
        for (let i = 0; i < orientations.length; ++i) {
            let o: Orientation = orientations[i];
            let seg = this.generateSegment(point, o, border);
            let result = this.getCrossedPoints(seg, elements, o, this.destinationPoint);
            if (!result.isValid) {
                //console.log('Invalid ' + o);
                continue;
            }
            //console.log('Valid ' + o + ' ' + result.points.length);
            let points = result.points;
            console.log(points.map(x => x.point));
            if (points.length > 0 && !point.equalsTo(points[0].point)) { // If crossed point found
                if (!this.buildPath(points[0].point, elements, o, depth + 1)) { // Loop with the nearest point
                    continue;
                } else {
                    return true;
                }
            } else { // Extend the current segment
                //console.log('Extend');
                let extended = this.extendSegment(seg, o);
                if (extended.equalsTo(point)) {
                    continue;
                }
                if (!this.buildPath(extended, elements, o, depth + 1)) { // Loop with the nearest point
                    continue;
                } else {
                    return true;
                }
            }
        }

        //console.log('Failed');
        return false;
    }

    private pop(): void {
        if (this.path.points.length) {
            this.path.points.splice(this.path.points.length - 1, 1);
        }
    }

    private getCrossedPoints(segment: Segment, segments: Segment[]/*, shapes: Shape[]*/, orientation: Orientation, expectedPoint: Point): GetCrossPointResult {
        let ret: PointStateTuple[] = [];

        for (let i = 0; i < segments.length; ++i) {
            let crossState = segment.getCrossStateWithSegment(segments[i]);
            if (crossState == SegmentCrossState.Single) {
                ret.push(new PointStateTuple(segment.getCrossedPointWithSegment(segments[i]), segments[i].parent, PointState.CrossPoint))
            } else if (crossState == SegmentCrossState.Infinite) {
                ret.push(new PointStateTuple(segments[i].points[0], segments[i].parent, PointState.CrossSegment));
                ret.push(new PointStateTuple(segments[i].points[1], segments[i].parent, PointState.CrossSegment));
            }
        }

        switch (orientation) {
            case Orientation.Bottom:
                if (expectedPoint.y > segment.points[0].y) {
                    ret.push(new PointStateTuple(new Point(segment.points[0].x, expectedPoint.y)));
                }
                break;
            case Orientation.Top:
                if (expectedPoint.y < segment.points[0].y) {
                    ret.push(new PointStateTuple(new Point(segment.points[0].x, expectedPoint.y)));
                }
                break;
            case Orientation.Right:
                if (expectedPoint.x > segment.points[0].x) {
                    ret.push(new PointStateTuple(new Point(expectedPoint.x, segment.points[0].y)));
                }
                break;
            case Orientation.Left:
                if (expectedPoint.x < segment.points[0].x) {
                    ret.push(new PointStateTuple(new Point(expectedPoint.x, segment.points[0].y)));
                }
                break;
        }

        let origin = segment.points[0];
        ret = ret.filter(x => x && x.point);

        ret.sort((a, b) => {
            return Math.sqrt((origin.x - a.point.x) * (origin.x - a.point.x) + (origin.y - a.point.y) * (origin.y - a.point.y)) - Math.sqrt((origin.x - b.point.x) * (origin.x - b.point.x) + (origin.y - b.point.y) * (origin.y - b.point.y));
        });

        //console.log('Segment:');
        //console.log(segment.points);
        //console.log(ret);

        if (ret.length) {
            if (!this.departurePoint.equalsTo(segment.points[0]) && !this.destinationPoint.equalsTo(segment.points[0]) && ret[0].point.equalsTo(segment.points[0])) {
                console.log('First point invalid');
                return <GetCrossPointResult>{ isValid: false, points: [] };
            }

            if (ret[0].state == PointState.CrossSegment) {
                console.log('Cross seg invalid');
                return <GetCrossPointResult>{ isValid: false, points: [] };
            }
        }

        if (ret.length >= 2) {
            if (ret[0].parent != null && ret.filter(x => x.parent == ret[0].parent).length >= 2 && !ret[0].point.equalsTo(expectedPoint)) {
                console.log('Cross shape invalid');
                return <GetCrossPointResult>{ isValid: false, points: [] };
            }
        }

        return <GetCrossPointResult>{ isValid: true, points: ret };
    }

    private extendSegment(segment: Segment, orientation: Orientation): Point {
        if (orientation == Orientation.Top) {
            return new Point(segment.points[0].x, Math.max(segment.points[0].y - this.padding, 0));
        } else if (orientation == Orientation.Bottom) {
            return new Point(segment.points[0].x, segment.points[0].y + this.padding);
        } else if (orientation == Orientation.Left) {
            return new Point(Math.max(segment.points[0].x - this.padding, 0), segment.points[0].y);
        } else { // Right
            return new Point(segment.points[0].x + this.padding, segment.points[0].y);
        }
    }

    private generateSegment(point: Point, orientation: Orientation, border: Point[]): Segment {
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

    private optmizePath(): void {
        if (this.path.points.length < 2) {
            return;
        }

        let segments: Segment[] = [];
        for (let i = 0; i < this.path.points.length - 1; ++i) {
            let point1 = this.path.points[i];
            let point2 = this.path.points[i + 1];
            segments.push(new Segment(point1, point2));
        }

        for (let i = 1; i < segments.length; ++i) {
            let seg = segments[i];
            for (let j = 0; j < i; ++j) {
                let point = seg.getCrossedPointWithSegment(segments[j]);
                if (!point
                    || point.equalsTo(seg.points[0])
                    || point.equalsTo(seg.points[1])
                    || point.equalsTo(segments[j].points[0])
                    || point.equalsTo(segments[j].points[1])) {
                    continue;
                }

                segments[j].points[1] = point;
                seg.points[0] = point;
                if (j + 1 < segments.length && i - j - 1 > 0) {
                    segments.splice(j + 1, i - j - 1);
                }
                this.generatePath(segments);

                return this.optmizePath();
            }
        }

        return;
    }

    private generatePath(segments: Segment[]): void {
        if (!segments.length) {
            return;
        }

        this.path.points.splice(0, this.path.points.length);
        this.path.points.push(segments[0].points[0]);
        for (let i = 0; i < segments.length; ++i) {
            this.path.points.push(segments[i].points[1]);
        }
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