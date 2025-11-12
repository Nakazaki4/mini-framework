import { effect, signal } from "./signals.js"

class state {
    data = null

    get value() {
        return v
    }
    set value(newValue) {
        v = newValue
        subscriptions.forEach((fn) => fn(newValue))
    }
    register(subscriber) {
        subscriptions.add(subscriber)
    }

}


const div = (attributes) => {
    const elm = document.createElement("div");
    Object.entries(attributes).forEach(([k, v]) => {
        if (v instanceof state) {
            elm.textContent = v.value
        }
        elm.setAttribute(k, v)
    })

    return elm;
}

const App = () => {
    const btn = document.getElementById('btn')
    let count = new state(0);
    btn.addEventListener('click', () => count.value++)
    return div({ textContent: count, className: theme })
}

document.getElementById("app").append(App())