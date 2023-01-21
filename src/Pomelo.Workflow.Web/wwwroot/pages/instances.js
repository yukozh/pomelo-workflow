Page({
    layout: '/shared/layout',
    style: true,
    data() {
        return {
            instances: []
        }
    },
    async created() {
        var workflows = await Pomelo.CQ.Get(`/api/workflow`);
        var workflow = workflows[0];
        this.instances = await Pomelo.CQ.Get(`/api/workflow/${workflow.id}/instance`);
    },
    mounted() {
        this.$root.active = 'instances';
    },
    methods: {
    }
});