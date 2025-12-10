// - router.route(path, handler)      // Define routes
// - router.navigate(path)            // Programmatic navigation
// - router.current()                 // Current route as signal
// - router.init()                    // Start the router
// - Link(href, attrs, children)      // Navigation links
// - Route({ path, component })       // Route components

import { signal } from "./reactivity"

class Router {
    constructor() {
        this.routes = new Map()
        this.currentRoute = signal({
            path: window.location.pathname,
            params: {},
            query: {}
        })
    }

    addRoute(path, handler) {
        this.routes.set(path, handler)
    }

    navigate(path, replace = false) {
        const prevPath = this.currentRoute
        if (path === prevPath) return
        this.currentRoute.set(path)
        this.render(prevPath)
    }

    render(prevPath) {
        let currPath = this.currentRoute
        
    }
}

export const router = new Router() 