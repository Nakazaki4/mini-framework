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
        console.log(typeof vnode)
        const textEl = document.createTextNode('')
        textEl._cleanups = []
        const cleanupFn = effect(() => {
            const value = vnode()
            console.log(value)
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
    el._pendingEvents = []

    // attributes
    if (vnode.attrs) {
        Object.entries(vnode.attrs).forEach(([key, value]) => {
            if (key.startsWith('on:')) {
                const event = key.slice(3)
                el._pendingEvents.push({ event, handler: value, selector: vnode.tag })
                return
            }

            if (typeof value === 'function') {
                const cleanupFn = effect(() => {
                    const actualValue = value()
                    if (key === 'className') {
                        el.className = actualValue
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

    // children
    if (Array.isArray(vnode.children)) {
        vnode.children?.forEach(child => {
            if (child) mount(el, child)
        })
    }

    return el
}

function mount(parent, vnode) {
    // console.log("PARENT", parent)
    // console.log("CHILD", vnode);

    const domElement = createElement(vnode)
    parent.appendChild(domElement)


    if (domElement._pendingEvents && domElement._pendingEvents.length > 0) {
        domElement._pendingEvents.forEach(({ event, handler, selector }) => {
            const delegateParent = domElement.parentNode
            if (delegateParent) {
                const cleanupFn = delegate(delegateParent, selector, event, handler)
                domElement._cleanups.push(cleanupFn)
            }
        })
        domElement._pendingEvents = []
    }
}

function unmount(node) {
    if (node._cleanups) {
        node._cleanups.forEach(cleanupFn => { cleanupFn() })
        node._cleanups = []
    }
}