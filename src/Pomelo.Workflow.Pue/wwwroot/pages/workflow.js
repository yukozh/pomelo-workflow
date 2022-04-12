Page({
    modules: [
        '/assets/js/pomelo.workflow.vue.js',
        '/assets/js/pomelo.workflow.core.js'
    ],
    data() {
        return {
            active: 'design',
            json: '',
            drawing: null
        }
    },
    created() {
        var config = new PomeloWF.DrawingConfiguration();
        config.renderShape = false;
        config.shapeStrokeWidth = 2;
        this.drawing = new PomeloWF.Drawing(config);
    },
    mounted() {
        this.drawing.mount('#drawing');
    }
});