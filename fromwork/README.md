# Reactive Framework Documentation

## Quick Start

```javascript
import { signal, computed, effect, autoBatchEvents } from './reactivity.js'
import { el, createElement, enableAutoCleanup } from './dom.js'
import { router } from './router.js'

// Initialize (call once)
autoBatchEvents()
enableAutoCleanup()
router.initRouter(document.getElementById('app'))

// Create state
const [count, setCount] = signal(0)

// Define route
router.addRoute('/', () => {
  return el('div', {},
    el('h1', { textContent: () => `Count: ${count()}` }),
    el('button', {
      textContent: 'Increment',
      'on:click': () => setCount(prev => prev + 1)
    })
  )
})
```

---

## Reactivity

### signal()
```javascript
const [count, setCount] = signal(0)

console.log(count())      // Read: 0
setCount(5)               // Write: set to 5
setCount(prev => prev + 1) // Write: updater function
```

**⚠️ Always call signals as functions:** `count()` not `count`

### computed()
```javascript
const [first, setFirst] = signal('John')
const [last, setLast] = signal('Doe')

const fullName = computed(() => `${first()} ${last()}`)
console.log(fullName()) // "John Doe"
```

Computed values are cached and lazy-evaluated.

### effect()
```javascript
const cleanup = effect(() => {
  console.log(`Count is: ${count()}`)
})

// Later: cleanup()
```

Effects auto-track dependencies and re-run when they change. **Always cleanup when done.**

### autoBatchEvents()
```javascript
autoBatchEvents() // Call once at app start
```

Batches signal updates automatically. Multiple updates in same event = one re-render.

---

## DOM

### el()
```javascript
el('div', { className: 'container' },
  el('h1', { textContent: 'Title' }),
  el('p', { textContent: 'Description' })
)
```

**Structure:** `el(tag, attributes, ...children)`

### Reactive Attributes
```javascript
const [active, setActive] = signal(false)

el('button', {
  className: () => active() ? 'active' : 'inactive',
  disabled: () => !active(),
  textContent: () => `Status: ${active() ? 'ON' : 'OFF'}`
})
```

Pass functions to make attributes reactive.

### Event Handlers
```javascript
el('button', {
  'on:click': (e) => setCount(prev => prev + 1),
  'on:input': (e) => console.log(e.target.value)
})
```

**⚠️ Use `on:eventName` format, NOT `onclick`**

### List Rendering
```javascript
const [items, setItems] = signal([
  { id: 1, text: 'Item 1' },
  { id: 2, text: 'Item 2' }
])

el('ul', {},
  () => items().map(item => 
    el('li', { 
      key: item.id,  // REQUIRED
      textContent: item.text 
    })
  )
)
```

**⚠️ CRITICAL: Every list item MUST have a unique `key`**

Why?
- Without keys, elements are recreated on every update
- Loses component state (inputs, scroll position)
- Bad performance

```javascript
// ❌ WRONG: No key
() => items().map(item => el('li', { textContent: item.text }))

// ❌ WRONG: Array index as key
() => items().map((item, i) => el('li', { key: i, textContent: item.text }))

// ✅ CORRECT: Stable unique ID
() => items().map(item => el('li', { key: item.id, textContent: item.text }))
```

### enableAutoCleanup()
```javascript
enableAutoCleanup() // Call once at app start
```

Auto-cleans effects/listeners when DOM elements are removed. Prevents memory leaks.

---

## Routing

### Setup
```javascript
router.initRouter(document.getElementById('app'))

router.addRoute('/', () => {
  return el('div', { textContent: 'Home' })
})

router.addRoute('/about', () => {
  return el('div', { textContent: 'About' })
})
```

### Navigation
```javascript
router.navigate('/about')

// Or with links
el('a', {
  href: '#/about',
  'on:click': (e) => {
    e.preventDefault()
    router.navigate('/about')
  }
})
```

### Active Route
```javascript
el('a', {
  className: () => router.isActive('/') ? 'active' : ''
})
```

### Route Groups
```javascript
router
  .addRoute('/settings/profile', () => settingsPage(), 'settings')
  .addRoute('/settings/notifications', () => settingsPage(), 'settings')
```

Routes in same group preserve DOM when switching between them. Use for tabs/multi-step forms.

---

## Critical Warnings

### 1. Always Use Keys in Lists
```javascript
// ❌ WRONG
() => items().map(item => el('div', { textContent: item.name }))

// ✅ CORRECT
() => items().map(item => el('div', { key: item.id, textContent: item.name }))
```

### 2. Call Signals as Functions
```javascript
// ❌ WRONG
if (count > 5) { }

// ✅ CORRECT
if (count() > 5) { }
```

### 3. Use Event Prefix
```javascript
// ❌ WRONG
el('button', { onclick: handler })

// ✅ CORRECT
el('button', { 'on:click': handler })
```

### 4. Don't Mutate Signal Values
```javascript
const [user, setUser] = signal({ name: 'Alice', age: 30 })

// ❌ WRONG - doesn't trigger updates
user().age = 31

// ✅ CORRECT - create new object
setUser(prev => ({ ...prev, age: 31 }))
```

### 5. Initialize in Correct Order
```javascript
// ✅ CORRECT
autoBatchEvents()
enableAutoCleanup()
router.initRouter(document.getElementById('app'))
// Now add routes and render
```

---

## API Reference

### Reactivity
- `signal(initialValue)` → `[read, write]` - Create reactive signal
- `computed(fn)` → `read` - Create cached computed value
- `effect(fn)` → `cleanup` - Create auto-tracking effect
- `autoBatchEvents()` - Enable automatic batching (call once)

### DOM
- `el(tag, attrs, ...children)` - Create virtual node
- `createElement(vnode)` - Render to DOM element
- `enableAutoCleanup()` - Enable auto cleanup (call once)

### Router
- `router.initRouter(rootElement)` - Initialize router
- `router.addRoute(path, handler, group?)` - Add route
- `router.navigate(path)` - Navigate to path
- `router.isActive(path)` - Check if route is active
- `router.currentRoute()` - Get current path

### Events
- `delegate(parent, selector, type, handler)` - Create delegated listener (returns cleanup function)

---

## Common Mistakes

```javascript
// 1. Forgetting to call signals
const value = count     // ❌ Function reference
const value = count()   // ✅ Actual value

// 2. Mutating arrays
items().push(4)                    // ❌ Doesn't trigger update
setItems(prev => [...prev, 4])     // ✅ Triggers update

// 3. Missing keys
() => items().map(item => el('div', {}, item.text))          // ❌
() => items().map(item => el('div', { key: item.id }, ...))  // ✅

// 4. Creating effects in render
function Component() {
  effect(() => console.log('runs'))  // ❌ Memory leak
  return el('div', {})
}

// 5. Not cleaning up
const cleanup = effect(() => { ... })
// Never calls cleanup()  // ❌ Memory leak
```