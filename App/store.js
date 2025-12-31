import { signal, computed } from "../fromwork/src/reactivity.js"


function loadTodos() {
    try {
        const stored = localStorage.getItem('todos')
        return stored ? JSON.parse(stored) : []
    } catch {
        return []
    }
}


function saveTodos(todos) {
    localStorage.setItem('todos', JSON.stringify(todos))
}


const [getTodos, setTodosRaw] = signal(loadTodos())

function setTodos(newTodos) {
    saveTodos(newTodos)
    setTodosRaw(newTodos)
}

export const todos = getTodos

export const activeTodos = computed(() => {
    return getTodos().filter(todo => !todo.completed)
})

export const completedTodos = computed(() => {
    return getTodos().filter(todo => todo.completed)
})

export const activeCount = computed(() => activeTodos().length)

export const hasCompleted = computed(() => completedTodos().length > 0)

export const allCompleted = computed(() => {
    const all = getTodos()
    return all.length > 0 && all.every(todo => todo.completed)
})


let nextId = Date.now()

export function addTodo(text) {
    const trimmed = text.trim()
    if (!trimmed) return
    
    const newTodo = {
        id: nextId++,
        text: trimmed,
        completed: false
    }
    
    setTodos([...getTodos(), newTodo])
}

export function removeTodo(id) {
    setTodos(getTodos().filter(todo => todo.id !== id))
}

export function updateTodo(id, updates) {
    setTodos(getTodos().map(todo => 
        todo.id === id ? { ...todo, ...updates } : todo
    ))
}

export function toggleTodo(id) {
    setTodos(getTodos().map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
}

export function toggleAll() {
    const shouldComplete = !allCompleted()
    setTodos(getTodos().map(todo => ({ ...todo, completed: shouldComplete })))
}

export function clearCompleted() {
    setTodos(getTodos().filter(todo => !todo.completed))
}