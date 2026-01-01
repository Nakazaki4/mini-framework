import { el } from "../../fromwork/src/dom.js"
import { signal } from "../../fromwork/src/reactivity.js"
import { currentFilter, todos, addTodo, removeTodo, getFilteredTodos } from '../store.js'

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

function getActiveCount() {
    let count = 0
    todos().forEach(todo => {
        const state = taskCompletionStates.get(todo.id)
        const isCompleted = state ? state.completed() : false
        if (!isCompleted) count++
    })
    return `${count} item${count !== 1 ? 's' : ''} left`
}

function footer() {
    return el('footer', {
        className: 'footer',
        style: () => todos().length === 0 ? { display: 'none' } : { display: 'block' }
    },
        el('span', { className: 'todo-count' },
            el('strong', {}, getActiveCount)
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
            style: 'display: none;'
        }, 'Clear completed')
    )
}

function main() {
    const handleToggleAll = () => {
        const list = todos()
        const allCompleted = list.length > 0 && list.every(todo => {
            const state = taskCompletionStates.get(todo.id)
            return state ? state.completed() : false
        })

        const newState = !allCompleted

        taskCompletionStates.forEach(({ setCompleted }) => {
            setCompleted(newState)
        })
    }

    return el('main', { className: 'main' },
        el('div', { className: 'toggle-all-container' },
            el('input', {
                type: 'checkbox',
                id: 'toggle-all-input',
                className: 'toggle-all',
                'on:change': handleToggleAll,
                checked: () => {
                    const list = todos()
                    if (list.length === 0) return false
                    return list.every(todo => {
                        const state = taskCompletionStates.get(todo.id)
                        return state ? state.completed() : false
                    })
                }
            }),
            el('label', {
                className: 'toggle-all-label',
                for: 'toggle-all-input'
            })
        ),
        el('ul', { className: 'todo-list' },
            () => getFilteredTodos(taskCompletionStates).map(todo => {
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
    let completed, setCompleted

    if (taskCompletionStates.has(todo.id)) {
        const state = taskCompletionStates.get(todo.id)
        completed = state.completed
        setCompleted = state.setCompleted
    } else {
        const signalPair = signal(false)
        completed = signalPair[0]
        setCompleted = signalPair[1]

        taskCompletionStates.set(todo.id, { completed, setCompleted })
    }

    const toggleStatus = () => {
        setCompleted(!completed())
    }

    const deleteTask = () => {
        removeTodo(todo.id)
        taskCompletionStates.delete(todo.id)
    }

    return el('li', {
        className: () => completed() ? 'completed' : ''
    },
        el('div', { className: 'view' },
            el('input', {
                type: 'checkbox',
                className: 'toggle',
                'on:change': toggleStatus,
                checked: () => completed()
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