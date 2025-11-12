export class State {
    constructor(value){
        this._value = value;
        this._subscribers  = new Set();
    }

    get value(){
        return this._value
    }

    set value(newValue){
        this._value = newValue;
        this._subscribers.forEach((subscriber)=>{
            subscriber(newValue);
        })
    }

    subscribe(fn){
        this._subscribers.add(fn)
    }
}