var lifecycleManager = require('/components/pomelo-workflow/lifecycleManager').lifecycleManager;

Page({
    layout: '/shared/layout',
    components: ['/components/pomelo-workflow/index'],
    style: true,
    data() {
        return {
            workflow: null,
            workflowVersion: null
        }
    },
    async created() {
        var workflows = await Pomelo.CQ.Get(`/api/workflow`);
        this.workflow = workflows[0];
        var versions = await Pomelo.CQ.Get(`/api/workflow/${this.workflow.id}/version`);
        this.workflowVersion = await Pomelo.CQ.Get(`/api/workflow/${this.workflow.id}/version/${versions[versions.length - 1].version}`);
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