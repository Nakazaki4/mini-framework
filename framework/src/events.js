export function bind(element, type, handler, options = null) {
    element.addEventListener(type, handler, options)
    let removed = false;

    return () => {
        if (!removed) {
            element.removeEventListener(type, handler, options)
            removed = true
        }
    }
}

export function delegate(parent, selector, type, handler) {

}
// - delegate(parent, selector, type, handler) // Event delegation
// - eventStream(element, type)                // Signal-based events
// - shortcut(keys, handler)                   // Keyboard shortcuts
// - eventBus                                  // Global event system