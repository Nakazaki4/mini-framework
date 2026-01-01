import { footerPart, sectionPart } from "./components/app.js"
import { router } from '../fromwork/src/router.js'
import { setCurrentFilter } from './store.js'

function App() {
    router
        .addRoute('/', () => {
            console.log('Route: All todos')
            setCurrentFilter('all')
            return [sectionPart(), footerPart()]
        }, 'todo-app')

        .addRoute('/active', () => {
            setCurrentFilter('active')
            return [sectionPart(), footerPart()]
        }, 'todo-app')

        .addRoute('/completed', () => {
            setCurrentFilter('completed')
            return [sectionPart(), footerPart()]
        }, 'todo-app')

        .initRouter(document.body)
}

document.addEventListener('DOMContentLoaded', App)