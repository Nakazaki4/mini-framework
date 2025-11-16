export function render(component) {
    if (typeof component == "string") {
        return document.createTextNode(component);
    }

    const el = document.createElement(component.tag)

    for (const [key, value] of Object.entries(component.props || {})) {
        if (key.startsWith('on') && typeof value == 'function') {
            const event = key.slice(2).toLowerCase()
            el.addEventListener(event, value)
        } else if (typeof value === "boolean") {
            el[key] = value
        } else {
            el.setAttribute(key, value)
        }
    }

    for (const child of component.children || []) {
        el.appendChild(render(child))
    }

    return el
}