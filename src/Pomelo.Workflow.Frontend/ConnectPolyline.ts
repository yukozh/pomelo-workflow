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

    private calculateBorder(elements: PolylineBase[]): Point {
        var point: Point = <Point>{ x: 0, y: 0 };

        if (!elements.length) {
            return point;
        }

        for (let i = 0; i < elements.length; ++i) {
            for (let j = 0; j < elements[i].points.length; ++j) {
                let _point = elements[i].points[j];
                point.x = Math.max(point.x, _point.x);
                point.y = Math.max(point.y, _point.y);
            }
        }

        return point;
    }

    private buildPath(point: Point, previousOrientation: Orientation | null = null, depth = 0): boolean {
        this.path.points.push(point);

        if (depth >= 100) {
            return false;
        }

        if (point.equal(this.destination)) {
            return true;
        }

        let orientations: Orientation[] = [Orientation.Top, Orientation.Bottom, Orientation.Left, Orientation.Right];
        if (previousOrientation != null && orientations.indexOf(previousOrientation) >= 0) {
            orientations.splice(orientations.indexOf(previousOrientation), 1);
        }


    }
}