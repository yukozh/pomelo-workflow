Component('finish', {
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

            var target = event.target;
            while (target != null) {
                for (var i = 0; i < target.classList.length; ++i) {
                    if (target.classList[0].indexOf('settings') >= 0) {
                        return;
                    }
                }

                target = target.parentElement;
            }

            this.$parent.active = this.shape;
        },
        link(anchor) {
            if (this.$parent.isDeparture()) {
                alert('This node cannot be departure');
                this.$parent.cancelOperations();
            } else {
                this.$parent.link(anchor);
            }
        },
        blur() {
            this.$parent.cancelOperations();
        }
    }
});