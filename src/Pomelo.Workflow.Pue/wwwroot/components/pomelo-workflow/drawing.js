var lifecycleManager = require('./lifecycleManager').lifecycleManager;
var pomeloWf = require('./pomelo-workflow/pomelo.workflow');
var rand = require('./rand').rand;
var pomeloWfConfig = require('/assets/js/pomelo-wf.config');

var components = '';
var component = '<{COMPONENT_NAME} class="pomelo-wf-node" v-if="shape.viewName == \'{COMPONENT_NAME}\'" v-bind:arguments=\'shape.arguments\' v-bind:shape=\'shape\' draggable=\"true\" @dragstart="onDragStart($event, shape)" @dragend="onDragEnd($event, shape)" \/>';
for (var i = 0; i < pomeloWfConfig.nodes.length; ++i) {
    components += component.replaceAll('{COMPONENT_NAME}', pomeloWfConfig.nodes[i].key);
}
var template = '<div v-on:click=\"onClicked\" v-bind:id=\"id\">\r\n    <div class=\"pomelo-wf-drawing\" v-bind:id=\"id + \'-inner\'\">\r\n        <svg v-if=\"drawing\" v-bind:width=\"width" v-bind:height=\"height\" v-bind:data-drawing=\"drawing.getGuid()\" version=\"1.1\"\r\n             xmlns=\"http:\/\/www.w3.org\/2000\/svg\">\r\n            <!-- Connected Polylines -->\r\n            <polyline v-for=\"polyline in drawing.getConnectPolylines()\"\r\n                      v-bind:data-polyline=\"polyline.getGuid()\" v-bind:points=\"polyline.path.points.map(x => x.x + \',\' + x.y).join(\' \')\"\r\n                      v-bind:style=\"`fill:none;stroke:${polyline.getColor()};stroke-width:${drawing.getConfig().connectPolylineStrokeWidth}`\" \/>\r\n\r\n            <!-- Shapes -->\r\n            <polyline v-for=\"shape in drawing.getShapes()\" v-if=\"drawing.getConfig().renderShape\"\r\n                      v-bind:data-shape=\"shape.getGuid()\" v-bind:points=\"`${shape.points.map(x => x.x + \',\' + x.y).join(\' \')} ${shape.points[0].x},${shape.points[0].y}`\"\r\n                      v-bind:style=\"`fill:none;stroke:${drawing.getConfig().shapeStrokeColor};stroke-width:${shape.drawing.getConfig().shapeStrokeWidth}`\" \/>\r\n        <\/svg>\r\n    <\/div>\r\n    <div class=\"pomelo-wf-elements\">\r\n        <div v-for=\"shape in drawing.getShapes()\"\r\n             v-bind:id=\"shape.getGuid()\"\r\n             v-bind:style=\"`position: absolute; top: ${shape.points[0].y}px; left: ${shape.points[0].x}px; width:${shape.width}px; height:${shape.height}px;`\">\r\n            {COMPONENTS}\r\n        <\/div>\r\n    <\/div>\r\n<\/div>';
template = template.replaceAll('{COMPONENTS}', components);

Component('pomelo-workflow', {
    style: true,
    template: template,
    components: pomeloWfConfig.nodes.map(x => x.path),
    props: ['config', 'id'],
    data() {
        return {
            config: null,
            drawing: null,
            id: null,
            active: null,
            mode: 'view',
            dragStart: null,
            addNode: null
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
            this.config = new pomeloWf.DrawingConfiguration();
            this.config.renderShape = false;
            this.config.shapeStrokeWidth = 2;
            this.config.connectPolylineStrokeWidth = 2;
            this.config.padding = 10;
        }
        this.drawing = new pomeloWf.Drawing(this.config);
        lifecycleManager.register(this.id, this);
    },
    computed: {
        width() {
            if (this.drawing) {
                var border = this.drawing.getBorder();
                if (border && border.length == 2) {
                    return border[1].x + 50;
                }
            }

            return 800;
        },
        height() {
            if (this.drawing) {
                var border = this.drawing.getBorder();
                if (border && border.length == 2) {
                    return border[1].y + 50;
                }
            }

            return 600;
        }
    },
    mounted() {
        window.drawing = this;
    },
    unmounted() {
        lifecycleManager.unregister(this.id);
    },
    methods: {
        onClicked(e) {
            console.log(e.target);
            if (this.mode == 'add') {
                var base = document.querySelector('#' + this.id);
                var rect = base.getBoundingClientRect();

                var position = { x: e.x - rect.left, y: e.y - rect.top };
                let shape1 = this.drawing.createRect(position.x, position.y, this.addNode.width, this.addNode.height);
                shape1.viewName = this.addNode.key;

                this.mode = 'view';
            }
        },
        onDragStart(e, shape) {
            if (shape.getGuid() != this.active) {
                e.preventDefault();
            }
            this.dragStart = { x: e.x, y: e.y };
        },
        onDragEnd(e, shape) {
            var offset = { x: e.x - this.dragStart.x, y: e.y - this.dragStart.y };
            shape.move({ x: shape.points[0].x + offset.x, y: shape.points[0].y + offset.y });
        }
    }
});