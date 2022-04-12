import { Drawing } from "./Drawing";
import { Point } from "./Point";
import { PolylineBase } from "./Polyline";

export class Anchor {
    public xPercentage: number;
    public yPercentage: number;
    public shape: Shape;

    public constructor(xPercentage: number, yPercentage: number, shape: Shape | null = null) {
        this.xPercentage = xPercentage;
        this.yPercentage = yPercentage;
        this.shape = shape;
    }

    public toPoint(): Point {
        return new Point(this.shape.points[0].x + this.xPercentage * this.shape.toRectalge().getWidth(), this.shape.points[0].y + this.yPercentage * this.shape.toRectalge().getHeight());
    }

    public toPointWithPadding(padding: number): Point {
        let fakeWidth = this.shape.toRectalge().getWidth() + padding * 2;
        let fakeHeight = this.shape.toRectalge().getHeight() + padding * 2;
        let fakeX = this.shape.points[0].x - padding;
        let fakeY = this.shape.points[0].y - padding;
        return new Point(fakeX + this.xPercentage * fakeWidth, fakeY + this.yPercentage * fakeHeight);
    }
}

export class Shape extends PolylineBase {
    protected guid: string;
    protected anchors: Anchor[];
    protected drawing: Drawing;

    public constructor(points: Point[], guid: string | null = null, drawing: Drawing | null = null) {
        super();
        this.guid = guid;
        this.drawing = drawing;
        if (points.length < 3) {
            throw 'The point count must larger than 3.';
        }

        for (let i = 0; i < points.length; ++i) {
            this.points.push(points[i]);
        }

        this.anchors = [];
    }

    public toRectalge(guid: string | null = null): Rectangle {
        let minX = this.points[0].x;
        let minY = this.points[0].y;
        let maxX = minX;
        let maxY = minY;

        for (let i = 1; i < this.points.length; ++i) {
            let point = this.points[i];
            minX = Math.min(minX, point.x);
            maxX = Math.max(maxX, point.x);
            minY = Math.min(minY, point.y);
            maxY = Math.max(maxY, point.y);
        }

        return new Rectangle(minX, minY, maxX - minX, maxY - minY, guid, this.drawing);
    }

    public getGuid(): string {
        return this.guid;
    }

    public getAnchors(): Anchor[] {
        return this.anchors;
    }

    public createAnchor(xPercentage: number, yPercentage: number): Anchor {
        let anchor = new Anchor(xPercentage, yPercentage, this);
        this.anchors.push(anchor);
        return anchor;
    }

    public generateSvg(): string {
        return `<polyline data-shape="${this.getGuid()}" points="${this.points.map(x => x.x + ',' + x.y).join(' ')}"
style="fill:none;stroke:${this.drawing.getConfig().shapeBorderColor};stroke-width:${this.drawing.getConfig().shapeBorderStrokeWidth}"/>`;
    }
}

export class Rectangle extends Shape
{
    private width: number;
    private height: number;

    public constructor(x: number, y: number, width: number, height: number, guid: string | null = null, drawing: Drawing | null = null) {
        let points: Point[] = [];
        points.push(new Point(x, y));
        points.push(new Point(x + width, y));
        points.push(new Point(x + width, y + height));
        points.push(new Point(x, y + height));
        super(points);
        this.anchors = [];
        this.guid = guid;
        this.drawing = drawing;
        if (width == 0 || height == 0) {
            throw 'The width and height cannot be zero';
        }
        this.width = width;
        this.height = height;

    }

    public getWidth(): number {
        return this.width;
    }

    public getHeight(): number {
        return this.height;
    }

    public cloneAndExpand(padding: number): Rectangle {
        let fakeWidth = this.getWidth() + padding * 2;
        let fakeHeight = this.getHeight() + padding * 2;
        let fakeX = this.points[0].x - padding;
        let fakeY = this.points[0].y - padding;
        return new Rectangle(fakeX, fakeY, fakeWidth, fakeHeight, this.guid, this.drawing);
    }
}