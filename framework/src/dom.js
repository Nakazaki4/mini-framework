import { effect } from "./reactivity"

export function el(tag, attributes, ...children) {
    return (
        {
            tag: tag,
            attrs: attributes || {},
            children: children.flat().filter(c => c != null)
        }
    )
}

export function mount(parent, vnode) {
    const domElement = createElement(vnode)
    parent.appendChild(domElement)
}

function createElement(vnode) {
    if (typeof vnode === 'string' || typeof vnode === 'number') {
        return document.createTextNode(String(vnode))
    }

    if (vnode == undefined || vnode == null) {
        return document.createTextNode('')
    }

    if (typeof vnode == 'function') {
        const textEl = document.createTextNode('')
        effect(() => {
            const value = vnode()
            textEl.textContent = value == null ? '' : String(value)
        })
        return textEl
    }

    // tag
    if (vnode.tag === 'function') {
        return createElement(vnode.tag(vnode.attrs))
    }

    const el = document.createElement(vnode.tag)

    // attributes
    Object.entries(vnode.attrs).forEach(([key, value]) => {
        if (key.startsWith('on:')) {
            const event = key.slice(3)
            el.addEventListener(event, value)
            return
        }

        if (typeof value === 'function') {
            effect(() => {
                const actualValue = value()
                if (key === 'className') {
                    el.setAttribute(key, actualValue)
                } else if (key === 'style' && typeof actualValue === 'object') {
                    Object.assign(el.style, currentValue)
                } else {
                    el[key] = actualValue
                }
            })
            return
        }

        if (key === 'className') {
            el[key] = value
        } else if (key === 'style' && typeof value === 'object') {
            Object.assign(el.style, value)
        } else if (key in el) {
            el[key] = value
        } else {
            el.setAttribute(key, val)
        }
    })

    // children
    vnode.children.forEach(child => {
        const childEl = createElement(child)
        if (childEl) el.appendChild(childEl)
    })
    return el
}
