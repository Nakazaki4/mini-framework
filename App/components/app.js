import { el } from "../../fromwork/src/dom.js"
import { signal } from "../../fromwork/src/reactivity.js"
import { currentFilter, todos, addTodo, removeTodo, toggleTodo, getFilteredTodos, clearCompleted } from '../store.js'

// Map to track individual task completion states by todo id
const taskCompletionStates = new Map()

export function sectionPart() {
    return el('section', { className: 'todoapp' },
        header(),
        main(),
        footer())
}

export function footerPart() {
    return el('footer', { className: 'info' },
        el('p', {}, "Double-click to edit a todo"),
        el('p', {}, "Created by the TodoMVC Team"),
        el('p', {}, el('a', { href: 'https://todomvc.com/' },
            "TodoMVC "),
            "Part of ")
    )
}

function footer() {
    const activeCount = () => {
        const count = todos().filter(todo => !todo.completed()).length
        return `${count} item${count !== 1 ? 's' : ''} left`
    }

    return el('footer', {
        className: 'footer',
        style: () => todos().length === 0 ? { display: 'none' } : { display: 'block' }
    },
        el('span', { className: 'todo-count' },
            el('strong', {}, activeCount)
        ),
        el('ul', { className: 'filters' },
            el('li', {}, el('a', {
                href: '#/',
                className: () => currentFilter() === 'all'
                    ? 'router-link-active router-link-exact-active selected'
                    : ''
            }, 'All')),

            el('li', {}, el('a', {
                href: '#/active',
                className: () => currentFilter() === 'active'
                    ? 'router-link-active router-link-exact-active selected'
                    : ''
            }, 'Active')),

            el('li', {}, el('a', {
                href: '#/completed',
                className: () => currentFilter() === 'completed'
                    ? 'router-link-active router-link-exact-active selected'
                    : ''
            }, 'Completed'))
        ),
        el('button', {
            className: 'clear-completed',
            style: () => todos().some(todo => todo.completed()) ? { display: 'block' } : { display: 'none' },
            'on:click': clearCompleted
        }, 'Clear completed')
    )
}

function main() {
    const [toggleAllState, setToggleAllState] = signal(false)

    const handleToggleAll = () => {
        const newState = !toggleAllState()
        setToggleAllState(newState)

        taskCompletionStates.forEach((id, setter) => {
            console.log(setter);
            setter(newState)
        })
    }

    return el('main', { className: 'main' },
        el('div', { className: 'toggle-all-container' },
            el('input', {
                type: 'checkbox',
                id: 'toggle-all-input',
                className: 'toggle-all',
                'on:change': handleToggleAll,
                checked: () => toggleAllState()
            }),
            el('label', {
                className: 'toggle-all-label',
                for: 'toggle-all-input'
            })
        ),
        el('ul', { className: 'todo-list' },
            () => getFilteredTodos().map(todo => {
                const vnode = task(todo)
                vnode.key = todo.id
                return vnode
            })
        )
    )
}

function header() {
    return el('header', { className: 'header' },
        el('h1', {}, 'todos'),
        el('input', {
            className: "new-todo",
            placeholder: "What needs to be done?",
            'on:keydown': (e) => {
                if (e.key !== 'Enter') return

                const value = e.target.value.trim()
                if (!value) return

                e.target.value = ''
                addTodo(value)
            }
        })
    )
}

function task(todo) {
    const [isCompleted, setIsCompleted] = signal(false)
    const [text, setText] = signal('')

    // Register this task's completion state
    taskCompletionStates.set(todo.id, setIsCompleted)

    const toggleStatus = () => {
        toggleTodo(todo.id)
    }

    const deleteTask = () => {
        removeTodo(todo.id)
        taskCompletionStates.delete(todo.id)
    }

    return el('li', {
        className: () => todo.completed() ? 'completed' : ''
    },
        el('div', { className: 'view' },
            el('input', {
                type: 'checkbox',
                className: 'toggle',
                'on:change': toggleStatus,
                checked: () => todo.completed()
            }),
            el('label', {}, todo.title),
            el('button', {
                className: 'destroy',
                'on:click': deleteTask
            })
        ),
        el('div', { className: 'input-container' },
            el('input', {
                id: 'edit-todo-input',
                type: 'text',
                className: 'edit'
            }),
            el('label', {
                className: 'visually-hidden',
                for: 'edit-todo-input'
            }, 'Edit Todo Input')
        )
    )
}