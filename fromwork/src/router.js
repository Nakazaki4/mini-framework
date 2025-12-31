import { signal, effect } from './reactivity.js'
import { createElement } from './dom.js'

class Router {
    constructor() {
        this.root = null
        this.routes = new Map()
        this.routeGroups = new Map() // NEW: Track route groups

        const [currentPath, setCurrentPath] = signal(this.getCurrentPath())
        this.currentRoute = currentPath
        this.setCurrentRoute = setCurrentPath

        this.currentDOM = null
        this.lastPath = null // NEW: Track last rendered path
        this.isInit = false

        window.addEventListener('hashchange', () => {
            this.setCurrentRoute(this.getCurrentPath())
        })
    }

    getCurrentPath() {
        const hash = window.location.hash.slice(1)
        return hash || '/'
    }

    initRouter(rootElement) {
        if (this.isInit) {
            console.warn('Router already initialized!')
            return this
        }

        this.root = rootElement
        this.isInit = true

        effect(() => {
            this._render()
        })

        return this
    }

    addRoute(path, handler, group = null) {
        this.routes.set(path, handler)

        // Track route groups
        if (group) {
            if (!this.routeGroups.has(group)) {
                this.routeGroups.set(group, new Set())
            }
            this.routeGroups.get(group).add(path)
        }

        return this
    }

    navigate(path) {
        if (path === this.currentRoute()) return
        window.location.hash = path
    }

    // NEW: Helper to find which group a path belongs to
    _getRouteGroup(path) {
        for (const [group, paths] of this.routeGroups) {
            if (paths.has(path)) {
                return group
            }
        }
        return null
    }

    // MODIFIED: Check route groups before destroying DOM
    _render() {
        console.log("hello")
        const path = this.currentRoute()
        const callback = this.routes.get(path)

        // Check if navigating within the same route group
        if (this.currentDOM && this.lastPath && path !== this.lastPath) {
            const lastGroup = this._getRouteGroup(this.lastPath)
            const currentGroup = this._getRouteGroup(path)

            // If both routes are in the same group, skip DOM recreation
            if (lastGroup && currentGroup && lastGroup === currentGroup) {
                console.log(`✓ Navigating within group '${currentGroup}': ${this.lastPath} → ${path}`)
                console.log('✓ Skipping DOM recreation, executing callback for state update')

                // Execute the callback to update state (like filter signal)
                if (callback) {
                    callback()
                }

                // Update lastPath and exit early
                this.lastPath = path
                return
            }
        }

        // Clean up previous DOM (only if different group or first render)
        if (this.currentDOM) {
            console.log('Recreating DOM for path:', path)
            if (Array.isArray(this.currentDOM)) {
                this.currentDOM.forEach(dom => dom.remove())
            } else {
                this.currentDOM.remove()
            }
            this.currentDOM = null
        }

        // Handle 404
        if (!callback) {
            let notFound = createElement({
                tag: "h1",
                attrs: { textContent: "404 - not found" },
                children: []
            })
            this.root.appendChild(notFound)
            this.currentDOM = notFound
            this.lastPath = path
            return
        }

        // Execute route handler and render result
        console.log('Creating DOM for path:', path)
        const result = callback()

        if (Array.isArray(result)) {
            const doms = result.map(vnode => {
                const dom = createElement(vnode)
                this.root.appendChild(dom)
                return dom
            })
            this.currentDOM = doms
        } else {
            const dom = createElement(result)
            this.root.appendChild(dom)
            this.currentDOM = dom
        }

        // Track this as the last rendered path
        this.lastPath = path
    }
}

export const router = new Router()