class Watcher {
    constructor(vm, key, cb){
        this.vm = vm;
        this.key = key;
        this.cb = cb;
        //将当前watcher实例，指定到Dep静态属性target
        // 思考：是否会覆盖
        Dep.target = this;

        //触发getter，添加依赖
        this.vm[this.key];

        //置空，避免重复添加
        Dep.target = null;
    }
    update(){
        //思考：不置空时，是否会指向最后一个引用
        //console.log(this.key, Dep.target.key, '属性更新了');
        this.cb.call(this.vm, this.vm[this.key]);    
    }
    getKey(expression){
        let arr = expression.split('.'); 
        if(arr.length > 1){
            arr.forEach(key => {
                str = str[key];
            });
            return str;               
        }else{
            return expression;
        }
    }
}