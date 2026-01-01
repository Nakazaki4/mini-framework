import { signal } from '../fromwork/src/reactivity.js'

// Create shared filter state that persists across route changes
export const [currentFilter, setCurrentFilter] = signal('all')
export const [todos, setTodos] = signal([]) // holds an array of todo objects {id, title, completed: signal(bool)}

let todoIdCounter = 0

export function addTodo(title) {
    const [completed, setCompleted] = signal(false)
    const newTodo = {
        id: ++todoIdCounter,
        title: title,
        completed,
        setCompleted
    }
    setTodos([...todos(), newTodo])
}

export function removeTodo(id) {
    setTodos(todos().filter(todo => todo.id !== id))
}

export function toggleTodo(id) {
    const todo = todos().find(t => t.id === id)
    if (todo) {
        todo.setCompleted(!todo.completed())
        setTodos([...todos()]) // Trigger global update for filtering/counting
    }
}

export function editTodo(id, newTitle) {
    setTodos(todos().map(todo =>
        todo.id === id
            ? { ...todo, title: newTitle }
            : todo
    ))
}

export function clearCompleted() {
    setTodos(todos().filter(todo => !todo.completed()))
}

export function getFilteredTodos() {
    const list = todos()
    const filter = currentFilter()
    return list.filter(todo => {
        const isCompleted = todo.completed()
        if (filter === 'active') return !isCompleted
        if (filter === 'completed') return isCompleted
        return true
    })
}
