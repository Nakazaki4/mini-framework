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
                        el.setAttribute(key, actualValue)
                    } else if (key === 'style' && typeof actualValue === 'object') {
                        Object.assign(el.style, actualValue)
                    } else {
                        el[key] = actualValue
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
                handleReactiveChild(el, child)
            } else {
                mount(el, child)
            }
        })
    }

    return el
}

function handleReactiveChild(parent, child) {
    const keyToElement = new Map()
    let singleNode = null
    const marker = document.createComment('reactive-child')
    parent.appendChild(marker)

    const cleanupFn = effect(() => {
        const value = child()

        if (!Array.isArray(value)) {
            const text = value == null ? '' : String(value)
            if (keyToElement.size > 0) {
                keyToElement.forEach(e => { unmount(e); e.remove() })
                keyToElement.clear()
            }
            if (!singleNode) {
                singleNode = document.createTextNode(text)
                parent.insertBefore(singleNode, marker)
            } else {
                singleNode.textContent = text
            }
            return
        }

        if (singleNode) {
            singleNode.remove()
            singleNode = null
        }

        const currentKeys = new Set()
        value.forEach((vnode, index) => {
            const finalKey = vnode.key
            if (finalKey === undefined) return
            currentKeys.add(finalKey)

            if (keyToElement.has(finalKey)) {
                const existing = keyToElement.get(finalKey)
                if (Array.from(parent.children).indexOf(existing) !== index) {
                    parent.insertBefore(existing, parent.children[index] || marker)
                }
                return
            }

            const element = createElement(vnode)
            keyToElement.set(finalKey, element)
            parent.insertBefore(element, parent.children[index] || marker)
        })

        keyToElement.forEach((element, key) => {
            if (!currentKeys.has(key)) {
                unmount(element)
                element.remove()
                keyToElement.delete(key)
            }
        })
    })

    parent._cleanups.push(cleanupFn)
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
