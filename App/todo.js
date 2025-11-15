
import { render } from '../framework/renderer.js'
import { effect, signal } from '../framework/signal.js'
import { appContainer } from './components/app.js'
import { createTask } from './components/task.js'

function App() {
    const todos = signal([])

    const addTaskEvent = (inputEl) => {
        const text = inputEl.value.trim();        
        addTask(text)
        inputEl.value = ""
    }

    const clearCompleted = () => {
        const newTodos = todos().filter(task => task.props.class !== "completed")
        todos.set(newTodos)
    }

    document.body.appendChild(render(appContainer(addTaskEvent, clearCompleted)))

    effect(() => {
        const ul = document.querySelector(".todo-list")
        ul.innerHTML = ""
        todos().forEach((task, index) => {
            const element = render(task)
            ul.appendChild(element)
        })
    })

    function addTask(text) {
        const newTask = createTask(
            text,
            (e, index) => { toggleTask(index) },
            (e, index) => { deleteTask(index) }
        )
        todos.set([...todos(), newTask])
    }

    function toggleTask(index) {
        const updatedTodos = [...todos()]
        const task = updatedTodos[index]
        task.props.class == "" ? task.props.class = "completed" : task.props.class = ""
    }

    function deleteTask(index) {
        const updatedTodos = [...todos()]
        updatedTodos.splice(index, 1)
        todos.set(updatedTodos)
    }
}

document.addEventListener('DOMContentLoaded', App())