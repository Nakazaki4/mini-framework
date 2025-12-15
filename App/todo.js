import { el } from "../fromwork/src/dom.js"
import { footerPart, sectionPart } from "./components/app.js"
import { router } from '../fromwork/src/router.js'

function App() {
    router.initRouter(document.body)
    console.log(window.location.pathname);
    
    router.addRoute('/', () => {
        console.log('hello');

        return el('div', {}, sectionPart(), footerPart())
    })
}

document.addEventListener('DOMContentLoaded', App())