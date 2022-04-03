import { Point } from "./Point";
import { Segment } from "./Segment";

class PolylineBase {
    public points: Array<Point>;

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
export class Shape extends PolylineBase {
    
}

export class ConnectPolyline extends PolylineBase {
    public departure: Point;
    public destination: Point
    public polyline: PolylineBase;

    public initFromDepartureAndDestination(departure: Point, destination: Point) {
        
    }

    public initFromPolyline(polyline: PolylineBase) {
        this.polyline = polyline;
        if (polyline.points.length < 2) {
            throw 'Invalid polyline';
        }

        this.departure = polyline.points[0];
        this.destination = polyline.points[polyline.points.length - 1];
    }

    private static buildPath() {

    }
}