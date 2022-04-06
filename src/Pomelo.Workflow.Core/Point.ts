export class Point {
    public x: number;
    public y: number;

    public constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public equalsTo(point: Point): boolean {
        return point.x == this.x && point.y == this.y;
    }
}