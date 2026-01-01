import { delegate } from "./events.js"
import { effect } from "./reactivity.js"

export function el(tag, attributes, ...children) {
    return (
        {
            tag: tag,
            attrs: attributes || {},
            children: children.flat().filter(c => c != null)
        }
    )
}

export function enableAutoCleanup() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.removedNodes.forEach((node) => {
                unmount(node)
            })
        })
    })
    observer.observe(document.body, { childList: true, subtree: true })
}

export function createElement(vnode) {
    if (typeof vnode === 'string' || typeof vnode === 'number') {
        return document.createTextNode(String(vnode))
    }

    if (vnode == undefined || vnode == null) {
        return document.createTextNode('')
    }

    if (typeof vnode == 'function') {
        const textEl = document.createTextNode('')
        textEl._cleanups = []
        const cleanupFn = effect(() => {
            const value = vnode()
            textEl.textContent = value == null ? '' : String(value)
        })
        textEl._cleanups.push(cleanupFn)
        return textEl
    }

    // tag
    if (vnode.tag === 'function') {
        return createElement(vnode.tag(vnode.attrs))
    }

    const el = document.createElement(vnode.tag)
    el._cleanups = []
    el._delayedEvents = []

    // attributes
    if (vnode.attrs) {
        Object.entries(vnode.attrs).forEach(([key, value]) => {
            if (key.startsWith('on:')) {
                const event = key.slice(3)
                el._delayedEvents.push({ event, handler: value, selector: vnode.tag })
                return
            }

            if (typeof value === 'function') {
                const cleanupFn = effect(() => {
                    const actualValue = value()
                    if (key === 'className') {
                        el.className = actualValue
                    } else if (key === 'style' && typeof actualValue === 'object') {
                        Object.assign(el.style, actualValue)
                    } else if (key in el) {
                        el[key] = actualValue
                    } else {
                        el.setAttribute(key, actualValue)
                    }
                })
                el._cleanups.push(cleanupFn)
                return
            }

            if (key === 'className') {
                el[key] = value
            } else if (key === 'style' && typeof value === 'object') {
                Object.assign(el.style, value)
            } else if (key in el) {
                el[key] = value
            } else {
                el.setAttribute(key, value)
            }
        })
    }


    // Children
    if (Array.isArray(vnode.children)) {
        vnode.children.forEach(child => {
            if (!child) return

            if (typeof child === 'function') {
                const keyToElement = new Map()

                const cleanupFn = effect(() => {
                    const value = child()
                    if (!Array.isArray(value)) {
                        el.textContent = value == null ? '' : String(value)
                        return
                    }

                    const currentKeys = new Set()
                    value.forEach(vnode => {
                        if (vnode.key !== undefined) currentKeys.add(vnode.key)
                    })

                    // 1. Remove elements that are no longer in the list
                    keyToElement.forEach((element, key) => {
                        if (!currentKeys.has(key)) {
                            unmount(element)
                            element.remove()
                            keyToElement.delete(key)
                        }
                    })

                    // 2. Reconcile remaining and new elements
                    value.forEach((vnode, index) => {
                        const finalKey = vnode.key
                        if (finalKey === undefined) {
                            console.warn('Vnode in list missing key:', vnode)
                            return
                        }

                        if (keyToElement.has(finalKey)) {
                            const existingElement = keyToElement.get(finalKey)
                            const currentPosition = Array.from(el.children).indexOf(existingElement)

                            if (currentPosition !== index) {
                                if (index >= el.children.length) {
                                    el.appendChild(existingElement)
                                } else {
                                    el.insertBefore(existingElement, el.children[index])
                                }
                            }
                        } else {
                            const element = createElement(vnode)
                            keyToElement.set(finalKey, element)
                            if (index >= el.children.length) {
                                el.appendChild(element)
                            } else {
                                el.insertBefore(element, el.children[index])
                            }
                        }
                    })
                })

                el._cleanups.push(cleanupFn)
            } else {
                mount(el, child)
            }
        })
    }

    return el
}

function mount(parent, vnode) {
    const domElement = createElement(vnode)
    parent.appendChild(domElement)

    if (domElement._delayedEvents) {
        domElement._delayedEvents.forEach(({ event, handler, selector }) => {
            const cleanupFn = delegate(parent, selector, event, handler)
            domElement._cleanups.push(cleanupFn)
        })
        delete domElement._delayedEvents
    }
}

function unmount(node) {
    if (node._cleanups) {
        node._cleanups.forEach(cleanupFn => { cleanupFn() })
        node._cleanups = []
    }
}
