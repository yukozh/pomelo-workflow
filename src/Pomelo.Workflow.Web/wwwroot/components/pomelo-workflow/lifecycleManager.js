function createManager() {
    var dic = {};
    return {
        register(id, item) {
            dic[id] = item;
        },
        unregister(id) {
            delete dic[id];
        },
        getById(id) {
            return dic[id];
        }
    };
}

exports.lifecycleManager = createManager();