import { Point } from "./Point";
import { Segment } from "./Segment";

export abstract class PolylineBase {
    public points: Point[];
    public isPolygon(): boolean {
        if (this.points.length <= 2) {
            return false;
        }

        let segments = this.toSegments();
        if (this.points.some(x => this.points.filter(y => y.equal(x)).length > 1)) {
            return false;
        }

        if (segments.some(x => this.points.some(y => x.isPointInSegment(y)))) {
            return false;
        }

        return true;
    }

    public isPointInPolygon(point: Point): boolean {
        let checkPoint: number[] = [point.x, point.y];
        let polygonPoints: number[][] = this.points.map(point => [point.x, point.y]);
        let counter = 0;
        let xinters;
        let pointCount = polygonPoints.length;
        let p1 = polygonPoints[0];
        for (let i = 1; i <= pointCount; i++) {
            let p2 = polygonPoints[i % pointCount];
            if (
                checkPoint[0] > Math.min(p1[0], p2[0]) &&
                checkPoint[0] <= Math.max(p1[0], p2[0])
            ) {
                if (checkPoint[1] <= Math.max(p1[1], p2[1])) {
                    if (p1[0] != p2[0]) {
                        xinters =
                            (checkPoint[0] - p1[0]) *
                            (p2[1] - p1[1]) /
                            (p2[0] - p1[0]) +
                            p1[1];
                        if (p1[1] == p2[1] || checkPoint[1] <= xinters) {
                            counter++;
                        }
                    }
                }
            }
            p1 = p2;
        }
        if (counter % 2 == 0) {
            return false;
        } else {
            return true;
        }
    }

    public isPolygonCrossed(polygon: PolylineBase): boolean {
        return polygon.points.some(point => this.isPointInPolygon(point));
    }

    public toSegments(): Segment[] {
        let ret: Segment[] = [];

        if (this.points.length < 2) {
            return ret;
        }

        for (let i = 0; i < this.points.length - 1; ++i) {
            ret.push(new Segment(this.points[i], this.points[i + 1]));
        }

        return ret;
    }
}

export class Polyline extends PolylineBase { }