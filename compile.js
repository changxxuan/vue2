class Compile {

    //new Compile(el, vm)
    constructor(el, vm){
        //要遍历的宿主节点
        this.$el = document.querySelector(el);
        this.$vm = vm;

        //编译
        if(this.$el){
            //转换节点DOM为片段
            this.$fragment = this.nodeToFragment(this.$el);
            //执行编译过程
            this.compile(this.$fragment);
            //将编译完的结果追加到$el
            this.$el.appendChild(this.$fragment);
        }
    }
    //遍历宿主元素代码片段，这是一个曲线救国的做法
    nodeToFragment(el){
        const fragment = document.createDocumentFragment();
        //将el中使用子元素搬家至fragment中
        let child;
        while(child = el.firstChild){
            fragment.appendChild(child)
        }
        return fragment;
    }
    compile(el){
        const childNodes = el.childNodes;
        Array.from(childNodes).forEach(node => {
            //类型判断
            if(this.isElement(node)){
                //console.log('编译元素：' + node.nodeName);
                //查找v-，@，：。。。
                const nodeAttrs = node.attributes;
                Array.from(nodeAttrs).forEach(attr => {
                    const attrName = attr.name;  //属性名
                    const exp = attr.value; //属性值
                    if(this.isDirective(attrName)){
                        //v-
                        const dir = attrName.substring(2);
                        //执行指令
                        this[dir] && this[dir](node, this.$vm, exp);
                    }else if(this.isEvent(attrName)){
                        //@click
                        const dir = attrName.substring(1);
                        this.eventHandler(node, this.$vm, exp, dir);
                    }
                });
            }else if(this.isInterpolation(node)){
                //console.log('编译文本：' + node.textContent);
                this.compileText(node);
            }

            //递归编译子节点
            if(node.childNodes && node.childNodes.length > 0){
                this.compile(node);
            }
        });
    }

    //元素
    isElement(node){
        return node.nodeType === 1;
    }
    //指令
    isDirective(attr){
        return attr.indexOf('v-') === 0
    }
    //事件
    isEvent(attr){
        return attr.indexOf('@') === 0
    }
    //事件处理器
    eventHandler(node, vm, exp, dir){
        //@click = 'onClick'
        const fn = vm.$options.methods && vm.$options.methods[exp];
        if(dir && fn){
            node.addEventListener(dir, fn.bind(vm))
        }
    }
    //插值文本
    isInterpolation(node){
        return node.nodeType === 3 && /(\{\{\s*(\S+)\s*\}\})/g.test(node.textContent);
    }
    compileText(node){
        //node.textContent = this.$vm.$data[RegExp.$1];
        this.update(node, this.$vm, RegExp.$1, 'text');
    }

    //更新函数
    //节点，Vue实例,表达式，指令（文本，事件，。。。）
    update(node, vm, exp, dir){
        const updaterFn = this[dir + 'Updater'];
        let expression;
        const getValue = function(vm){          
            if(/(\{\{\s*(\S+)\s*\}\})/g.test(node.textContent)){               
                expression = RegExp.$2;                
            }else{
                expression = exp;   
            }
            let arr = expression.split('.'); 
            if(arr.length > 1){
                let str = JSON.parse(JSON.stringify(vm.$data));
                arr.forEach(key => {
                    str = str[key];
                });
                return str;               
            }else{
                return vm[expression];
            }
            
        }
        //初始化
        //updaterFn && updaterFn(node, vm.$data[exp]);
        //updaterFn && updaterFn(node, vm[exp]);
        updaterFn && updaterFn(node, vm, exp, getValue);
        //依赖收集
        //更新时存在重复实例化的问题，考虑改进
        new Watcher(vm, expression, function(value){
            updaterFn && updaterFn(node, value);
        });
    } 
    text(node, vm, exp){
        this.update(node, vm, exp, 'text');
    }
    // textUpdater(node, value){
    //     node.textContent = value;
    // }
    textUpdater(node, vm, exp, getValue){
        if(arguments.length === 4 && getValue){
            const str = getValue(vm);
            //判断v-text指令还是插值
            node.textContent = node.textContent.indexOf(exp) > -1? node.textContent.replace(exp, str) : str;
        }else if(arguments.length === 2){
            node.textContent = arguments[1];
            //不能全部替换，最好是前期存下来节点插值文本之外的数据 ????
        }
    }
    html(node, vm, exp){
        this.update(node, vm, exp, 'html');
    }
    // htmlUpdater(node, value){
    //     node.innerHTML = value;
    // }
    htmlUpdater(node, vm, exp, getValue){
        const value = getValue(vm);
        node.innerHTML = value;
    }
    //双向绑定
    model(node, vm, exp){
        //指定input的value属性（即模型到视图的绑定）
        this.update(node, vm, exp, 'model');
        //视图到模型的绑定
        node.addEventListener('input', e => {
            vm[exp] = e.target.value;
        });
    }
    // modelUpdater(node, value){
    //     node.value = value;
    // }
    modelUpdater(node, vm, exp, getValue){
        let value;
        if(arguments.length === 4 && getValue){
            value = getValue(vm);
        }else{
            value = arguments[1];
        }
        node.value = value;
    }
}