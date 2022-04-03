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
        return new Point(this.shape.points[0].y + this.xPercentage * this.shape.width, this.shape.points[0].y + this.yPercentage * this.shape.height);
    }
}

export class Shape extends PolylineBase {
    public width: number;
    public height: number;
    public anchors: Anchor[];

    public constructor(x: number, y: number, width: number, height: number, anchors: Anchor[]) {
        super();
        if (width == 0 || height == 0) {
            throw 'The width and height cannot be zero';
        }

        this.width = width;
        this.height = height;

        this.points.push(new Point(x, y));
        this.points.push(new Point(x + width, y));
        this.points.push(new Point(x + width, y + height));
        this.points.push(new Point(x, y + height));
        this.anchors = anchors || [];
        for (let i = 0; i < this.anchors.length; ++i) {
            this.anchors[i].shape = this;
        }
    }
}