var lifecycleManager = require('/components/pomelo-workflow/lifecycleManager').lifecycleManager;

Page({
    layout: '/shared/layout',
    components: ['/components/pomelo-workflow/index'],
    style: true,
    data() {
        return {
            id: null,
            workflow: null,
            instance: null
        }
    },
    async created() {
        var workflows = await Pomelo.CQ.Get(`/api/workflow`);
        this.workflow = workflows[0];
        this.instance = await Pomelo.CQ.Get(`/api/workflow/${this.workflow.id}/instance/${this.id}/diagram`);
    },
    mounted() {
        this.$root.active = 'instances';
    },
    methods: {
    }
});