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
        return new Point(this.shape.points[0].x + this.xPercentage * this.shape.getWidth(), this.shape.points[0].y + this.yPercentage * this.shape.getHeight());
    }

    public toPointWithPadding(padding: number): Point {
        let fakeWidth = this.shape.getWidth() + padding * 2;
        let fakeHeight = this.shape.getHeight() + padding * 2;
        let fakeX = this.shape.points[0].x - padding;
        let fakeY = this.shape.points[0].y - padding;
        return new Point(fakeX + this.xPercentage * fakeWidth, fakeY + this.yPercentage * fakeHeight);
    }
}

export class Shape extends PolylineBase {
    private guid: string;
    private width: number;
    private height: number;
    private anchors: Anchor[];
    private drawing: Drawing;

    public constructor(x: number, y: number, width: number, height: number, guid: string | null = null, drawing: Drawing | null = null) {
        super();
        this.guid = guid;
        this.drawing = drawing;
        if (width == 0 || height == 0) {
            throw 'The width and height cannot be zero';
        }

        this.width = width;
        this.height = height;

        this.points.push(new Point(x, y));
        this.points.push(new Point(x + width, y));
        this.points.push(new Point(x + width, y + height));
        this.points.push(new Point(x, y + height));
        this.anchors = [];
    }

    public getGuid(): string {
        return this.guid;
    }

    public getWidth(): number {
        return this.width;
    }

    public getHeight(): number {
        return this.height;
    }

    public getAnchors(): Anchor[] {
        return this.anchors;
    }

    public createAnchor(xPercentage: number, yPercentage: number): Anchor {
        let anchor = new Anchor(xPercentage, yPercentage, this);
        this.anchors.push(anchor);
        return anchor;
    }

    public cloneAndExpand(padding: number): Shape {
        let fakeWidth = this.getWidth() + padding * 2;
        let fakeHeight = this.getHeight() + padding * 2;
        let fakeX = this.points[0].x - padding;
        let fakeY = this.points[0].y - padding;
        return new Shape(fakeX, fakeY, fakeWidth, fakeHeight);
    }
}