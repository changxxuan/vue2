// 'use strict'
//import Observer from './observer.js'
// import Compile from './compile.js'

class Vue{

    //new Vue({data:{...}})
    constructor(options){
        this.$options = options;
        this.$el = options.el;
        //数据响应式
        this.$data = options.data;
        let observer = new Observer();
        observer.observe(this, this.$data);

        new Compile(this.$el, this);

        //create执行
        if(this.$options.created){
            this.$options.created.call(this);
        }
    }
    
}
