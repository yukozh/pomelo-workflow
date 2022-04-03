export class Point {
    public x: number;
    public y: number;

    public equalsTo(point: Point): boolean {
        return point.x == this.x && point.y == this.y;
    }
}