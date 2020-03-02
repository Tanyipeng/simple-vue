class Compile {
    constructor(el, vm) {
        this.el = this.isElementNode(el) ? el : document.querySelector(el);
        this.vm = vm;
        if (this.el) {
            // 能获取到元素才能编译
            // 1.将真实的DOM放入内存中 fragment
            this.fragment = this.nodeToFragment(this.el);
            // 2.编译 =》 提取想要的元素节点和文本节点
            this.compile(this.fragment);
            this.el.appendChild(this.fragment);
            // 把编译好的fragment塞进内存
        }
    }
    isElementNode(node) {
        return node.nodeType === 1;
    }
    nodeToFragment(node) {
        let fragment = document.createDocumentFragment();
        let firstChild;
        while ((firstChild = node.firstChild)) {
            fragment.appendChild(firstChild);
        }
        return fragment;
    }
    compile(fragment) {
        // 递归，如果是元素节点，继续查找
        let childNodes = fragment.childNodes;
        Array.from(childNodes).forEach(node => {
            if (this.isElementNode(node)) {
                // 是元素节点
                // console.log(node);
                // 编译元素
                this.compileElement(node);
                // 递归查找元素
                this.compile(node);
            } else {
                // 是文本节点
                // console.log(node);
                // 编译文本
                this.compileText(node);
            }
        });
    }
    isDerective(name) {
        // 是不是指令
        return /^v-/.test(name);
    }
    compileElement(node) {
        // 带 v-
        // 循环所有属性
        let attrs = node.attributes;
        // console.log(attrs);
        Array.from(attrs).forEach(attr => {
            // name value
            // console.log(attr.name);
            // 判断包含v-
            let bool = this.isDerective(attr.name);
            if (bool) {
                // 取值
                let expr = attr.value;
                // node this.vm.$data expr
                let [, type] = attr.name.split('-');
                compileUtils[type](node, this.vm, expr);
            }
        });
    }
    compileText(node) {
        // 带 {{}}
        let text = node.textContent; // 取文本内容
        // console.log(text);
        let reg = /\{\{([^}]+)\}\}/g;
        if (reg.test(text)) {
            // node this.vm.$data text
            compileUtils['text'](node, this.vm, text);
        }
    }
}
let compileUtils = {
    getVal(vm, expr) {
        expr = expr.trim().split('.'); //[a,b,c,d]...
        return expr.reduce((prev, next) => {
            return prev[next];
        }, vm.$data); // 找data上的属性
    },
    getTextVal(vm, expr) {
        return expr.replace(/\{\{([^}]+)\}\}/g, (...arguments) => {
            return this.getVal(vm, arguments[1]);
        }); // 去掉{{}}
        // return this.getVal(vm, value);
    },
    setVal(vm, expr, value) {
        expr = expr.split('.');
        return expr.reduce((prev, next, currentIndex, self) => {
            if (currentIndex === self.length - 1) {
                return prev[next] = value;
            }
            return prev[next];
        }, vm.$data)
    },
    text(node, vm, expr) {
        // 文本处理 {{ message.a }}
        let updateFn = this.updater.textUpdater;
        expr.replace(/\{\{([^}]+)\}\}/g, (...arguments) => {
            return new Watcher(vm, arguments[1], (newValue) => {
                updateFn && updateFn(node, newValue);
            });
        });
        updateFn && updateFn(node, this.getTextVal(vm, expr));
    },
    model(node, vm, expr) {
        // 输入框处理
        let updateFn = this.updater.modelUpdater;
        // 加一个监控，数据变化就调用watch的cb
        new Watcher(vm, expr, (newValue) => {
            updateFn && updateFn(node, newValue);
        })
        node.addEventListener('input', (e) => {
            let newValue = e.target.value;
            this.setVal(vm, expr, newValue);
        })
        updateFn && updateFn(node, this.getVal(vm, expr));
    },
    updater: {
        textUpdater(node, value) {
            node.textContent = value;
        },
        modelUpdater(node, value) {
            node.value = value;
        }
    }
};
