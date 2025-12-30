import { el, createElement } from "../fromwork/src/dom.js";
import { footerPart, sectionPart } from "./components/app.js";
import { router } from '../fromwork/src/router.js';

function App() {

    const section = createElement(sectionPart());
    const footer = createElement(footerPart());
    
    document.body.appendChild(section);
    document.body.appendChild(footer);

}

document.addEventListener('DOMContentLoaded', App);
