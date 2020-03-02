class Observer {
    constructor(data) {
        // set get
        if (data && typeof data === 'object') this.observer(data);
        // 数据劫持
        else return;
    }
    observer(data) {
        Object.keys(data).forEach(key => {
            this.defineReactive(data, key, data[key]);
            if (typeof data[key] === 'object') this.observer(data[key]);
        });
    }
    defineReactive(obj, key, value) {
        let _this = this;
        let dep = new Dep();
        Object.defineProperty(obj, key, {
            // enumerable: true, // 可枚举
            // configurable: true, // 可删除
            // writable: true,   // 可写
            get() {
                Dep.target && dep.addSubs(Dep.target);
                return value;
            },
            set(newValue) {
                if (value !== newValue) {
                    typeof newValue === 'object' && _this.observer(newValue); // 如果是对象，继续劫持
                    value = newValue;
                    dep.notify();
                }
            }
        });
    } // 定义响应式
}
class Dep {
    constructor() {
        this.subs = [];
    }
    addSubs(watcher) {
        this.subs.push(watcher);
    }
    notify() {
        this.subs.forEach(watcher => watcher.update());
    }
}
