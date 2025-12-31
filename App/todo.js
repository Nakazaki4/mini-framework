import { footerPart, sectionPart } from "./components/app.js"
import { router } from '../fromwork/src/router.js'
import { signal } from '../fromwork/src/reactivity.js'

// Create shared filter state that persists across route changes
export const [currentFilter, setCurrentFilter] = signal('all')
export const [todos, setTodos] = signal([]) // holds an array of the tasks as text and not dom object

function App() {
    router
        .addRoute('/', () => {
            console.log('Route: All todos')
            setCurrentFilter('all')
            return [sectionPart(), footerPart()]
        }, 'todo-app')

        .addRoute('/active', () => {
            console.log('Route: Active todos')
            setCurrentFilter('active')
            return [sectionPart(), footerPart()]
        }, 'todo-app')

        .addRoute('/completed', () => {
            console.log('Route: Completed todos')
            setCurrentFilter('completed')
            return [sectionPart(), footerPart()]
        }, 'todo-app')

        .initRouter(document.body)
}

document.addEventListener('DOMContentLoaded', App)
