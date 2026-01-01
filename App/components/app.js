import { el } from "../../fromwork/src/dom.js"
import { signal } from "../../fromwork/src/reactivity.js"
import { currentFilter, todos, addTodo, removeTodo, editTodo, getFilteredTodos } from '../store.js'

// Map to track individual task completion states by todo id
const taskCompletionStates = new Map() //GVO

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
    const clearCompleted = () => {
        const completedIds = []
        todos().forEach(todo => {
            const state = taskCompletionStates.get(todo.id)
            const isCompleted = state ? state.completed() : false
            if (isCompleted) {
                completedIds.push(todo.id)
            }
        })

        completedIds.forEach(id => {
            removeTodo(id)
            taskCompletionStates.delete(id)
        })
    }

    const hasCompleted = () => {
        return todos().some(todo => {
            const state = taskCompletionStates.get(todo.id)
            if (state.completed()) {
                console.log('true')
            }
            return state ? state.completed() : false
        })
    }

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
            disabled: () => !hasCompleted(),
            'on:click': clearCompleted
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
    const [isEditing, setIsEditing] = signal(false)
    const [editValue, setEditValue] = signal(todo.title)

    // Local signal to store and track the todo's title reactively
    let title, setTitle
    let completed, setCompleted

    // Reuse existing state if this todo was already rendered, otherwise create new signals
    if (taskCompletionStates.has(todo.id)) {
        const state = taskCompletionStates.get(todo.id)
        title = state.title
        setTitle = state.setTitle
        completed = state.completed
        setCompleted = state.setCompleted
    } else {
        [title, setTitle] = signal(todo.title);
        [completed, setCompleted] = signal(false);
        taskCompletionStates.set(todo.id, { title, setTitle, completed, setCompleted })
    }

    const toggleStatus = () => {
        setCompleted(!completed()) // here
    }
    const deleteTask = () => {
        removeTodo(todo.id)
        taskCompletionStates.delete(todo.id)
    }

    const startEdit = (e) => {
        setEditValue(title())
        setIsEditing(true)
        setTimeout(() => {
            const input = e.target.closest('li').querySelector('.input-container .edit')
            if (input) {
                input.focus()
                input.setSelectionRange(input.value.length, input.value.length)
            }
        }, 0)
    }

    const finishEdit = () => {
        const trimmedValue = editValue().trim()
        if (trimmedValue.length === 0) {
            deleteTask()
        } else {
            editTodo(todo.id, trimmedValue)
            setTitle(trimmedValue)
        }
        setIsEditing(false)
    }

    const cancelEdit = () => {
        setIsEditing(false)
        setEditValue(title())
    }

    const handleKeyUp = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            finishEdit()
        } else if (e.key === 'Escape') {
            e.preventDefault()
            cancelEdit()
        }
    }

    /**
     * Handles when user clicks outside the edit input - cancels the edit
     */
    const handleBlur = () => {
        // Exit edit mode and discard changes
        // Use setTimeout to ensure blur completes before updating state
        setTimeout(() => {
            setIsEditing(false)
            setEditValue(title())
        }, 0)
    }

    return el('li', {
        className: () => {
            const classes = []
            if (completed()) classes.push('completed')
            if (isEditing()) classes.push('editing')
            return classes.join(' ')
        }
    },
        el('div', { className: 'view' },
            el('input', {
                type: 'checkbox',
                className: 'toggle',
                'on:change': toggleStatus,
                checked: () => completed()
            }),
            el('label', {
                'on:dblclick': startEdit
            }, title),
            el('button', {
                className: 'destroy',
                'on:click': deleteTask
            })
        ),
        el('div', { className: 'input-container' },
            el('input', {
                className: 'edit',
                type: 'text',
                value: () => editValue(),
                'on:input': (e) => setEditValue(e.target.value),
                'on:keydown': handleKeyUp,
                'on:focusout': handleBlur
            })
        )
    )
}
