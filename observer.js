
//import Dep from './dep.js'

class Observer{
    constructor(){}
    observe(vm, data){
        if(!data || typeof data !== 'object'){
            return;
        }
        //遍历该对象
        Object.keys(data).forEach( key => {
            this.defineReactive(data, key, data[key]);
            //代理data中的属性到vue的实例上
            this.proxyData(vm, data, key);
        });
    }
    //数据响应式
    defineReactive(data, key, value){
        //递归嵌套数据
        this.observe(value);

        //
        const dep = new Dep();

        Object.defineProperty(data, key, {
            configurable:true,
            enumerable:true,
            get(){

                //一个hack
                //在getter中，所以数据被读取一次，才会执行，添加依赖
                Dep.target && dep.addDep(Dep.target);

                return value;
            },
            set(newValue){
                if(value !== newValue){
                    value = newValue;
                }
                //0
                //console.log(`${key}属性更新了：${value}`);
                dep.notify();               
            }
        })
    }
    //代理data中的属性到vue的实例
    proxyData(vm, data, key){
        Object.defineProperty(vm, key, {
            get(){
                return vm.$data[key];
            },
            set(newValue){
                vm.$data[key] = newValue;   //会触发defineReactive中的setter
            }
        });
    }
}