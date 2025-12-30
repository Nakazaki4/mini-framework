import { el } from "../fromwork/src/dom.js";
import { footerPart, sectionPart } from "./components/app.js";
import { router } from '../fromwork/src/router.js';

function App() {
    router.addRoute('/', () => {
        return [sectionPart(), footerPart()]
    })
    .addRoute('/active', () => {
        return [sectionPart(), footerPart()]
    })
    .addRoute('/completed', () => {
        return [sectionPart(), footerPart()]
    })
    .initRouter(document.body)
}

document.addEventListener('DOMContentLoaded', App);