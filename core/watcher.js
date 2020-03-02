class Watcher {
    constructor(vm, expr, cb) {
        this.vm = vm;
        this.expr = expr;
        this.cb = cb;

        Dep.target = this;
        this.value = this.get();
        Dep.target = null;
    }
    getVal(vm, expr) {
        expr = expr.trim().split('.');
        return expr.reduce((prev, next) => {
            return prev[next];
        }, vm.$data)
    }
    get() {
        let value = this.getVal(this.vm, this.expr);
        return value;
    }
    // 新旧值比较，调用更新方法
    update() {
        let newValue = this.get();
        let oldValue = this.value;
        if (newValue !== oldValue) {
            this.cb(newValue, oldValue); // 调用watch的cb
            this.value = newValue;
        }
    }
}
