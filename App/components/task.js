import { el } from "../../fromwork/src/dom"
import { signal } from "../../fromwork/src/reactivity"

export function newTask(inititalContent) {
    const [isCompleted, setIsCompleted] = signal(false)
    const [content, setContent] = signal(inititalContent)
    const [isHovered, setIsHovered] = signal(false)
    const [isEditing, setIsEditing] = signal(false)
    const [editText, setEditText] = signal(inititalContent)

    const handleDelete = () => {

    }

    const startEditing = () => {
        setIsEditing(true)
    }

    const finishEditing = () => {
        const trimmed = editText().trim()
        if (trimmed) {
            setContent(trimmed)
        }
        setIsEditing(false)
    }

    const cancelEditing = () => {
        setEditText(content())
        setIsEditing(false)
    }

    return el('li', {
        'className': () => {
            isCompleted ? 'completed' : isEditing ? 'editing' : ''
        },
        'on:mouseenter': () => setIsHovered(true),
        'on:mouseleave': () => setIsHovered(false)
    },
        el('div', { 'className': 'view' },
            el('input', {
                type: 'checkbox',
                'className': 'toggle',
                checked: () => isCompleted(),
                'on:change': () => setIsCompleted(!isCompleted())
            }),
            el('label', { 'on:dblclick': startEditing }, content()),
            el('button', {
                'className': 'destroy',
                'on:click': handleDelete,
                style: () => ({
                    opacity: isHovered() ? 1 : 0
                })
            })
        ),
        el('div', { 'className': 'input-container' },
            el('input', {
                id: 'edit-todo-input',
                type: 'text',
                'className': 'edit',
                'on:input': (e) => setEditText(e.target.value),
                'on:blur': cancelEditing,
                'on:keydown': (e) => {
                    if (e.key === 'Enter') finishEditing()
                }
            }),
            el('label', {
                'className': 'visually-hidden',
                htmlFor: 'edit-todo-input',
                textContent: 'Edit Todo Input'
            })
        ))
}