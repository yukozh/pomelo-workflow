import { Point } from "./Point";

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
}