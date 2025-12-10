class EventBus {
    constructor() {
        this.events = new Map();
        this.elementListeners = new WeakMap();
    }

    on(eventName, handler, el = null) {
        if (!this.events.has(eventName)) {
            this.events.set(eventName, new Set())
        }
        this.events.get(eventName).add(handler)

        if (el) {
            if (!this.elementListeners.has(element)) {
                this.elementListeners.set(element, [])
            }
            this.elementListeners.get(element).push({ eventName, handler })
        }

        return () => {
            this.elementListeners.get(element).delete(handler)
        }
    }

    emit(eventName, data) {
        const handlers = this.events.get(eventName)
        if (handlers) {
            handlers.forEach(fn, () => { fn(data) })
        }
    }

    cleanUp(element) {
        const listeners = this.elementListeners.get(element)
        if (listeners) {
            listeners.forEach({ eventName, handler }, () => {
                this.events.get(eventName).delete(handler)
            })
            this.elementListeners.delete(element)
        }
    }
}
export const eventBus = new EventBus()