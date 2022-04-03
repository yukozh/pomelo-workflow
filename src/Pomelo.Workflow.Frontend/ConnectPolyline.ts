import { Point } from "./Point";
import { PolylineBase, Polyline } from "./Polyline";
import { Segment, SegmentCrossState } from "./Segment";

enum Orientation {
    Left,
    Right,
    Top,
    Bottom
}

export class ConnectPolyline extends PolylineBase {
    public departure: Point;
    //public departureShape: PolylineBase;
    public destination: Point;
    //public destinationShape: PolylineBase;
    public path: PolylineBase = new Polyline();
    public padding = 10;

    public initFromDepartureAndDestination(departure: Point, /*departureShape: PolylineBase,*/ destination: Point, /*destinationShape: PolylineBase,*/ elements: PolylineBase[] /* TODO: Use shape type */) {
        this.departure = departure;
        this.destination = destination;
        let segments: Segment[] = [];
        for (let i = 0; i < elements.length; ++i) {
            let _segments = elements[i].toSegments();
            for (let j = 0; j < _segments.length; ++j) {
                segments.push(_segments[j]);
            }
        }
        this.buildPath(departure, segments, null, 0);
    }

    public initFromPath(path: PolylineBase) {
        this.path = path;
        if (path.points.length < 2) {
            throw 'Invalid polyline';
        }

        this.departure = path.points[0];
        this.destination = path.points[path.points.length - 1];
    }

    private calculateBorder(elements: PolylineBase[]): Point[] {
        var point1: Point = <Point>{ x: 0, y: 0 };
        var point2: Point = <Point>{ x: 0, y: 0 };

        if (!elements.length) {
            return [point1, point2];
        }

        let isFirstPoint = true;
        for (let i = 0; i < elements.length; ++i) {
            for (let j = 0; j < elements[i].points.length; ++j) {
                let _point = elements[i].points[j];

                if (isFirstPoint) {
                    isFirstPoint = false;
                    point1.x = _point.x;
                    point1.y = _point.y;
                    point2.x = _point.x;
                    point2.y = _point.y;
                }

                point1.x = Math.min(point1.x, _point.x);
                point1.y = Math.min(point1.y, _point.y);
                point2.x = Math.max(point2.x, _point.x + this.padding);
                point2.y = Math.max(point2.y, _point.y + this.padding);
            }
        }

        return [point1, point2];
    }

    private buildPath(point: Point, elements: Segment[], previousOrientation: Orientation | null = null, depth = 0): boolean {
        this.path.points.push(point);

        if (point.equalsTo(this.destination)) {
            return true;
        }

        if (depth >= 100) {
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

        let absX = Math.abs(this.destination.x - point.x);
        let absY = Math.abs(this.destination.y - point.y);

        if (absX > absY) {
            if (this.destination.x - point.x > 0) {
                orientations.push(Orientation.Right);
            } else {
                orientations.push(Orientation.Left);
            }

            if (this.destination.y - point.y > 0) {
                orientations.push(Orientation.Top);
            } else {
                orientations.push(Orientation.Bottom);
            }
        } else {
            if (this.destination.y - point.y > 0) {
                orientations.push(Orientation.Top);
            } else {
                orientations.push(Orientation.Bottom);
            }

            if (this.destination.x - point.x > 0) {
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
        if (previousOrientation != null && orientations.indexOf(previousOrientation) >= 0) {
            orientations.splice(orientations.indexOf(previousOrientation), 1);
        }

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

        if (point.x > border[1].x) {
            this.pop();
            return false;
        }

        if (point.y > border[1].y) {
            this.pop();
            return false;
        }

        // DFS for 4 orientations
        for (let i = 0; i < orientations.length; ++i) {
            let o = orientations[i];
            let seg = this.generateSegment(point, o, border);
            let points = ConnectPolyline.getCrossedPoints(seg, elements, o, this.destination);
            if (points.length > 0) { // If crossed point found
                if (!this.buildPath(points[0], elements, o, depth + 1)) { // Loop with the nearest point
                    continue;
                }
            } else { // Extend the current segment
                if (!this.buildPath(this.extendSegment(seg, o), elements, o, depth + 1)) { // Loop with the nearest point
                    continue;
                }
            }
        }

        return false;
    }

    private pop(): void {
        if (this.path.points.length) {
            this.path.points.splice(this.path.points.length - 1, 1);
        }
    }

    private static getCrossedPoints(segment: Segment, segments: Segment[], orientation: Orientation, expectedPoint: Point): Point[] {
        let ret: Point[] = [];
        for (let i = 0; i < segments.length; ++i) {
            let crossState = segment.getCrossStateWithSegment(segments[i]);
            if (crossState == SegmentCrossState.Single) {
                ret.push(segment.getCrossedPointWithSegment(segments[i]));
            } else if (crossState == SegmentCrossState.Infinite) {
                ret.push(segments[i].points[0]);
                ret.push(segments[i].points[1]);
            }
        }

        switch (orientation) {
            case Orientation.Bottom:
                if (expectedPoint.y > segment.points[0].y) {
                    ret.push(<Point>{ x: segment.points[0].x, y: expectedPoint.y });
                }
                break;
            case Orientation.Top:
                if (expectedPoint.y < segment.points[0].y) {
                    ret.push(<Point>{ x: segment.points[0].x, y: expectedPoint.y });
                }
                break;
            case Orientation.Right:
                if (expectedPoint.x > segment.points[0].x) {
                    ret.push(<Point>{ x: expectedPoint.x, y: segment.points[0].y });
                }
                break;
            case Orientation.Left:
                if (expectedPoint.x < segment.points[0].x) {
                    ret.push(<Point>{ x: expectedPoint.x, y: segment.points[0].y });
                }
                break;
        }

        let origin = segment.points[0];
        ret.sort((a, b) => {
            return Math.sqrt((origin.x - a.x) * (origin.x - a.x) + (origin.y - a.y) * (origin.y - a.y)) - Math.sqrt((origin.x - b.x) * (origin.x - b.x) + (origin.y - b.y) * (origin.y - b.y));
        });

        return ret;
    }

    private extendSegment(segment: Segment, orientation: Orientation): Point {
        if (orientation == Orientation.Top) {
            return <Point>{ x: segment.points[1].x, y: Math.max(segment.points[1].y - this.padding, 0) };
        } else if (orientation == Orientation.Bottom) {
            return <Point>{ x: segment.points[1].x, y: segment.points[1].y + this.padding };
        } else if (orientation == Orientation.Left) {
            return <Point>{ x: Math.max(segment.points[1].x - this.padding, 0), y: segment.points[1].y };
        } else { // Right
            return <Point>{ x: segment.points[1].x + this.padding, y: segment.points[1].y };
        }
    }

    private generateSegment(point: Point, orientation: Orientation, border: Point[]): Segment {
        let destination: Point;
        if (orientation == Orientation.Bottom) {
            destination = <Point>{ x: point.x, y: border[1].y + this.padding };
        } else if (orientation == Orientation.Top) {
            destination = <Point>{ x: point.x, y: Math.max(border[0].y - this.padding, 0) }
        } else if (orientation == Orientation.Right) {
            destination = <Point>{ x: border[1].x + this.padding, y: point.y };
        } else { // Left
            destination = <Point>{ x: Math.max(border[0].x - this.padding, 0), y: point.y };
        }

        return new Segment(point, destination);
    }
}