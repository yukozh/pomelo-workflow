import { Point } from "./Point";

export enum SegmentCrossState {
    None,
    Single,
    Infinite
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

    public determineCrossStateWithSegment(segment: Segment): SegmentCrossState {
        if (!this.isCrossedBySegment(segment)) {
            return SegmentCrossState.None;
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