import { signal } from '../fromwork/src/reactivity.js'

export const [currentFilter, setCurrentFilter] = signal('all')
export const [todos, setTodos] = signal([])

let todoIdCounter = 0

export function addTodo(titleText) {
    const [completed, setCompleted] = signal(false)
    const [title, setTitle] = signal(titleText)  
    
    const newTodo = {
        id: ++todoIdCounter,
        title,          
        setTitle,        
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
        setTodos([...todos()]) 
    }
}

export function editTodo(id, newTitle) {
    const todo = todos().find(t => t.id === id)
    if (todo) {
        todo.setTitle(newTitle)  
    }
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