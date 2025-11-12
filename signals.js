
export function signal(v) {
    const subscriptions = new Set()
    return {
        get value() {
            return v
        },
        set value(newValue) {
            v = newValue
            subscriptions.forEach((fn) => fn(newValue))
        },
        register(subscriber) {
            subscriptions.add(subscriber)
        }
    }
}

export function effect(fn, sig) {
    sig.register(fn)
    fn()
}

const count = state(0);


effect(() => {
    elm.textContent = count.value
}, count)