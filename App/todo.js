import { el } from "../fromwork/src/dom.js"
import { footerPart, sectionPart } from "./components/app.js"
import { router } from '../fromwork/src/router.js'

function App() {
    console.log(window.location.pathname);

    router.addRoute('/', () => {
        console.log('hello');

        return [sectionPart(), footerPart()]
    }).initRouter(document.body)
}

document.addEventListener('DOMContentLoaded', App())