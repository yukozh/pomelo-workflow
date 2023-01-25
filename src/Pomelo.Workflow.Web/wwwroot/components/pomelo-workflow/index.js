var lifecycleManager = require('./lifecycleManager').lifecycleManager;
var pomeloWf = require('./pomelo-workflow-core/pomelo.workflow');
var rand = require('./rand').rand;
var pomeloWfConfig = require('/assets/js/pomelo-wf.config');

var components = '';
var component = '<{COMPONENT_NAME} class="pomelo-wf-node" v-if="shape.node == \'{COMPONENT_NAME}\'" v-bind:arguments=\'shape.arguments\' v-model:shape=\'shape\' draggable=\"true\" @dragstart="onDragStart($event, shape)" @dragend="onDragEnd($event, shape)" \/>';
for (var i = 0; i < pomeloWfConfig.nodes.length; ++i) {
    components += component.replaceAll('{COMPONENT_NAME}', pomeloWfConfig.nodes[i].key);
}
var template = '<div v-on:click=\"onClicked\" v-bind:class=\"{ adding: isAdding() }\" class=\"pomelo-wf-container\" v-bind:id=\"id\">\r\n    <div class=\"pomelo-wf-diagram\" v-bind:id=\"id + \'-inner\'\">\r\n        <svg v-if=\"diagram\" v-bind:width=\"width\" v-bind:height=\"height\" v-bind:data-diagram=\"diagram.getGuid()\" style=\"pointer-events: all;\" version=\"1.1\"\r\n             xmlns=\"http:\/\/www.w3.org\/2000\/svg\">\r\n            <!-- Connected Polylines -->\r\n            <polyline v-on:mouseover=\"onPolylineMouseOver($event, polyline)\" v-on:mouseout=\"onPolylineMouseOut($event, polyline)\" @click=\"onPolylineClicked($event, polyline)\" v-bind:stroke-dasharray=\"(active == polyline || polyline.dashed) ? \'4 2\' : undefined\" v-for=\"polyline in diagram.getConnectPolylines()\"\r\n                      v-bind:data-polyline=\"polyline.getGuid()\" v-bind:points=\"polyline.path.points.map(x => x.x + \',\' + x.y).join(\' \')\"\r\n                      v-bind:style=\"`fill:none;stroke:${polyline.getColor()};stroke-width:${diagram.getConfig().connectPolylineStrokeWidth}`\" \/>\r\n\r\n            <!-- Shapes -->\r\n            <polyline v-for=\"shape in diagram.getShapes()\" v-if=\"diagram.getConfig().renderShape\"\r\n                      v-bind:data-shape=\"shape.getGuid()\" v-bind:points=\"`${shape.points.map(x => x.x + \',\' + x.y).join(\' \')} ${shape.points[0].x},${shape.points[0].y}`\"\r\n                      v-bind:style=\"`fill:none;stroke:${diagram.getConfig().shapeStrokeColor};stroke-width:${shape.diagram.getConfig().shapeStrokeWidth}`\" \/>\r\n            <!-- Connecting -->\r\n            <polyline v-if=\"connectFrom\"\r\n                      stroke-dasharray=\"4 2\"\r\n                      v-bind:points=\"`${connectFrom.toPoint().x},${connectFrom.toPoint().y} ${mousePosition.x},${mousePosition.y}`\"\r\n                      v-bind:style=\"`fill:none;stroke:${connectInfo.color};stroke-width:${diagram.getConfig().shapeStrokeWidth}`\" \/>\r\n        <\/svg>\r\n    <\/div>\r\n    <div class=\"pomelo-wf-suggestion-x\" v-if=\"suggestedX && isAdding()\" v-bind:style=\"`left:${suggestedX - 1 + addNode.width \/ 2.0}px`\"><\/div>\r\n    <div class=\"pomelo-wf-suggestion-y\" v-if=\"suggestedY && isAdding()\" v-bind:style=\"`top:${suggestedY - 1 + addNode.height \/ 2.0}px`\"><\/div>\r\n    <div class=\"pomelo-wf-placeholder\" \r\n        v-if=\"isAdding()\" \r\n        v-bind:style=\"`width: ${addNode.width}px;height:${addNode.height}px;top:${suggestedY || mousePosition.y}px;left:${suggestedX || mousePosition.x}px`\"><\/div>\r\n    <div class=\"pomelo-wf-elements\">\r\n        <div v-for=\"shape in diagram.getShapes()\"\r\n             v-bind:id=\"shape.getGuid()\"\r\n             v-bind:style=\"`position: absolute; top: ${shape.points[0].y}px; left: ${shape.points[0].x}px; width:${shape.width}px; height:${shape.height}px;`\">\r\n            {COMPONENTS}\r\n        <\/div>\r\n    <\/div>\r\n<\/div>';
console.log(template);
template = template.replaceAll('{COMPONENTS}', components);

function isAnchor(el) {
    while (el != null) {
        if (el.hasAttribute('pomelo-wf-anchor')) {
            return true;
        }
        el = el.parentElement;
    }

    return false;
}

Component('pomelo-workflow', {
    style: true,
    template: template,
    components: pomeloWfConfig.nodes.map(x => x.path),
    props: ['config', 'id', 'edit', 'diagramModel'],
    data() {
        return {
            config: null,
            diagram: null,
            id: null,
            active: null,
            mode: 'view',
            dragStart: null,
            addNode: null,
            connectFrom: null,
            mounsePosition: null,
            connectInfo: null,
            suggestedX: null,
            suggestedY: null,
            magnet: true
        };
    },
    created() {
        if (this.$props.id) {
            this.id = this.$props.id;
        } else {
            'pomelo-wf-' + rand()
        }
        if (this.$props.config) {
            this.config = this.$props.config;
        } else {
            this.config = new pomeloWf.DiagramConfiguration();
            this.config.renderShape = false;
            this.config.shapeStrokeWidth = 2;
            this.config.connectPolylineStrokeWidth = 2;
            this.config.padding = 10;
        }
        this.diagram = new pomeloWf.Diagram(this.config);
        var self = this;
        this.$watch(() => ({ ...this.diagram }), function () {
            self.$emit('update:diagramModel', self.diagram.toViewModel());
        }, { deep: true });

        if (this.$props.diagramModel) {
            this.diagram.load(this.$props.diagramModel);
        }

        lifecycleManager.register(this.id, this);
    },
    watch: {
        deep: true,
        '...diagram': function () {
            this.$emit('update:diagramModel', this.diagram.toViewModel());
        }
    },
    computed: {
        width() {
            if (this.diagram) {
                var border = this.diagram.getBorder();
                if (border && border.length == 2) {
                    return border[1].x + 50;
                }
            }

            return 10;
        },
        height() {
            if (this.diagram) {
                var border = this.diagram.getBorder();
                if (border && border.length == 2) {
                    return border[1].y + 50;
                }
            }

            return 10;
        },
        suggestedXAxis() {
            if (!this.diagram) {
                return [];
            }
            console.log(this.diagram.shapes);
            return this.diagram.shapes
                .map(x => x.points[0].x + x.width / 2.0);
        },
        suggestedYAxis() {
            if (!this.diagram) {
                return [];
            }
            console.log(this.diagram.shapes);
            return this.diagram.shapes
                .map(x => x.points[0].y + x.height / 2.0);
        }
    },
    mounted() {
        document.addEventListener('mousemove', this.onMouseMoved);
        document.addEventListener('keyup', this.onKeyUp);
    },
    unmounted() {
        document.removeEventListener('mousemove', this.onMouseMoved);
        document.removeEventListener('keyup', this.onKeyUp);
        lifecycleManager.unregister(this.id);
    },
    methods: {
        onMouseMoved(e) {
            var base = document.querySelector('#' + this.id);
            var rect = base.getBoundingClientRect();
            var scrollTop = base.scrollTop;
            var scrollLeft = base.scrollLeft;
            var position = { x: e.x - rect.left + scrollLeft, y: e.y - rect.top + scrollTop };
            this.mousePosition = position;
            this.suggestedX = this.calculateSuggestedX();
            this.suggestedY = this.calculateSuggestedY();
            this.$forceUpdate();
        },
        onClicked(e) {
            if (!this.edit) {
                return;
            }

            if (this.mode == 'add') {
                var position = { x: this.suggestedX || this.mousePosition.x, y: this.suggestedY || this.mousePosition.y };
                let shape = this.diagram.createRect(position.x, position.y, this.addNode.width, this.addNode.height);
                shape.node = this.addNode.key;
                this.addNode = null;
                this.mode = 'view';
            }
        },
        onDragStart(e, shape) {
            if (!this.edit) {
                return;
            }

            if (shape != this.active) {
                e.preventDefault();
                return;
            }

            if (isAnchor(e.target)) {
                e.preventDefault();
                return;
            }

            this.dragStart = { x: e.x, y: e.y };
        },
        onDragEnd(e, shape) {
            if (!this.edit) {
                return;
            }

            if (isAnchor(e.target)) {
                e.preventDefault();
                return;
            }

            var offset = { x: e.x - this.dragStart.x, y: e.y - this.dragStart.y };
            if (shape.points[0].x + offset.x < this.diagram.getConfig().padding
                || shape.points[0].y + offset.y < this.diagram.getConfig().padding) {
                return;
            }
            shape.move({ x: shape.points[0].x + offset.x, y: shape.points[0].y + offset.y });
            this.dragStart = null;
        },
        link(anchor, color, type, args) {
            color = color || '#56a333';
            type = type || 'default';

            if (this.mode != 'connect') {
                this.mode = 'connect';
                this.connectFrom = anchor;
                this.connectInfo = { color: color, type: type, args: args };
            } else {
                var from = this.connectFrom;
                this.mode = 'view';
                var fromGuid = from.shape.getGuid();
                var indexFrom = from.shape.anchors.indexOf(from);
                var toGuid = anchor.shape.getGuid();
                var indexTo = anchor.shape.anchors.indexOf(anchor);
                this.diagram.createConnectPolyline(fromGuid, indexFrom, toGuid, indexTo, this.connectInfo.color, this.connectInfo.type, this.connectInfo.args);
                this.connectFrom = null;
                this.connectInfo = null;
            }
        },
        onPolylineMouseOver(e, cpl) {
            if (!this.edit) {
                return;
            }

            if (cpl.dashed) {
                return;
            }

            if (e.target.tagName.toUpperCase() == 'POLYLINE') {
                e.target.setAttribute('stroke-dasharray', '4 2');
            }
        },
        onPolylineMouseOut(e, cpl) {
            if (!this.edit) {
                return;
            }

            if (cpl.dashed) {
                return;
            }

            if (e.target.tagName.toUpperCase() == 'POLYLINE') {
                if (this.active != cpl) {
                    e.target.removeAttribute('stroke-dasharray');
                }
            }
        },
        onPolylineClicked(e, cpl) {
            if (!this.edit) {
                return;
            }

            this.active = cpl;
        },
        onKeyUp(e) {
            if (e.key == 'Escape') {
                this.cancelOperations();
                return;
            }

            if (e.key == 'Delete') {
                this.deleteSelectedElement();
                return;
            }
        },
        deleteSelectedElement() {
            if (this.active) {
                this.active.remove();
                this.active = null;
            }
        },
        cancelOperations() {
            this.connectFrom = null;
            this.mousePosition = null;
            this.dragStart = null;
            this.active = null;
            this.connectInfo = null;
            this.mode = 'view';
            this.addNode = null;
        },
        isDeparture() {
            return this.connectFrom == null;
        },
        isDestination() {
            return this.connectFrom != null;
        },
        isAdding() {
            return this.mode == 'add' && this.addNode && this.addNode.key;
        },
        calculateSuggestedX() {
            if (!this.magnet || !this.isAdding()) {
                return null;
            }

            var xCenter = this.addNode.width / 2.0 + this.mousePosition.x;
            var suggestions = this.suggestedXAxis.filter(x => Math.abs(xCenter - x) <= 3);
            if (!suggestions.length) {
                return null;
            } else {
                var suggestion = suggestions[0];
                var ret = this.mousePosition.x + suggestion - xCenter;
                return ret;
            }
        },
        calculateSuggestedY() {
            if (!this.magnet || !this.isAdding()) {
                return null;
            }

            var yCenter = this.addNode.height / 2.0 + this.mousePosition.y;
            var suggestions = this.suggestedYAxis.filter(x => Math.abs(yCenter - x) <= 3);
            if (!suggestions.length) {
                return null;
            } else {
                var suggestion = suggestions[0];
                var ret = this.mousePosition.y + suggestion - yCenter;
                return ret;
            }
        }
    }
});