const delegations = new WeakMap();

export function delegate(parent, selector, type, handler) { //type: type of event
    let eventsForParent = delegations.get(parent)
    
    if (!eventsForParent) {
        eventsForParent = {}
        delegations.set(parent, eventsForParent)
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
    console.log(eventsForParent)

    return () => {
        const list = eventsForParent[type]
        const idx = list.indexOf(rule)
        if (idx !== -1) list.splice(idx, 1)
    }
}
