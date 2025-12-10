const delegations = new WeakMap();

export function delegate(parent, selector, type, handler) { //type: type of event
    let eventsForParent = delegations.get(parent)

    if (!eventsForParent) {
        delegations.set(parent, {})
    }

    if (!eventsForParent[type]) {
        eventsForParent[type] = []

        parent.addEventListener(type, (event) => {
            const handlers = delegations.get(parent)?.[type]
            if (!handlers) return


            for (const { selector, handler } of handlers) {
                const target = event.target.closest(selector)
                if (target && parent.contains(target)) {
                    handler(event, type)
                }
            }
        })
    }

    const rule = { selector, handler }
    eventsForParent[type].push(rule)

    return () => {
        const list = eventsForParent[type]
        const idx = list.indexof(rule)
        if (idx !== -1) list.splice(idx, 1)
    }
}