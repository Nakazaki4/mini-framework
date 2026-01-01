import { footerPart, sectionPart } from "./components/app.js"
import { router } from '../fromwork/src/router.js'
import { signal } from '../fromwork/src/reactivity.js'

export const [currentFilter, setCurrentFilter] = signal('all')
export const [todos, setTodos] = signal([])

let todoIdCounter = 0

export function addTodo(text) {
    const newTodo = {
        id: todoIdCounter++,
        text: text,
        completed: false
    }
    setTodos([...todos(), newTodo])
}

export function removeTodo(id) {
    setTodos(todos().filter(todo => todo.id !== id))
}

export function toggleTodo(id) {
    setTodos(todos().map(todo =>
        todo.id === id
            ? { ...todo, completed: !todo.completed }
            : todo
    ))
}

export function editTodo(id, newText) {
    setTodos(todos().map(todo =>
        todo.id === id
            ? { ...todo, text: newText }
            : todo
    ))
}

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