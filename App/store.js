import { signal } from '../fromwork/src/reactivity.js'

// Create shared filter state that persists across route changes
export const [currentFilter, setCurrentFilter] = signal('all')
export const [todos, setTodos] = signal([]) // holds an array of todo objects {id, title}

let todoIdCounter = 0

export function addTodo(title) {
    const newTodo = {
        id: ++todoIdCounter,
        title: title
    }
    setTodos([...todos(), newTodo])
}

export function removeTodo(id) {
    setTodos(todos().filter(todo => todo.id !== id))
}

export function editTodo(id, newTitle) {
    setTodos(todos().map(todo =>
        todo.id === id
            ? { ...todo, title: newTitle }
            : todo
    ))
}

export function getFilteredTodos(taskStates) {
    const filter = currentFilter()
    const list = todos()

    return list.filter(todo => {
        const state = taskStates.get(todo.id)
        const isCompleted = state ? state.completed() : false

        if (filter === 'active') return !isCompleted
        if (filter === 'completed') return isCompleted
        return true
    })
}
