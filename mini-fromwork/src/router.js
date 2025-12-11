import { createElement } from "./dom.js"
import { effect, signal } from "./reactivity.js"

class Router {
    constructor(rootElement) {
        this.root = rootElement
        this.routes = new Map()
        this.currentRoute = signal(window.location.pathname)
        this.currentDOM = null
        this.isInit = false

        window.addEventListener('popstate', () => {
            this.currentRoute.set(window.location.pathname)
        })
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

    getCurrentRoute() {
        return this.currentRoute()
    }

    addRoute(path, handler) {
        this.routes.set(path, handler)
    }

    navigate(path) {
        if (path === this.currentRoute()) return
        this.currentRoute.set(String(path))
        history.pushState({}, "", path)
    }

    _render() {
        const callback = this.routes.get(this.currentRoute());
        if (this.currentDOM) {
            this.currentDOM.innerHTML = ''
        }
        console.log(this.routes, this.routes.get(this.currentRoute()))
        console.log(this.currentRoute())

        if (!callback) {
            let notFound = {
                tag: "h1",
                attrs: { textContent: "404 - not found" }
            }
            this.root.appendChild(createElement(notFound))
            this.currentDOM = notFound
            return
        }

        const dom = createElement(callback())
        this.currentDOM = this.root.appendChild(dom)
    }
}

export const router = new Router() 