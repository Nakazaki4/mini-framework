export function observable(value) {
    const subscribers = new Set();

    return {
        increment() {
            value++
            this.update(value)
        },
        subscribe(func) {
            subscribers.add(func)
        },
        update(value) {
            subscribers.forEach((s) => { s(value) })
        },
        unsubscribe(func) {
            subscribers.delete(func)
        }
    }
}