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
        this.drawing = new PomeloWF.Drawing(new PomeloWF.DrawingConfiguration());
    },
    mounted() {
        this.drawing.mount('#drawing');
    }
});