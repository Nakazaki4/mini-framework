import { effect, signal } from "./reactivity.js";

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
        const [sig, setSig] = this.getSignal(eventName)

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
        const [sig, setSig] = this.getSignal(eventName)
        setSig(data)
    }

    cleanUp(el) {
        const listeners = this.elementListeners.get(el)
        if (!listeners) return

        listeners.forEach(cleanupFn => cleanupFn())
        this.elementListeners.delete(el)
    }
}

export const eventBus = new EventBus()