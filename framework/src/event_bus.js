import { effect, signal } from "./reactivity";

class EventBus {
    constructor() {
        this.events = new Map();
        this.elementListeners = new WeakMap();
    }

    getSignal(eventName) {
        if (!this.events.get(eventName)) {
            this.events.set(eventName, signal(undefined))
        }
        return this.events.get(eventName)
    }

    on(eventName, handler, el = null) {
        const sig = this.getSignal(eventName)

        const cleanupFn = effect(() => {
            const value = sig()
            if (value !== undefined) handler()
        })

        if (el) {
            if (!this.elementListeners.has(el)) {
                this.elementListeners.set(el, [])
            }
            this.elementListeners.get(el).push(cleanupFn)
        }

        return cleanupFn
    }

    emit(eventName, data) {
        const sig = this.getSignal(eventName).set(data)
    }

    cleanUp(el) {
        const listeners = this.elementListeners.get(el)
        if (!listeners) return

        listeners.forEach(cleanupFn, () => { cleanupFn })
        this.elementListeners.delete(el)
    }
}

export const eventBus = new EventBus()