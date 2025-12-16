import { signal, effect } from './reactivity.js'
import { createElement } from './dom.js'

class Router {
    constructor() {
        this.root = null
        this.routes = new Map()
        const [currentPath, setCurrentPath] = signal(this.getCurrentPath())
        this.currentRoute = currentPath
        this.setCurrentRoute = setCurrentPath
        this.currentDOM = null
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

    addRoute(path, handler) {
        this.routes.set(path, handler)
        return this
    }

    navigate(path) {
        if (path === this.currentRoute()) return
        window.location.hash = path
    }

    _render() {
        const path = this.currentRoute()
        const callback = this.routes.get(path)

        if (this.currentDOM) {
            if (Array.isArray(this.currentDOM)) {
                this.currentDOM.forEach(dom => dom.remove())
            } else {
                this.currentDOM.remove()
            }
            this.currentDOM = null
        }

        if (!callback) {
            let notFound = createElement({
                tag: "h1",
                attrs: { textContent: "404 - not found" },
                children: []
            })
            this.root.appendChild(notFound)
            this.currentDOM = notFound
            return
        }

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
    }
}

export const router = new Router()