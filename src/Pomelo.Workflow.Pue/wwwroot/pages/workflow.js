Page({
    modules: [
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
        this.drawing = new PomeloWF.Drawing(new PomeloWF.DrawingConfiguration());
    },
    mounted() {
        document.getElementById('drawing').innerHTML = this.drawing.generateSvg();
    }
});