var lifecycleManager = require('/components/pomelo-workflow/lifecycleManager').lifecycleManager;

Page({
    components: ['/components/pomelo-workflow/index'],
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
            lifecycleManager.getById('diagram').addNode = { key: node, width: width, height: height };
            lifecycleManager.getById('diagram').mode = 'add';
        }
    }
});