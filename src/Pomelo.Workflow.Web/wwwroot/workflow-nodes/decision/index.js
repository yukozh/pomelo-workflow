Component('decision', {
    style: true,
    props: ['shape', 'arguments'],
    data() {
        return {
        };
    },
    computed: {
        active() {
            return this.$parent.active == this.shape;
        }
    },
    created() {
        if (this.shape.anchors.length == 0) {
            this.shape.createAnchor(.5, 0);
            this.shape.createAnchor(1, .5);
            this.shape.createAnchor(.5, 1);
            this.shape.createAnchor(0, .5);
        }
    },
    methods: {
        onClicked() {
            if (!this.$parent.edit) {
                return;
            }

            this.$parent.active = this.shape;
        },
        link(anchor) {
            if (this.$parent.isDeparture()) {
                var polylines = this.shape.getOutgoingConnectedPolylines();
                if (polylines.some(x => x.getType() == 'yes') && polylines.some(x => x.getType() == 'no')) {
                    alert('Cannot create more connections');
                    this.$parent.cancelOperations();
                    return;
                }

                if (!polylines.some(x => x.getType() == 'yes')) {
                    this.$parent.link(anchor, '#1ca725', 'yes');
                } else {
                    this.$parent.link(anchor, '#d81e06', 'no');
                }
            } else {
                this.$parent.link(anchor);
            }
        }
    }
});