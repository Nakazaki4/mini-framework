let activeEffect = null;
export function signal(initialValue) {
    let value = initialValue
    const subscribers = new Set()

    function read() {
        if (activeEffect) { subscribers.add(activeEffect) }
        return value
    }

    read.set = (newValue) => {
        value = newValue
        subscribers.forEach((subscriber) => { subscriber() })
    }

    return read
}

export function effect(fn) {
    activeEffect = fn
    fn()
    activeEffect = null
}