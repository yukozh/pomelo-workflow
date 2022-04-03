import { Point } from "./Point";
import { PolylineBase, Polyline } from "./Polyline";

enum Orientation {
    Left,
    Right,
    Top,
    Bottom
}

export class ConnectPolyline extends PolylineBase {
    public departure: Point;
    public departureShape: PolylineBase;
    public destination: Point;
    public destinationShape: PolylineBase;
    public path: PolylineBase = new Polyline();
    public padding = 10;

    public initFromDepartureAndDestination(departure: Point, departureShape: PolylineBase, destination: Point, destinationShape: PolylineBase, elements: PolylineBase[]) {
        //this.polyline.
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
                point2.x = Math.max(point2.x, _point.x);
                point2.y = Math.max(point2.y, _point.y);
            }
        }

        return [point1, point2];
    }

    private buildPath(point: Point, elements: PolylineBase[], previousOrientation: Orientation | null = null, depth = 0): boolean {
        this.path.points.push(point);

        if (depth >= 100) {
            return false;
        }

        if (point.equalsTo(this.destination)) {
            return true;
        }

        let orientations: Orientation[] = [];

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

        if (previousOrientation != null && orientations.indexOf(previousOrientation) >= 0) {
            orientations.splice(orientations.indexOf(previousOrientation), 1);
        }
    }

    private generateSegment(point: Point, orientation: Orientation, border: Point[]) {
        if (orientation == Orientation.Bottom) {
            return <Point>{ x: point.x, y: border[1].y + this.padding };
        } else if (orientation == Orientation.Top) {
            return <Point>{ x: point.x, y: Math.max(border[0].y - this.padding, 0) }
        } else if (orientation == Orientation.Right) {
            return <Point>{ x: border[1].x + this.padding, y: point.y };
        } else { // Left
            return <Point>{ x: Math.max(border[0].x - this.padding, 0), y: point.y };
        }
    }
}