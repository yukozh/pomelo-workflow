var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var PomeloWF = (function (exports) {
    var Point = /** @class */ (function () {
        function Point(x, y) {
            this.x = x;
            this.y = y;
        }
        Point.prototype.equalsTo = function (point) {
            return point.x == this.x && point.y == this.y;
        };
        return Point;
    }());
    var PolylineBase = /** @class */ (function () {
        function PolylineBase() {
            this.points = [];
        }
        PolylineBase.prototype.isPointInPolygon = function (point) {
            var checkPoint = [point.x, point.y];
            var polygonPoints = this.points.map(function (point) { return [point.x, point.y]; });
            var counter = 0;
            var xinters;
            var pointCount = polygonPoints.length;
            var p1 = polygonPoints[0];
            for (var i = 1; i <= pointCount; i++) {
                var p2 = polygonPoints[i % pointCount];
                if (checkPoint[0] > Math.min(p1[0], p2[0]) &&
                    checkPoint[0] <= Math.max(p1[0], p2[0])) {
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
            }
            else {
                return true;
            }
        };
        PolylineBase.prototype.isPolygonCrossed = function (polygon) {
            var _this = this;
            return polygon.points.some(function (point) { return _this.isPointInPolygon(point); });
        };
        return PolylineBase;
    }());
    var Polyline = /** @class */ (function (_super) {
        __extends(Polyline, _super);
        function Polyline() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return Polyline;
    }(PolylineBase));
    var PomeloWF = (function (exports) {
        // <Clousure />
        // Models
        exports.DrawingModel = DrawingModel;
        exports.ShapeModel = ShapeModel;
        exports.ConnectPolylineModel = ConnectPolylineModel;
        exports.AnchorModel = AnchorModel;
        exports.PointModel = PointModel;
        // Entities
        exports.Drawing = Drawing;
        exports.Shape = Shape;
        exports.ConnectPolyline = ConnectPolyline;
        exports.Polyline = Polyline;
        exports.Point = Point;
        exports.ExtremePoint = ExtremePoint;
        exports.DrawingConfiguration = DrawingConfiguration;
        // Helpers
        exports.Orientation = Orientation;
        var _window = eval('window');
        if (_window) {
            _window.PomeloWF = exports;
        }
        return exports;
    })({});
    var bfsState = /** @class */ (function () {
        function bfsState(path, newPoint, depth) {
            if (depth === void 0) { depth = 0; }
            this.path = new Polyline();
            for (var i = 0; i < path.points.length; ++i) {
                this.path.points.push(path.points[i]);
            }
            this.path.points.push(newPoint);
            this.depth = depth;
        }
        return bfsState;
    }());
    var ConnectPolyline = /** @class */ (function (_super) {
        __extends(ConnectPolyline, _super);
        function ConnectPolyline(guid, drawing) {
            if (guid === void 0) { guid = null; }
            if (drawing === void 0) { drawing = null; }
            var _this = _super.call(this) || this;
            _this.path = new Polyline();
            _this.padding = 5;
            _this.color = '#555';
            _this.pathGeneratedSuccessfully = false;
            _this.drawing = drawing;
            _this.guid = guid || drawing.generateGuid();
            return _this;
        }
        ConnectPolyline.prototype.getGuid = function () {
            return this.guid;
        };
        ConnectPolyline.prototype.setColor = function (color) {
            this.color = color;
        };
        ConnectPolyline.prototype.getColor = function () {
            return this.color;
        };
        ConnectPolyline.prototype.getPaths = function () {
            return this.path;
        };
        ConnectPolyline.prototype.getDepartureAnchor = function () {
            return this.departure;
        };
        ConnectPolyline.prototype.getDestinationAnchor = function () {
            return this.destination;
        };
        ConnectPolyline.prototype.getDrawingElements = function () {
            return this.drawing.getShapes().map(function (x) { return x; }).concat(this.drawing.getConnectPolylines().map(function (x) { return x; }));
        };
        ConnectPolyline.prototype.refreshAnchorPositions = function () {
            this.departurePoint = this.departure.toPointWithPadding(this.padding);
            this.destinationPoint = this.destination.toPointWithPadding(this.padding);
        };
        ConnectPolyline.prototype.getPathGenerationResult = function () {
            return this.pathGeneratedSuccessfully;
        };
        ConnectPolyline.prototype.initFromDepartureAndDestination = function (departure, destination, fastMode) {
            if (fastMode === void 0) { fastMode = false; }
            this.pathGeneratedSuccessfully = false;
            this.departure = departure;
            this.destination = destination;
            return this.update();
        };
        ConnectPolyline.prototype.update = function (fastMode) {
            if (fastMode === void 0) { fastMode = false; }
            this.refreshAnchorPositions();
            this.generateElementSegments(this.drawing.getShapes(), this.drawing.getConnectPolylines());
            this.path.points.splice(0, this.path.points.length);
            var ret = fastMode
                ? this.buildPathBFS()
                : this.buildPathDFS(this.departurePoint);
            if (ret) {
                this.path.points = [this.departure.toPoint()].concat(this.path.points).concat([this.destination.toPoint()]);
            }
            this.points = this.path.points;
            this.pathGeneratedSuccessfully = ret;
            // Update SVG
            var html = this.drawing.getHtmlHelper();
            if (html) {
                var dom = html.getConnectPolylineDOM(this.getGuid());
                if (dom) {
                    html.updateConnectPolyline(this);
                }
                else {
                    html.appendConnectPolyline(this);
                }
            }
            return ret;
        };
        ConnectPolyline.prototype.generateElementSegments = function (shapes, connectPolylines) {
            var _this = this;
            var segments = [];
            var expanded = shapes.map(function (x) { return x.toRectalge().cloneAndExpand(_this.padding); });
            for (var i = 0; i < expanded.length; ++i) {
                var _segments = ConnectPolyline.polylineToSegments(expanded[i]);
                for (var j = 0; j < _segments.length; ++j) {
                    segments.push(_segments[j]);
                }
            }
            this.expandedShapeSegments = segments;
            segments = [];
            for (var i = 0; i < shapes.length; ++i) {
                var _segments = ConnectPolyline.polylineToSegments(shapes[i]);
                for (var j = 0; j < _segments.length; ++j) {
                    segments.push(_segments[j]);
                }
            }
            this.originalShapeSegments = segments;
            segments = [];
            for (var i = 0; i < connectPolylines.length; ++i) {
                var _segments = ConnectPolyline.polylineToSegments(connectPolylines[i]);
                for (var j = 0; j < _segments.length; ++j) {
                    segments.push(_segments[j]);
                }
            }
            this.polylineSegments = segments;
            this.elementSegments = this.polylineSegments.concat(this.expandedShapeSegments);
        };
        ConnectPolyline.polylineToSegments = function (polyline) {
            var ret = [];
            if (polyline.points.length < 2) {
                return ret;
            }
            for (var i = 0; i < polyline.points.length - 1; ++i) {
                var seg = new Segment(polyline.points[i], polyline.points[i + 1]);
                seg.parent = polyline;
                ret.push(seg);
            }
            if (polyline.points.length > 2) {
                var seg = new Segment(polyline.points[0], polyline.points[polyline.points.length - 1]);
                seg.parent = polyline;
                ret.push(seg);
            }
            return ret;
        };
        ConnectPolyline.prototype.getElementsBorder = function (elements) {
            var point1 = new Point(this.departurePoint.x, this.departurePoint.y);
            var point2 = new Point(this.departurePoint.x, this.departurePoint.y);
            point1.x = Math.min(point1.x, this.destinationPoint.x);
            point1.y = Math.min(point1.y, this.destinationPoint.y);
            point2.x = Math.max(point2.x, this.destinationPoint.x);
            point2.y = Math.max(point2.y, this.destinationPoint.y);
            for (var i = 0; i < elements.length; ++i) {
                for (var j = 0; j < elements[i].points.length; ++j) {
                    var _point = elements[i].points[j];
                    point1.x = Math.min(point1.x, _point.x);
                    point1.y = Math.min(point1.y, _point.y);
                    point2.x = Math.max(point2.x, _point.x);
                    point2.y = Math.max(point2.y, _point.y);
                }
            }
            if (point1.x < 0) {
                point1.x = 0;
            }
            if (point1.y < 0) {
                point1.y = 0;
            }
            return [point1, point2];
        };
        ConnectPolyline.prototype.pop = function () {
            this.path.points.splice(this.path.points.length - 1, 1);
        };
        ConnectPolyline.prototype.buildPathDFS = function (point, depth) {
            if (depth === void 0) { depth = 0; }
            this.path.points.push(point);
            if (point.equalsTo(this.destinationPoint)) {
                return true;
            }
            var availablePoints = this.generateAvailableNextPoints(this.path);
            for (var i = 0; i < availablePoints.length; ++i) {
                if (this.buildPathDFS(availablePoints[i], depth + 1)) {
                    return true;
                }
                else {
                    this.pop();
                }
            }
            return false;
        };
        ConnectPolyline.prototype.buildPathBFS = function () {
            var _this = this;
            var initState = new bfsState(new Polyline(), this.departurePoint);
            var queue = [initState];
            var _loop_1 = function () {
                var state = queue.splice(0, 1)[0];
                this_1.path = state.path;
                if (state.depth > 10) {
                    return { value: false };
                }
                if (state.path.points[state.path.points.length - 1].equalsTo(this_1.destinationPoint)) {
                    return { value: true };
                }
                var result = this_1.generateAvailableNextPoints(state.path);
                var destination = result.filter(function (x) { return x.equalsTo(_this.destinationPoint); });
                if (destination.length) {
                    var resultState = new bfsState(state.path, destination[0], state.depth + 1);
                    this_1.path = resultState.path;
                    return { value: true };
                }
                queue = queue.concat(result.map(function (x) { return new bfsState(state.path, x, state.depth + 1); }));
            };
            var this_1 = this;
            while (queue.length) {
                var state_1 = _loop_1();
                if (typeof state_1 === "object")
                    return state_1.value;
            }
        };
        ConnectPolyline.prototype.getLastOrientation = function (path) {
            if (path.points.length < 2) {
                return null;
            }
            return Orientation.getOrientationFromTwoPoints(path.points[path.points.length - 2], path.points[path.points.length - 1]);
        };
        ConnectPolyline.prototype.prioritizeOrientations = function (path) {
            var orientations = [];
            var point = path.points[path.points.length - 1];
            var absX = Math.abs(this.destinationPoint.x - point.x);
            var absY = Math.abs(this.destinationPoint.y - point.y);
            if (absX > absY) {
                if (this.destinationPoint.x - point.x > 0) {
                    orientations.push(AbsoluteOrientation.Right);
                }
                else {
                    orientations.push(AbsoluteOrientation.Left);
                }
                if (this.destinationPoint.y - point.y > 0) {
                    orientations.push(AbsoluteOrientation.Bottom);
                }
                else {
                    orientations.push(AbsoluteOrientation.Top);
                }
            }
            else {
                if (this.destinationPoint.y - point.y > 0) {
                    orientations.push(AbsoluteOrientation.Bottom);
                }
                else {
                    orientations.push(AbsoluteOrientation.Top);
                }
                if (this.destinationPoint.x - point.x > 0) {
                    orientations.push(AbsoluteOrientation.Right);
                }
                else {
                    orientations.push(AbsoluteOrientation.Left);
                }
            }
            // Fill other cases
            var allOrientations = [AbsoluteOrientation.Left, AbsoluteOrientation.Right, AbsoluteOrientation.Top, AbsoluteOrientation.Bottom];
            for (var i = 0; i < allOrientations.length; ++i) {
                var o = allOrientations[i];
                if (orientations.indexOf(o) < 0) {
                    orientations.push(o);
                }
            }
            var lastOrientation = this.getLastOrientation(path);
            if (lastOrientation) {
                var reversedOrientation = Orientation.getReversedOrientation(lastOrientation);
                orientations.splice(orientations.indexOf(reversedOrientation), 1);
            }
            return orientations;
        };
        ConnectPolyline.prototype.getElementsX = function () {
            var ret = [];
            for (var i = 0; i < this.getDrawingElements().length; ++i) {
                var element = this.getDrawingElements()[i];
                for (var j = 0; j < element.points.length; ++j) {
                    var result = element.points[j].x;
                    if (ret.indexOf(result) < 0) {
                        ret.push(result);
                    }
                }
            }
            return ret;
        };
        ConnectPolyline.prototype.getElementsY = function () {
            var ret = [];
            for (var i = 0; i < this.getDrawingElements().length; ++i) {
                var element = this.getDrawingElements()[i];
                for (var j = 0; j < element.points.length; ++j) {
                    var result = element.points[j].y;
                    if (ret.indexOf(result) < 0) {
                        ret.push(result);
                    }
                }
            }
            return ret;
        };
        ConnectPolyline.prototype.getCrossedPointsWithSegment = function (segment, path) {
            var ret = [];
            var orientation = Orientation.getOrientationFromTwoPoints(segment.points[0], segment.points[1]);
            switch (orientation) {
                case AbsoluteOrientation.Bottom: {
                    var elementYs = this.getElementsY().filter(function (x) { return x > segment.points[0].y; });
                    for (var i = 0; i < elementYs.length; ++i) {
                        ret.push(new Point(segment.points[0].x, elementYs[i]));
                    }
                    if (this.destinationPoint.y > segment.points[0].y) {
                        ret.push(new Point(segment.points[0].x, this.destinationPoint.y));
                    }
                    break;
                }
                case AbsoluteOrientation.Top: {
                    var elementYs = this.getElementsY().filter(function (x) { return x < segment.points[0].y; });
                    for (var i = 0; i < elementYs.length; ++i) {
                        ret.push(new Point(segment.points[0].x, elementYs[i]));
                    }
                    if (this.destinationPoint.y < segment.points[0].y) {
                        ret.push(new Point(segment.points[0].x, this.destinationPoint.y));
                    }
                    break;
                }
                case AbsoluteOrientation.Right: {
                    var elementXs = this.getElementsX().filter(function (x) { return x > segment.points[0].x; });
                    for (var i = 0; i < elementXs.length; ++i) {
                        ret.push(new Point(elementXs[i], segment.points[0].y));
                    }
                    if (this.destinationPoint.x > segment.points[0].x) {
                        ret.push(new Point(this.destinationPoint.x, segment.points[0].y));
                    }
                    break;
                }
                case AbsoluteOrientation.Left: {
                    var elementXs = this.getElementsX().filter(function (x) { return x < segment.points[0].x; });
                    for (var i = 0; i < elementXs.length; ++i) {
                        ret.push(new Point(elementXs[i], segment.points[0].y));
                    }
                    if (this.destinationPoint.x < segment.points[0].x) {
                        ret.push(new Point(this.destinationPoint.x, segment.points[0].y));
                    }
                    break;
                }
            }
            return ret;
        };
        ConnectPolyline.prototype.getCurrentPointToDestinationCrossedSegments = function (point) {
            var seg = new Segment(point, this.destinationPoint);
            var ret = [];
            var segments = this.originalShapeSegments.filter(function (x) { return x.isCrossedBySegment(seg); });
            for (var i = 0; i < segments.length; ++i) {
                ret.push(segments[i]);
            }
            segments = this.originalShapeSegments.filter(function (x) { return x.isCrossedBySegment(seg); });
            for (var i = 0; i < segments.length; ++i) {
                ret.push(segments[i]);
            }
            return ret;
        };
        ConnectPolyline.prototype.generateAvailableNextPoints = function (path) {
            var _this = this;
            var points = [];
            var orientations = this.prioritizeOrientations(path);
            var lastPoint = path.points[path.points.length - 1];
            var border = this.getElementsBorder(this.elementSegments);
            var _loop_2 = function (i) {
                var orientation = orientations[i];
                var halfLine = this_2.generateHalfLine(lastPoint, orientation, border);
                var crossedPoints = this_2.getCrossedPointsWithSegment(halfLine, path);
                crossedPoints = crossedPoints
                    .filter(function (x) { return x; });
                // Don't cross segment
                var unavailableRange = [];
                if (orientation == AbsoluteOrientation.Bottom || orientation == AbsoluteOrientation.Top) {
                    unavailableRange = this_2.originalShapeSegments.concat(this_2.polylineSegments).map(function (x) { return x.getDeltaY(); });
                    crossedPoints = crossedPoints.filter(function (point) { return point.equalsTo(_this.destinationPoint)
                        || point.x == _this.destinationPoint.x && _this.getCurrentPointToDestinationCrossedSegments(point).length <= 1
                        || point.y == _this.destinationPoint.y && _this.getCurrentPointToDestinationCrossedSegments(point).length <= 1
                        || unavailableRange.every(function (range) { return point.y < range[0] || point.y > range[1]; }); });
                }
                else {
                    unavailableRange = this_2.originalShapeSegments.concat(this_2.polylineSegments).map(function (x) { return x.getDeltaX(); });
                    crossedPoints = crossedPoints.filter(function (point) { return point.equalsTo(_this.destinationPoint)
                        || point.x == _this.destinationPoint.x && _this.getCurrentPointToDestinationCrossedSegments(point).length <= 1
                        || point.y == _this.destinationPoint.y && _this.getCurrentPointToDestinationCrossedSegments(point).length <= 1
                        || unavailableRange.every(function (range) { return point.x < range[0] || point.x > range[1]; }); });
                }
                var fixedPoints = [];
                var fixedPoint = this_2.cutSegment(halfLine, this_2.padding);
                if (true) {
                    var border_1 = this_2.getElementsBorder(this_2.elementSegments);
                    while (true) {
                        if (fixedPoint.x < border_1[0].x - this_2.padding || fixedPoint.y < border_1[0].y - this_2.padding
                            || fixedPoint.x > border_1[1].x + this_2.padding || fixedPoint.y > border_1[1].y + this_2.padding) {
                            break;
                        }
                        if (fixedPoint.equalsTo(this_2.destinationPoint) && this_2.isValidPoint(fixedPoint, path)) {
                            break;
                        }
                        if (orientation == AbsoluteOrientation.Bottom || orientation == AbsoluteOrientation.Top) {
                            if (unavailableRange.every(function (range) { return fixedPoint.y < range[0] || fixedPoint.y > range[1]; })) {
                                if (this_2.isValidPoint(fixedPoint, path)) {
                                    fixedPoints.push(fixedPoint);
                                    break;
                                }
                            }
                        }
                        else {
                            if (unavailableRange.every(function (range) { return fixedPoint.x < range[0] || fixedPoint.x > range[1]; })) {
                                if (this_2.isValidPoint(fixedPoint, path)) {
                                    fixedPoints.push(fixedPoint);
                                    break;
                                }
                            }
                        }
                        fixedPoint = this_2.extendSegment(new Segment(lastPoint, fixedPoint));
                    }
                }
                points = points.concat(crossedPoints).concat(fixedPoints);
            };
            var this_2 = this;
            for (var i = 0; i < orientations.length; ++i) {
                _loop_2(i);
            }
            points = points.filter(function (x) { return x; });
            points = points.filter(function (x) { return _this.isValidPoint(x, path); });
            var origin = this.destinationPoint;
            // Greedy: Always try to get closer to the destination
            points.sort(function (a, b) {
                return Math.sqrt((origin.x - a.x) * (origin.x - a.x) + (origin.y - a.y) * (origin.y - a.y)) - Math.sqrt((origin.x - b.x) * (origin.x - b.x) + (origin.y - b.y) * (origin.y - b.y));
            });
            return points;
        };
        ConnectPolyline.prototype.isValidPoint = function (point, path) {
            var count = 0;
            // 0. Null Check
            if (!point) {
                return false;
            }
            // 1. Orientation Check: The point can only move up, down, left or right
            if (path.points.length) {
                var lastPoint_1 = path.points[path.points.length - 1];
                if (point.x != lastPoint_1.x && point.y != lastPoint_1.y) {
                    return false;
                }
            }
            // 2. Visit Check: The current point should not exist in path
            if (path.points.filter(function (x) { return x.equalsTo(point); }).length) {
                return false;
            }
            // 3. Border Check
            var border = this.getElementsBorder(this.elementSegments);
            var borderCheckResult = border[0].x - this.padding <= point.x
                && point.x <= border[1].x + this.padding
                && border[0].y - this.padding <= point.y
                && point.y <= border[1].y + this.padding;
            if (!borderCheckResult) {
                return false;
            }
            // 4. Point Cross Check
            {
                var isDestinationOrDeparture = point.equalsTo(this.destinationPoint) || point.equalsTo(this.departurePoint);
                // a) The current point should not in the existed path segment
                for (var i = 0; i < path.points.length - 1; ++i) {
                    var seg = new Segment(path.points[i], path.points[i + 1]);
                    if (seg.isPointInSegment(point)) {
                        ++count;
                    }
                }
                if (!(isDestinationOrDeparture && count <= 1 || count == 0)) {
                    //console.debug('Invalid: Point Cross Check: The current point should not in the existed path segment');
                    return false;
                }
                // b) The current point should not locate inside of any shapes
                if (this.getDrawingElements().filter(function (x) { return x.isPointInPolygon(point); }).length && !isDestinationOrDeparture) { // Use actual shape(not expanded)
                    return false;
                }
                // c) Current segment should not cross with others
                var lastPoint_2 = path.points[path.points.length - 1];
                var segment_1 = new Segment(lastPoint_2, point);
                if (this.polylineSegments.some(function (x) { return segment_1.getCrossStateWithSegment(x) == SegmentCrossState.Infinite; })
                    && !segment_1.points[0].equalsTo(this.departurePoint)
                    && !segment_1.points[1].equalsTo(this.departurePoint)
                    && !segment_1.points[0].equalsTo(this.destinationPoint)
                    && !segment_1.points[1].equalsTo(this.destinationPoint)) {
                    return false;
                }
            }
            // 5. Segment Cross Check: The generated segment should not have cross points with others
            var lastPoint = path.points[path.points.length - 1];
            var segment = new Segment(lastPoint, point);
            if (this.polylineSegments.filter(function (x) { return x.getCrossStateWithSegment(segment) == SegmentCrossState.Infinite; }).length) {
                return false;
            }
            count = this.originalShapeSegments.filter(function (x) { return x.getCrossStateWithSegment(segment) == SegmentCrossState.Single; }).length;
            if (count > 0) {
                var isDestinationOrDeparture = point.equalsTo(this.destinationPoint)
                    || point.equalsTo(this.departurePoint)
                    || lastPoint.equalsTo(this.destinationPoint)
                    || lastPoint.equalsTo(this.departurePoint);
                if (isDestinationOrDeparture && count > 1 || !isDestinationOrDeparture) {
                    return false;
                }
            }
            return true;
        };
        ConnectPolyline.prototype.extendSegment = function (segment) {
            if (segment.points.some(function (x) { return !x; })) {
                return null;
            }
            var orientation = Orientation.getOrientationFromTwoPoints(segment.points[0], segment.points[1]);
            if (orientation == AbsoluteOrientation.Top) {
                return new Point(segment.points[1].x, Math.max(segment.points[1].y - this.padding, 0));
            }
            else if (orientation == AbsoluteOrientation.Bottom) {
                return new Point(segment.points[1].x, segment.points[1].y + this.padding);
            }
            else if (orientation == AbsoluteOrientation.Left) {
                return new Point(Math.max(segment.points[1].x - this.padding, 0), segment.points[1].y);
            }
            else { // Right
                return new Point(segment.points[1].x + this.padding, segment.points[1].y);
            }
        };
        ConnectPolyline.prototype.cutSegment = function (segment, length) {
            if (segment.points.some(function (x) { return !x; })) {
                return null;
            }
            var orientation = Orientation.getOrientationFromTwoPoints(segment.points[0], segment.points[1]);
            if (orientation == AbsoluteOrientation.Top) {
                return new Point(segment.points[0].x, Math.max(segment.points[0].y - length, 0));
            }
            else if (orientation == AbsoluteOrientation.Bottom) {
                return new Point(segment.points[0].x, segment.points[0].y + length);
            }
            else if (orientation == AbsoluteOrientation.Left) {
                return new Point(Math.max(segment.points[0].x - length, 0), segment.points[0].y);
            }
            else { // Right
                return new Point(segment.points[0].x + length, segment.points[0].y);
            }
        };
        ConnectPolyline.prototype.contractSegment = function (segment) {
            if (segment.points.some(function (x) { return !x; })) {
                return null;
            }
            var ret = null;
            var orientation = Orientation.getOrientationFromTwoPoints(segment.points[0], segment.points[1]);
            if (orientation == AbsoluteOrientation.Top) {
                ret = new Point(segment.points[1].x, Math.max(segment.points[1].y + this.padding, 0));
            }
            else if (orientation == AbsoluteOrientation.Bottom) {
                ret = new Point(segment.points[1].x, segment.points[1].y - this.padding);
            }
            else if (orientation == AbsoluteOrientation.Left) {
                ret = new Point(Math.max(segment.points[1].x + this.padding, 0), segment.points[1].y);
            }
            else { // Right
                ret = new Point(segment.points[1].x - this.padding, segment.points[1].y);
            }
            if (Orientation.getOrientationFromTwoPoints(segment.points[0], ret) != Orientation.getOrientationFromTwoPoints(segment.points[0], segment.points[1])) {
                return null;
            }
            return ret;
        };
        ConnectPolyline.prototype.generateHalfLine = function (point, orientation, border) {
            var destination;
            if (orientation == AbsoluteOrientation.Bottom) {
                destination = new Point(point.x, border[1].y + this.padding);
            }
            else if (orientation == AbsoluteOrientation.Top) {
                destination = new Point(point.x, Math.max(border[0].y - this.padding, 0));
            }
            else if (orientation == AbsoluteOrientation.Right) {
                destination = new Point(border[1].x + this.padding, point.y);
            }
            else { // Left
                destination = new Point(Math.max(border[0].x - this.padding, 0), point.y);
            }
            return new Segment(point, destination);
        };
        ConnectPolyline.prototype.remove = function () {
            if (!this.drawing) {
                return;
            }
            var html = this.drawing.getHtmlHelper();
            if (!html) {
                return;
            }
            var elements = this.drawing.getConnectPolylines();
            var index = elements.indexOf(this);
            if (index < 0) {
                return;
            }
            elements.splice(index, 1);
            html.removeConnectPolyline(this.guid);
        };
        ConnectPolyline.prototype.generateSvg = function () {
            if (!this.points.length) {
                return '';
            }
            return "<polyline data-polyline=\"".concat(this.getGuid(), "\" points=\"").concat(this.getPaths().points.map(function (x) { return x.x + ',' + x.y; }).join(' '), "\"\n    style=\"fill:none;stroke:").concat(this.getColor(), ";stroke-width:").concat(this.drawing.getConfig().connectPolylineStrokeWidth, "\"/>");
        };
        return ConnectPolyline;
    }(PolylineBase));
    var DrawingConfiguration = /** @class */ (function () {
        function DrawingConfiguration() {
            this.padding = 5;
            this.renderShape = false;
            this.shapeStrokeColor = 'blue';
            this.shapeStrokeWidth = 1;
            this.connectPolylineStrokeWidth = 1;
        }
        return DrawingConfiguration;
    }());
    var ElementType;
    (function (ElementType) {
        ElementType[ElementType["Shape"] = 0] = "Shape";
        ElementType[ElementType["Polyline"] = 1] = "Polyline";
    })(ElementType || (ElementType = {}));
    var Drawing = /** @class */ (function () {
        function Drawing(config, guid) {
            if (guid === void 0) { guid = null; }
            // Properties
            this.shapes = [];
            this.connectPolylines = [];
            // Config
            this.config = new DrawingConfiguration();
            this.config.padding = config.padding || this.config.padding;
            this.config.renderShape = config.renderShape || this.config.renderShape;
            this.config.shapeStrokeColor = config.shapeStrokeColor || this.config.shapeStrokeColor;
            this.config.shapeStrokeWidth = config.shapeStrokeWidth || this.config.shapeStrokeWidth;
            this.config.connectPolylineStrokeWidth = config.connectPolylineStrokeWidth || this.config.connectPolylineStrokeWidth;
            this.guid = guid || this.generateGuid();
        }
        Drawing.prototype.getGuid = function () {
            return this.guid;
        };
        Drawing.prototype.getConfig = function () {
            return this.config;
        };
        Drawing.prototype.getShapes = function () {
            return this.shapes;
        };
        Drawing.prototype.getConnectPolylines = function () {
            return this.connectPolylines;
        };
        Drawing.prototype.generateGuid = function () {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        };
        Drawing.prototype.getHtmlHelper = function () {
            return this.htmlHelper;
        };
        Drawing.prototype.serializeToJson = function () {
            var ret = {
                guid: this.guid,
                shapes: this.shapes.map(function (shape) { return ({
                    guid: shape.getGuid(),
                    points: shape.points,
                    anchors: shape.getAnchors().map(function (anchor) { return ({
                        xPercentage: anchor.xPercentage,
                        yPercentage: anchor.yPercentage
                    }); })
                }); }),
                connectPolylines: this.connectPolylines.map(function (cpl) { return ({
                    guid: cpl.getGuid(),
                    departureShapeGuid: cpl.getDepartureAnchor().shape.getGuid(),
                    destinationShapeGuid: cpl.getDestinationAnchor().shape.getGuid(),
                    departureAnchorIndex: cpl.getDepartureAnchor().shape.getAnchors().indexOf(cpl.getDepartureAnchor()),
                    destinationAnchorIndex: cpl.getDestinationAnchor().shape.getAnchors().indexOf(cpl.getDestinationAnchor()),
                    color: cpl.getColor(),
                    path: cpl.getPaths().points
                }); })
            };
            return JSON.stringify(ret);
        };
        Drawing.prototype.clean = function () {
            this.shapes.splice(0, this.shapes.length);
            this.connectPolylines.splice(0, this.connectPolylines.length);
            var html = this.getHtmlHelper();
            if (!html) {
                return;
            }
            html.clean();
        };
        Drawing.prototype.deserializeFromJson = function (json) {
            var model = JSON.parse(json);
            this.clean();
            var html = this.getHtmlHelper();
            if (html && model.guid) {
                html.getDrawingSvg().setAttribute('data-drawing', model.guid);
            }
            this.guid = model.guid || this.guid;
            for (var i = 0; i < model.shapes.length; ++i) {
                var shape = model.shapes[i];
                var shapeInstance = this.createShape(shape.points.map(function (x) { return new Point(x.x, x.y); }), shape.guid || this.generateGuid());
                for (var j = 0; j < shape.anchors.length; ++j) {
                    shapeInstance.createAnchor(shape.anchors[j].xPercentage, shape.anchors[j].yPercentage);
                }
            }
            for (var i = 0; i < model.connectPolylines.length; ++i) {
                var cpl = model.connectPolylines[i];
                this.createConnectPolyline(cpl.departureShapeGuid, cpl.departureAnchorIndex, cpl.destinationShapeGuid, cpl.destinationAnchorIndex, cpl.color, cpl.guid || this.generateGuid());
            }
        };
        Drawing.prototype.findShapeByGuid = function (guid) {
            var result = this.shapes.filter(function (x) { return x.getGuid().toLowerCase() == guid.toLowerCase(); });
            if (!result.length) {
                return null;
            }
            return result[0];
        };
        Drawing.prototype.createRect = function (left, top, width, height, guid) {
            if (guid === void 0) { guid = null; }
            var shape = new Rectangle(left, top, width, height, guid || this.generateGuid(), this);
            this.shapes.push(shape);
            return shape;
        };
        Drawing.prototype.createShape = function (points, guid) {
            if (guid === void 0) { guid = null; }
            var shape = new Shape(points, guid || this.generateGuid(), this);
            this.shapes.push(shape);
            return shape;
        };
        Drawing.prototype.createConnectPolyline = function (departureGuid, departureAnchorIndex, destinationGuid, destinationAnchorIndex, color, guid) {
            if (color === void 0) { color = '#555'; }
            if (guid === void 0) { guid = null; }
            var cpl = new ConnectPolyline(guid, this);
            cpl.setColor(color);
            var departure = this.findShapeByGuid(departureGuid);
            var destination = this.findShapeByGuid(destinationGuid);
            this.connectPolylines.push(cpl);
            cpl.initFromDepartureAndDestination(departure.getAnchors()[departureAnchorIndex], destination.getAnchors()[destinationAnchorIndex]);
            return cpl;
        };
        Drawing.prototype.getBorder = function (elements) {
            if (elements === void 0) { elements = null; }
            if (elements == null) {
                elements = (this.shapes).concat(this.connectPolylines);
            }
            if (!elements.length) {
                return null;
            }
            var point1 = null;
            var point2 = null;
            var isFisrtPoint = true;
            for (var i = 0; i < elements.length; ++i) {
                for (var j = 0; j < elements[i].points.length; ++j) {
                    if (isFisrtPoint) {
                        isFisrtPoint = false;
                        point1 = new Point(elements[i].points[j].x, elements[i].points[j].y);
                        point2 = new Point(elements[i].points[j].x, elements[i].points[j].y);
                    }
                    var _point = elements[i].points[j];
                    point1.x = Math.min(point1.x, _point.x);
                    point1.y = Math.min(point1.y, _point.y);
                    point2.x = Math.max(point2.x, _point.x);
                    point2.y = Math.max(point2.y, _point.y);
                }
            }
            if (point1.x < 0) {
                point1.x = 0;
            }
            if (point1.y < 0) {
                point1.y = 0;
            }
            return [point1, point2];
        };
        Drawing.prototype.generateSvg = function () {
            // Get border
            var border = this.getBorder();
            // Render shapes
            var shapes = [];
            if (this.config.renderShape) {
                shapes = this.getShapes().map(function (el) { return el.generateSvg(); });
            }
            // Render connect polylines
            var lines = this.getConnectPolylines().map(function (l) { return l.generateSvg(); });
            var width = border ? border[1].x : 0;
            var height = border ? border[1].y : 0;
            var ret = "<svg width=\"".concat(width + this.config.padding, "px\" height=\"").concat(height + this.config.padding, "px\" data-drawing=\"").concat(this.getGuid(), "\" version=\"1.1\"\n    xmlns=\"http://www.w3.org/2000/svg\">\n    ").concat(shapes.join('\r\n'), "\n    ").concat(lines.join('\r\n'), "\n    \n    </svg>");
            return ret;
        };
        Drawing.prototype.mount = function (selector) {
            if (this.htmlHelper) {
                throw "[Pomelo Workflow] This drawing is already mounted.";
            }
            this.htmlHelper = new DrawingHtmlHelper(this, selector);
        };
        Drawing.prototype.isShapeNotConflicted = function (shape) {
            var _this = this;
            var _shape;
            if (shape instanceof Shape) {
                _shape = shape;
            }
            else {
                var shapes_1 = this.shapes.filter(function (x) { return x.getGuid() == shape; });
                if (!shapes_1.length) {
                    return null;
                }
                shape = shapes_1[0];
            }
            var expandedShape = shape.toRectalge().cloneAndExpand(this.config.padding);
            var shapes = this.shapes.filter(function (x) { return x.getGuid() != _shape.getGuid(); }).map(function (x) { return x.toRectalge().cloneAndExpand(_this.config.padding); });
            var _loop_3 = function (i) {
                var point = shape.points[i];
                if (shapes.some(function (x) { return x.isPointInPolygon(point); })) {
                    return { value: false };
                }
            };
            for (var i = 0; i < expandedShape.points.length; ++i) {
                var state_2 = _loop_3(i);
                if (typeof state_2 === "object")
                    return state_2.value;
            }
            return true;
        };
        Drawing.prototype.isRectangleNotConflicted = function (leftTop, rightBottom) {
            var rect = new Rectangle(leftTop.x, leftTop.y, rightBottom.x - leftTop.x, rightBottom.y - leftTop.y, null, null);
            return this.isShapeNotConflicted(rect);
        };
        return Drawing;
    }());
    var DrawingHtmlHelper = /** @class */ (function () {
        function DrawingHtmlHelper(drawing, selector) {
            this.mountedElement = null;
            this.maskLayerHtmlId = null;
            this.svgLayerHtmlId = null;
            this.drawing = drawing;
            var doms = this.getDocument().querySelectorAll(selector);
            if (!doms.length) {
                throw "[Pomelo Workflow] ".concat(selector, " was not found");
            }
            this.mountedElement = doms[0];
            this.maskLayerHtmlId = 'pomelo-wf-mask-' + drawing.getGuid();
            this.svgLayerHtmlId = 'pomelo-wf-svg-' + drawing.getGuid();
            this.mountedElement.innerHTML = "<div id=\"".concat(this.maskLayerHtmlId, "\"></div><div id=\"").concat(this.svgLayerHtmlId, "\">").concat(this.drawing.generateSvg(), "</div>");
        }
        DrawingHtmlHelper.prototype.getWindow = function () {
            return eval('window');
        };
        DrawingHtmlHelper.prototype.getDocument = function () {
            return this.getWindow().document;
        };
        DrawingHtmlHelper.prototype.generateAttributeCollection = function (style) {
            var ret = {};
            if (!style) {
                return ret;
            }
            var splited = style.split(';').map(function (x) { return x.trim(); });
            for (var i = 0; i < splited.length; ++i) {
                var stylePair = splited[0].split(':').map(function (x) { return x.trim(); });
                if (stylePair.length != 2) {
                    continue;
                }
                ret[stylePair[0]] = stylePair[1];
            }
            return ret;
        };
        DrawingHtmlHelper.prototype.generateAttributeString = function (style) {
            if (!style) {
                return '';
            }
            return Object.getOwnPropertyNames(style).map(function (x) { return "".concat(x, ": ").concat(style[x]); }).join('; ');
        };
        DrawingHtmlHelper.prototype.setShape = function (guid, points, stylePatch) {
            if (points === void 0) { points = null; }
            if (stylePatch === void 0) { stylePatch = null; }
            this.setSvgElement(ElementType.Shape, guid, points, stylePatch);
        };
        DrawingHtmlHelper.prototype.setConnectPolyline = function (guid, points, stylePatch) {
            if (points === void 0) { points = null; }
            if (stylePatch === void 0) { stylePatch = null; }
            this.setSvgElement(ElementType.Polyline, guid, points, stylePatch);
        };
        DrawingHtmlHelper.prototype.getDrawingSvg = function () {
            return this.mountedElement.querySelector("[data-drawing=\"".concat(this.drawing.getGuid(), "\"]"));
        };
        DrawingHtmlHelper.prototype.getShapeDOM = function (guid) {
            return this.mountedElement.querySelector("[data-shape=\"".concat(guid, "\"]"));
        };
        DrawingHtmlHelper.prototype.getConnectPolylineDOM = function (guid) {
            return this.mountedElement.querySelector("[data-polyline=\"".concat(guid, "\"]"));
        };
        DrawingHtmlHelper.prototype.getShapeDOMs = function () {
            var ret = this.mountedElement.querySelectorAll('[data-shape]');
            return this.convertNodeListToArray(ret);
        };
        DrawingHtmlHelper.prototype.getConnectPolylineDOMs = function () {
            var ret = this.mountedElement.querySelectorAll('[data-polyline]');
            return this.convertNodeListToArray(ret);
        };
        DrawingHtmlHelper.prototype.setSvgElement = function (elementType, guid, points, stylePatch) {
            if (points === void 0) { points = null; }
            if (stylePatch === void 0) { stylePatch = null; }
            var dom = elementType == ElementType.Shape
                ? this.getShapeDOM(guid)
                : this.getConnectPolylineDOM(guid);
            if (dom == null) {
                //console.warn(`[Pomelo Workflow] ${guid} was not found`);
                return;
            }
            if (points != null) {
                dom.setAttribute('points', points.map(function (x) { return "".concat(x.x, ",").concat(x.y); }).join(' '));
            }
            if (stylePatch != null) {
                var styles = this.generateAttributeCollection(dom.getAttribute('style'));
                var keys = Object.getOwnPropertyNames(stylePatch);
                for (var i = 0; i < keys.length; ++i) {
                    styles[keys[i]] = stylePatch[keys[i]];
                }
                dom.setAttribute('style', this.generateAttributeString(styles));
            }
            this.updateSvgBorder();
        };
        DrawingHtmlHelper.prototype.clean = function () {
            this.getDrawingSvg().innerHTML = '';
        };
        DrawingHtmlHelper.prototype.refresh = function () {
            var _this = this;
            // Clean up
            this.clean();
            // Update
            var shapes = this.drawing.getShapes();
            for (var i = 0; i < shapes.length; ++i) {
                var shape = shapes[i];
                this.updateShape(shape);
            }
            var polylines = this.drawing.getConnectPolylines();
            for (var i = 0; i < polylines.length; ++i) {
                var polyline = polylines[i];
                this.updateConnectPolyline(polyline);
            }
            // Remove
            var shapeGuidsToRemove = this.getShapeDOMs().map(function (x) { return x.getAttribute('data-shape'); }).filter(function (x) { return x == 'null' || shapes.every(function (y) { return y.getGuid() != x; }); });
            for (var i = 0; i < shapeGuidsToRemove.length; ++i) {
                this.removeShape(shapeGuidsToRemove[i]);
            }
            var connectPolylineGuidsToRemove = this.getConnectPolylineDOMs().map(function (x) { return x.getAttribute('data-polyline'); }).filter(function (x) { return x == 'null' || polylines.every(function (y) { return y.getGuid() != x; }); });
            for (var i = 0; i < connectPolylineGuidsToRemove.length; ++i) {
                this.removeConnectPolyline(connectPolylineGuidsToRemove[i]);
            }
            // Append
            var shapesToAppend = shapes.filter(function (x) { return _this.getShapeDOMs().map(function (x) { return x.getAttribute('data-shape'); }).every(function (y) { return x.getGuid() != y; }); });
            for (var i = 0; i < shapesToAppend.length; ++i) {
                this.appendShape(shapesToAppend[i]);
            }
            var connectPolylinesToAppend = polylines.filter(function (x) { return _this.getConnectPolylineDOMs().map(function (x) { return x.getAttribute('data-polyline'); }).every(function (y) { return x.getGuid() != y; }); });
            for (var i = 0; i < connectPolylinesToAppend.length; ++i) {
                this.appendConnectPolyline(connectPolylinesToAppend[i]);
            }
            this.updateSvgBorder();
        };
        DrawingHtmlHelper.prototype.updateShape = function (shape) {
            var shapeDOM = this.getShapeDOM(shape.getGuid());
            if (!shapeDOM) {
                return;
            }
            var points = shape.points.concat([shape.points[0]]);
            this.setShape(shape.getGuid(), points, { stroke: this.drawing.getConfig().shapeStrokeColor, 'stroke-width': this.drawing.getConfig().shapeStrokeWidth });
        };
        DrawingHtmlHelper.prototype.updateConnectPolyline = function (connectPolyline) {
            var connectPolylineDOM = this.getShapeDOM(connectPolyline.getGuid());
            if (!connectPolylineDOM) {
                return;
            }
            this.setShape(connectPolyline.getGuid(), connectPolyline.points, { stroke: connectPolyline.getColor(), 'stroke-width': this.drawing.getConfig().connectPolylineStrokeWidth });
        };
        DrawingHtmlHelper.prototype.appendShape = function (shape) {
            var shapeDOM = this.getShapeDOM(shape.getGuid());
            if (shapeDOM) {
                return;
            }
            var svg = shape.generateSvg();
            var element = this.getDocument().createElement('div');
            this.getDrawingSvg().appendChild(element);
            element.outerHTML = svg;
            this.updateSvgBorder();
        };
        DrawingHtmlHelper.prototype.appendConnectPolyline = function (connectPolyline) {
            var connectPolylineDOM = this.getConnectPolylineDOM(connectPolyline.getGuid());
            if (connectPolylineDOM) {
                return;
            }
            var svg = connectPolyline.generateSvg();
            var element = this.getDocument().createElement('div');
            this.getDrawingSvg().appendChild(element);
            element.outerHTML = svg;
            this.updateSvgBorder();
        };
        DrawingHtmlHelper.prototype.removeShape = function (guid) {
            var dom = this.getShapeDOM(guid);
            if (dom) {
                dom.outerHTML = '';
            }
            this.updateSvgBorder();
        };
        DrawingHtmlHelper.prototype.removeConnectPolyline = function (guid) {
            var dom = this.getConnectPolylineDOM(guid);
            if (dom) {
                dom.outerHTML = '';
            }
            this.updateSvgBorder();
        };
        DrawingHtmlHelper.prototype.updateSvgBorder = function () {
            var border = this.drawing.getBorder();
            if (!border) {
                return;
            }
            this.getDrawingSvg().setAttribute('width', (border[1].x + this.drawing.getConfig().padding) + 'px');
            this.getDrawingSvg().setAttribute('height', (border[1].y + this.drawing.getConfig().padding) + 'px');
        };
        DrawingHtmlHelper.prototype.convertNodeListToArray = function (nodes) {
            var array = null;
            try {
                array = Array.prototype.slice.call(nodes, 0);
            }
            catch (ex) {
                array = new Array();
                for (var i = 0, len = nodes.length; i < len; i++) {
                    array.push(nodes[i]);
                }
            }
            return array;
        };
        return DrawingHtmlHelper;
    }());
    var ExtremePoint = /** @class */ (function (_super) {
        __extends(ExtremePoint, _super);
        function ExtremePoint(point, prev, next) {
            if (prev === void 0) { prev = null; }
            if (next === void 0) { next = null; }
            var _this = _super.call(this, point.x, point.y) || this;
            _this.next = next;
            _this.prev = prev;
            return _this;
        }
        ExtremePoint.prototype.getRelativeOrientation = function () {
            if (this.prev == null || this.next == null) {
                return null;
            }
            if (this.prev.x == this.x && this.x == this.next.x) {
                return RelativeOrientation.Straight;
            }
            var o1 = Orientation.getOrientationFromTwoPoints(this.prev, this);
            var o2 = Orientation.getOrientationFromTwoPoints(this, this.next);
            if (o1 == Orientation.getReversedOrientation(o2)) {
                return RelativeOrientation.Backward;
            }
            if (o1 == AbsoluteOrientation.Bottom && o2 == AbsoluteOrientation.Left
                || o1 == AbsoluteOrientation.Left && o2 == AbsoluteOrientation.Top
                || o1 == AbsoluteOrientation.Top && o2 == AbsoluteOrientation.Right
                || o1 == AbsoluteOrientation.Right && o2 == AbsoluteOrientation.Bottom) {
                return RelativeOrientation.Right;
            }
            else {
                return RelativeOrientation.Left;
            }
        };
        return ExtremePoint;
    }(Point));
    var AbsoluteOrientation;
    (function (AbsoluteOrientation) {
        AbsoluteOrientation["Left"] = "Left";
        AbsoluteOrientation["Right"] = "Right";
        AbsoluteOrientation["Top"] = "Top";
        AbsoluteOrientation["Bottom"] = "Bottom";
    })(AbsoluteOrientation || (AbsoluteOrientation = {}));
    var RelativeOrientation;
    (function (RelativeOrientation) {
        RelativeOrientation["Left"] = "Left";
        RelativeOrientation["Right"] = "Right";
        RelativeOrientation["Straight"] = "Straight";
        RelativeOrientation["Backward"] = "Backward";
    })(RelativeOrientation || (RelativeOrientation = {}));
    var Orientation = /** @class */ (function () {
        function Orientation() {
        }
        Orientation.getReversedOrientation = function (orientation) {
            switch (orientation) {
                case AbsoluteOrientation.Bottom:
                    return AbsoluteOrientation.Top;
                case AbsoluteOrientation.Top:
                    return AbsoluteOrientation.Bottom;
                case AbsoluteOrientation.Left:
                    return AbsoluteOrientation.Right;
                case AbsoluteOrientation.Right:
                    return AbsoluteOrientation.Left;
            }
        };
        Orientation.getOrientationFromTwoPoints = function (departure, destination) {
            var segment = new Segment(departure, destination);
            if (segment.points[0].y == segment.points[1].y) {
                if (segment.points[1].x > segment.points[0].x) {
                    return AbsoluteOrientation.Right;
                }
                else if (segment.points[1].x < segment.points[0].x) {
                    return AbsoluteOrientation.Left;
                }
                else {
                    return null;
                }
            }
            else if (segment.points[0].x == segment.points[1].x) {
                if (segment.points[1].y > segment.points[0].y) {
                    return AbsoluteOrientation.Bottom;
                }
                else if (segment.points[1].y < segment.points[0].y) {
                    return AbsoluteOrientation.Top;
                }
                else {
                    return null;
                }
            }
            else {
                return null;
            }
        };
        return Orientation;
    }());
    var SegmentCrossState;
    (function (SegmentCrossState) {
        SegmentCrossState[SegmentCrossState["None"] = 0] = "None";
        SegmentCrossState[SegmentCrossState["Single"] = 1] = "Single";
        SegmentCrossState[SegmentCrossState["Infinite"] = 2] = "Infinite";
    })(SegmentCrossState || (SegmentCrossState = {}));
    var Segment = /** @class */ (function (_super) {
        __extends(Segment, _super);
        function Segment(depatrue, destination) {
            var _this = _super.call(this) || this;
            _this.parent = null;
            _this.points.push(depatrue);
            _this.points.push(destination);
            return _this;
        }
        Segment.prototype.getPoints = function () {
            return this.points;
        };
        Segment.prototype.isPointInSegment = function (point) {
            if (point.equalsTo(this.points[0])
                || point.equalsTo(this.points[1])) {
                return true;
            }
            var p1 = this.points[0];
            var p2 = this.points[1];
            var q = point;
            var k1 = parseFloat(((p2.y - p1.y) / (p2.x - p1.x)).toFixed(3));
            var k2 = parseFloat(((q.y - p1.y) / (q.x - p1.x)).toFixed(3));
            if (!(isNaN(k1) && isNaN(k2))) {
                var error = Math.abs(k2 - k1);
                if (error > 0.000001) {
                    return false;
                }
            }
            var minX = Math.min(p1.x, p2.x);
            var maxX = Math.max(p1.x, p2.x);
            var minY = Math.min(p1.y, p2.y);
            var maxY = Math.max(p1.y, p2.y);
            return minX <= point.x && point.x <= maxX && minY <= point.y && point.y <= maxY;
        };
        Segment.prototype.getCrossStateWithSegment = function (segment) {
            if (!this.isCrossedBySegment(segment)) {
                return SegmentCrossState.None;
            }
            else {
                if (this.isParallelWith(segment)) {
                    var a = segment.points[0];
                    var b = segment.points[1];
                    var c = this.points[0];
                    var d = this.points[1];
                    var ab = segment;
                    var cd = this;
                    if (a.equalsTo(c) && !cd.isPointInSegment(b) && !ab.isPointInSegment(d)
                        || b.equalsTo(c) && !cd.isPointInSegment(a) && !ab.isPointInSegment(d)
                        || a.equalsTo(d) && !cd.isPointInSegment(b) && !ab.isPointInSegment(c)
                        || b.equalsTo(d) && !cd.isPointInSegment(a) && !ab.isPointInSegment(c)
                        || c.equalsTo(a) && !ab.isPointInSegment(d) && !cd.isPointInSegment(b)
                        || d.equalsTo(a) && !ab.isPointInSegment(c) && !cd.isPointInSegment(b)
                        || c.equalsTo(b) && !ab.isPointInSegment(d) && !cd.isPointInSegment(a)
                        || d.equalsTo(b) && !ab.isPointInSegment(c) && !cd.isPointInSegment(a)) {
                        return SegmentCrossState.Single;
                    }
                    else if (ab.isPointInSegment(c)
                        || ab.isPointInSegment(d)
                        || cd.isPointInSegment(a)
                        || cd.isPointInSegment(b)) {
                        return SegmentCrossState.Infinite;
                    }
                    else {
                        return SegmentCrossState.None;
                    }
                }
                else {
                    return SegmentCrossState.Single;
                }
            }
        };
        Segment.prototype.getSlope = function () {
            var p1 = this.points[0];
            var p2 = this.points[1];
            var ret = (p1.y - p2.y) / (p1.x - p2.x);
            if (isNaN(ret)) {
                return null;
            }
            else {
                return ret;
            }
        };
        Segment.prototype.isParallelWith = function (segment) {
            return this.getSlope() == segment.getSlope();
        };
        Segment.prototype.getCrossedPointWithSegment = function (segment) {
            var a = this.points[0];
            var b = this.points[1];
            var c = segment.points[0];
            var d = segment.points[1];
            var denominator = (b.y - a.y) * (d.x - c.x) - (a.x - b.x) * (c.y - d.y);
            if (denominator == 0) {
                return null;
            }
            var x = ((b.x - a.x) * (d.x - c.x) * (c.y - a.y)
                + (b.y - a.y) * (d.x - c.x) * a.x
                - (d.y - c.y) * (b.x - a.x) * c.x) / denominator;
            var y = -((b.y - a.y) * (d.y - c.y) * (c.x - a.x)
                + (b.x - a.x) * (d.y - c.y) * a.y
                - (d.x - c.x) * (b.y - a.y) * c.y) / denominator;
            if ((x - a.x) * (x - b.x) <= 0 && (y - a.y) * (y - b.y) <= 0
                && (x - c.x) * (x - d.x) <= 0 && (y - c.y) * (y - d.y) <= 0) {
                return new Point(x, y);
            }
            return null;
        };
        Segment.prototype.isCrossedBySegment = function (segment) {
            var x1 = this.points[0].x, y1 = this.points[0].y, x2 = this.points[1].x, y2 = this.points[1].y, x3 = segment.getPoints()[0].x, y3 = segment.getPoints()[0].y, x4 = segment.getPoints()[1].x, y4 = segment.getPoints()[1].y;
            if (!(Math.min(x1, x2) <= Math.max(x3, x4) && Math.min(y3, y4) <= Math.max(y1, y2) && Math.min(x3, x4) <= Math.max(x1, x2) && Math.min(y1, y2) <= Math.max(y3, y4)))
                return false;
            var u, v, w, z;
            u = (x3 - x1) * (y2 - y1) - (x2 - x1) * (y3 - y1);
            v = (x4 - x1) * (y2 - y1) - (x2 - x1) * (y4 - y1);
            w = (x1 - x3) * (y4 - y3) - (x4 - x3) * (y1 - y3);
            z = (x2 - x3) * (y4 - y3) - (x4 - x3) * (y2 - y3);
            return (u * v <= 0.00000001 && w * z <= 0.00000001);
        };
        Segment.prototype.getDeltaX = function () {
            return [
                Math.min(this.points[0].x, this.points[1].x),
                Math.max(this.points[0].x, this.points[1].x)
            ];
        };
        Segment.prototype.getDeltaY = function () {
            return [
                Math.min(this.points[0].y, this.points[1].y),
                Math.max(this.points[0].y, this.points[1].y)
            ];
        };
        return Segment;
    }(PolylineBase));
    var Anchor = /** @class */ (function () {
        function Anchor(xPercentage, yPercentage, shape) {
            if (shape === void 0) { shape = null; }
            this.xPercentage = xPercentage;
            this.yPercentage = yPercentage;
            this.shape = shape;
        }
        Anchor.prototype.toPoint = function () {
            return new Point(this.shape.points[0].x + this.xPercentage * this.shape.toRectalge().getWidth(), this.shape.points[0].y + this.yPercentage * this.shape.toRectalge().getHeight());
        };
        Anchor.prototype.toPointWithPadding = function (padding) {
            var fakeWidth = this.shape.toRectalge().getWidth() + padding * 2;
            var fakeHeight = this.shape.toRectalge().getHeight() + padding * 2;
            var fakeX = this.shape.points[0].x - padding;
            var fakeY = this.shape.points[0].y - padding;
            return new Point(fakeX + this.xPercentage * fakeWidth, fakeY + this.yPercentage * fakeHeight);
        };
        return Anchor;
    }());
    var Shape = /** @class */ (function (_super) {
        __extends(Shape, _super);
        function Shape(points, guid, drawing) {
            if (guid === void 0) { guid = null; }
            if (drawing === void 0) { drawing = null; }
            var _this = _super.call(this) || this;
            _this.guid = guid;
            _this.drawing = drawing;
            if (points.length < 3) {
                throw 'The point count must larger than 3.';
            }
            for (var i = 0; i < points.length; ++i) {
                _this.points.push(points[i]);
            }
            _this.anchors = [];
            if (_this.drawing) {
                var html = _this.drawing.getHtmlHelper();
                if (html) {
                    html.appendShape(_this);
                }
            }
            return _this;
        }
        Shape.prototype.toRectalge = function (guid) {
            if (guid === void 0) { guid = null; }
            var minX = this.points[0].x;
            var minY = this.points[0].y;
            var maxX = minX;
            var maxY = minY;
            for (var i = 1; i < this.points.length; ++i) {
                var point = this.points[i];
                minX = Math.min(minX, point.x);
                maxX = Math.max(maxX, point.x);
                minY = Math.min(minY, point.y);
                maxY = Math.max(maxY, point.y);
            }
            return new Rectangle(minX, minY, maxX - minX, maxY - minY, guid, this.drawing);
        };
        Shape.prototype.getGuid = function () {
            return this.guid;
        };
        Shape.prototype.getAnchors = function () {
            return this.anchors;
        };
        Shape.prototype.createAnchor = function (xPercentage, yPercentage) {
            var anchor = new Anchor(xPercentage, yPercentage, this);
            this.anchors.push(anchor);
            return anchor;
        };
        Shape.prototype.remove = function () {
            if (!this.drawing) {
                return;
            }
            var html = this.drawing.getHtmlHelper();
            if (!html) {
                return;
            }
            var elements = this.drawing.getShapes();
            var index = elements.indexOf(this);
            if (index < 0) {
                return;
            }
            elements.splice(index, 1);
            html.removeShape(this.guid);
        };
        Shape.prototype.move = function (newTopLeft) {
            var _this = this;
            var rect = this.toRectalge();
            var current = rect.points[0];
            var deltaX = newTopLeft.x - current.x;
            var deltaY = newTopLeft.y - current.y;
            if (this.drawing) {
                // Conflict test
                for (var i = 0; i < rect.points.length; ++i) {
                    rect.points[i].x += deltaX;
                    rect.points[i].y += deltaY;
                }
                if (!this.drawing.isShapeNotConflicted(rect)) {
                    return;
                }
                var points = [];
                for (var i = 0; i < this.points.length; ++i) {
                    var point = new Point(this.points[i].x + deltaX, this.points[i].y + deltaY);
                    points.push(point);
                }
                this.points = points;
                var html = this.drawing.getHtmlHelper();
                if (!html) {
                    return;
                }
                html.updateShape(this);
                var connectPolylines = this.drawing.getConnectPolylines().filter(function (x) { return x.getDepartureAnchor().shape == _this || x.getDestinationAnchor().shape == _this; });
                for (var i = 0; i < connectPolylines.length; ++i) {
                    var cpl = connectPolylines[i];
                    cpl.update();
                }
            }
        };
        Shape.prototype.generateSvg = function () {
            if (!this.points.length || this.drawing && !this.drawing.getConfig().renderShape) {
                return '';
            }
            return "<polyline data-shape=\"".concat(this.getGuid(), "\" points=\"").concat(this.points.map(function (x) { return x.x + ',' + x.y; }).join(' '), " ").concat(this.points[0].x, ",").concat(this.points[0].y, "\"\n    style=\"fill:none;stroke:").concat(this.drawing.getConfig().shapeStrokeColor, ";stroke-width:").concat(this.drawing.getConfig().shapeStrokeWidth, "\"/>");
        };
        return Shape;
    }(PolylineBase));
    var Rectangle = /** @class */ (function (_super) {
        __extends(Rectangle, _super);
        function Rectangle(x, y, width, height, guid, drawing) {
            if (guid === void 0) { guid = null; }
            if (drawing === void 0) { drawing = null; }
            var _this = this;
            var points = [];
            points.push(new Point(x, y));
            points.push(new Point(x + width, y));
            points.push(new Point(x + width, y + height));
            points.push(new Point(x, y + height));
            _this = _super.call(this, points, guid, drawing) || this;
            _this.anchors = [];
            _this.guid = guid;
            _this.drawing = drawing;
            if (width == 0 || height == 0) {
                throw 'The width and height cannot be zero';
            }
            _this.width = width;
            _this.height = height;
            return _this;
        }
        Rectangle.prototype.getWidth = function () {
            return this.width;
        };
        Rectangle.prototype.getHeight = function () {
            return this.height;
        };
        Rectangle.prototype.cloneAndExpand = function (padding) {
            var fakeWidth = this.getWidth() + padding * 2;
            var fakeHeight = this.getHeight() + padding * 2;
            var fakeX = this.points[0].x - padding;
            var fakeY = this.points[0].y - padding;
            return new Rectangle(fakeX, fakeY, fakeWidth, fakeHeight, this.guid, this.drawing);
        };
        return Rectangle;
    }(Shape));
    var AnchorModel = /** @class */ (function () {
        function AnchorModel() {
        }
        return AnchorModel;
    }());
    var ConnectPolylineModel = /** @class */ (function () {
        function ConnectPolylineModel() {
        }
        return ConnectPolylineModel;
    }());
    var DrawingModel = /** @class */ (function () {
        function DrawingModel() {
        }
        return DrawingModel;
    }());
    var PointModel = /** @class */ (function () {
        function PointModel() {
        }
        return PointModel;
    }());
    var ShapeModel = /** @class */ (function () {
        function ShapeModel() {
        }
        return ShapeModel;
    }());
    // Models
    exports.DrawingModel = DrawingModel;
    exports.ShapeModel = ShapeModel;
    exports.ConnectPolylineModel = ConnectPolylineModel;
    exports.AnchorModel = AnchorModel;
    exports.PointModel = PointModel;
    // Entities
    exports.Drawing = Drawing;
    exports.Shape = Shape;
    exports.ConnectPolyline = ConnectPolyline;
    exports.Polyline = Polyline;
    exports.Point = Point;
    exports.ExtremePoint = ExtremePoint;
    exports.DrawingConfiguration = DrawingConfiguration;
    // Helpers
    exports.Orientation = Orientation;
    var _window = eval('window');
    if (_window) {
        _window.PomeloWF = exports;
    }
    return exports;
})({});
