# mini-framework

A lightweight, dependency-free JavaScript framework built from scratch — plus a TodoMVC-style demo app that uses it.

The framework, called **fromwork**, implements the core ideas behind modern reactive UI libraries (signals-based reactivity, a virtual DOM with keyed diffing, event delegation, and a hash-based router) in plain ES modules, with no build step and no external dependencies.

## Repository layout

```
mini-framework/
├── fromwork/              # The framework itself
│   ├── index.js           # Public entry point (re-exports everything)
│   ├── README.md          # Full framework documentation & API reference
│   └── src/
│       ├── reactivity.js  # signal, computed, effect, autoBatchEvents
│       ├── dom.js         # el, createElement, enableAutoCleanup (virtual DOM)
│       ├── events.js      # delegate (event delegation)
│       └── router.js      # hash router with route groups
│
└── App/                   # Example app: a TodoMVC built with fromwork
    ├── index.html
    ├── todo.js            # App entry point
    ├── store.js           # Shared reactive state (todos, filter)
    ├── index.css
    └── components/
        ├── app.js
        └── task.js
```

## Features

**Reactivity** (`reactivity.js`)
- `signal()` — fine-grained reactive state, read/write as a `[getter, setter]` pair.
- `computed()` — cached, lazily-evaluated derived values.
- `effect()` — side effects that auto-track their dependencies and re-run when they change.
- `autoBatchEvents()` — batches multiple updates in the same event into a single re-render.

**Virtual DOM** (`dom.js`)
- `el(tag, attrs, ...children)` — declarative element creation.
- Reactive attributes: pass a function (e.g. `textContent: () => count()`) and it updates automatically.
- Keyed list diffing — list items use a `key` so the DOM is patched, not rebuilt.
- `enableAutoCleanup()` — automatically tears down effects and listeners when elements are removed, preventing memory leaks.

**Events** (`events.js`)
- `delegate()` — event delegation via a single listener on a parent element.
- Declarative handlers on elements using the `on:click` / `on:input` syntax.

**Routing** (`router.js`)
- Hash-based router (`#/path`) with `addRoute`, `navigate`, `isActive`, and `currentRoute`.
- Route groups that preserve DOM when switching between related routes (useful for tabs and filters).

## Getting started

The project uses native ES modules, so it must be served over HTTP — opening `index.html` directly with `file://` will break the module imports.

From the repository root:

```bash
# Python 3
python3 -m http.server 8000

# or Node
npx serve
```

Then open the demo app:

```
http://localhost:8000/App/index.html
```

## Quick example

```javascript
import { signal } from './fromwork/src/reactivity.js'
import { el, enableAutoCleanup } from './fromwork/src/dom.js'
import { router } from './fromwork/src/router.js'

enableAutoCleanup()
router.initRouter(document.getElementById('app'))

const [count, setCount] = signal(0)

router.addRoute('/', () =>
  el('div', {},
    el('h1', { textContent: () => `Count: ${count()}` }),
    el('button', {
      textContent: 'Increment',
      'on:click': () => setCount(prev => prev + 1)
    })
  )
)
```

A few rules to keep in mind:

- **Read signals as functions** — `count()`, not `count`.
- **Don't mutate signal values** — always set a new value/object (`setTodos([...todos(), item])`).
- **Give every list item a unique `key`** so the diffing works correctly.
- **Use the `on:event` prefix** for handlers, not `onclick`.

Full API documentation, with detailed examples and common pitfalls, lives in [`fromwork/README.md`](./fromwork/README.md).

## The demo app

`App/` is a TodoMVC-style task manager that exercises the whole framework: shared reactive state in `store.js` (the todo list and the active filter), reusable components in `components/`, and the router driving the `all` / `active` / `completed` views. It's the best place to see how the pieces fit together in practice.
