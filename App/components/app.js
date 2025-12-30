import { el } from "../../fromwork/src/dom.js"
import { currentFilter } from '../todo.js' // Import the filter signal

export function appContainer() {
}

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
    return el('footer', { className: 'footer' },
        el('span', { className: 'todo-count' },
            el('strong', {}, ''),
            " items left "
        ),
        el('ul', { className: 'filters' },
            // Make className reactive based on currentFilter signal
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
    return el('main', { className: 'main' },
        el('div', { className: 'toggle-all-container' },
            el('input', {
                className: 'toggle-all',
                id: 'toggle-all-input',
                type: 'checkbox'
            }),
            el('label', {
                className: 'toggle-all-label',
                for: 'toggle-all-input'
            })
        ),
        el('ul', { className: 'todo-list' },
            // TODO: Later, make this list reactive to filter
            // For now, it's just an empty list
        )
    )
}

function header() {
    return el('header', {
        className: 'header'
    }, el('a', {
        className: 'router-link-active router-link-exact-active',
        href: '#/'
    }, el('h1', {}, 'todos')
    ))
}