export class Point {
    public x: number;
    public y: number;

    public equal(point: Point): boolean {
        return point.x == this.x && point.y == this.y;
    }
}