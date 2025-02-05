Page({
    layout: '/shared/layout',
    style: true,
    data() {
        return {
            approvals: []
        }
    },
    async created() {
        await this.getApprovals();
    },
    mounted() {
        this.$root.active = 'approvals';
    },
    methods: {
        async getApprovals() {
            this.approvals = await Pomelo.CQ.Get(`/api/approval`);
        },
        async approve(approval) {
            await Pomelo.CQ.Patch(`/api/approval/${approval.id}`, { status: 'Approved' });
            await this.getApprovals();
        },
        async reject(approval) {
            await Pomelo.CQ.Patch(`/api/approval/${approval.id}`, { status: 'Rejected' });
            await this.getApprovals();
        }
    }
});