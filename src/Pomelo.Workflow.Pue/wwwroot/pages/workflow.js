var lifecycleManager = require('/components/pomelo-workflow/lifecycleManager').lifecycleManager;

Page({
    components: ['/components/pomelo-workflow/drawing'],
    style: true,
    data() {
        return {
            active: 'design',
            json: '',
        }
    },
    created() {
    },
    mounted() {
    },
    methods: {
        add(node, width, height) {
            lifecycleManager.getById('drawing').addNode = { key: node, width: width, height: height };
            lifecycleManager.getById('drawing').mode = 'add';
        }
    }
});