import { State } from "./state.js"

function App() {
    const btn = document.getElementById("btn")
    const count = new State(0)
    btn.addEventListener('click', () => count.value++)

    const component = {
        tag: "div",
        className: "main-div",
        textContent: count
    }
    return createElement(component)
}

function createElement(component) {
    let el = null
    Object.entries(component).forEach(([k, v]) => {
        if (k == "tag") {
            el = document.createElement(v)
        }
        else if (v instanceof State) {
            v.subscribe(() => {
                el.textContent = v.value
            })
        }
        else {
            el.setAttribute(k, v)
        }
    })
    return el
}

document.getElementById("app").append(App());