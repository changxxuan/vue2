class Dep {
    constructor(){
        //存放依赖
        this.deps = [];
    }
    addDep(dep){
        this.deps.push(dep);
    }
    notify(){
        //通知所有依赖更新
        this.deps.forEach(dep => {
            console.log(`${dep.key} 依赖更新了`);
            dep.update();
        });
    }
}