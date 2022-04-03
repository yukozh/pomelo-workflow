import { Point } from "./Point";

export enum SegmentCrossState {
    None,
    Single,
    Infinite
}

enum SegmentSiteState {
    Same,
    Opposite,
    Parallel
}

export class Segment {
    private points: Point[] = [];

    public getPoints(): Point[] {
        return this.points;
    }

    public constructor(depatrue: Point, destination: Point) {
        this.points.push(depatrue);
        this.points.push(destination);
    }

    public isPointInSegment(point: Point): boolean {
        let p1 = this.points[0];
        let p2 = this.points[1];
        let q = point;
        let k1 = parseFloat(((p2.y - p1.y) / (p2.x - p1.x)).toFixed(3));
        let k2 = parseFloat(((q.y - p1.y) / (q.x - p1.x)).toFixed(3));
        let error = Math.abs(k2 - k1);
        return error - 0.1 <= Number.EPSILON;
    }

    public getCrossStateWithSegment(segment: Segment): SegmentCrossState {
        let a = this.points[0];
        let b = this.points[1];
        let c = segment.getPoints()[0];
        let d = segment.getPoints()[1];

        let ab = this.diff(a, b);

        let ac = this.diff(a, c);
        let ad = this.diff(a, d);

        let bc = this.diff(b, c);
        let bd = this.diff(b, d);

        let siteState1 = this.getSiteState(ac, ad, ab);
        let siteState2 = this.getSiteState(bc, bd, ab);

        if (siteState1 == SegmentSiteState.Opposite && siteState2 == SegmentSiteState.Opposite) {
            return SegmentCrossState.Single;
        } else if (siteState1 == SegmentSiteState.Opposite || siteState2 == SegmentSiteState.Opposite) {
            return SegmentCrossState.None;
        } else {
            return SegmentCrossState.Infinite;
        }
    }

    private cross(vector1: Point, vector2: Point): number {
        return vector1.x * vector2.y - vector1.y * vector2.x;
    }

    private diff(vector1: Point, vector2: Point): Point {
        return <Point>{ x: vector1.x - vector2.x, y: vector1.y - vector2.y };
    }

    private getSiteState(a: Point, b: Point, target: Point): SegmentSiteState {
        let ca = Math.sign(this.cross(a, target));
        let cb = Math.sign(this.cross(b, target));

        if (ca == 1 && cb == -1 || ca == -1 && cb == 1) {
            return SegmentSiteState.Opposite;
        } else if (ca == 1 && cb == 1 || ca == -1 && cb == -1) {
            return SegmentSiteState.Same;
        } else {
            return SegmentSiteState.Opposite;
        }
    }

    public isCrossedBySegment(segment: Segment): boolean {
        let x1 = this.points[0].x,
            y1 = this.points[0].y,
            x2 = this.points[1].x,
            y2 = this.points[1].y,
            x3 = segment.getPoints()[0].x,
            y3 = segment.getPoints()[0].y,
            x4 = segment.getPoints()[1].x,
            y4 = segment.getPoints()[1].y;

        if (!(Math.min(x1, x2) <= Math.max(x3, x4) && Math.min(y3, y4) <= Math.max(y1, y2) && Math.min(x3, x4) <= Math.max(x1, x2) && Math.min(y1, y2) <= Math.max(y3, y4)))
            return false;
        let u: number, v: number, w: number, z: number;
        u = (x3 - x1) * (y2 - y1) - (x2 - x1) * (y3 - y1);
        v = (x4 - x1) * (y2 - y1) - (x2 - x1) * (y4 - y1);
        w = (x1 - x3) * (y4 - y3) - (x4 - x3) * (y1 - y3);
        z = (x2 - x3) * (y4 - y3) - (x4 - x3) * (y2 - y3);
        return (u * v <= 0.00000001 && w * z <= 0.00000001);
    }
}