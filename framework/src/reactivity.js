let activeEffect = null;
export function signal(initialValue) {
    let value = initialValue
    const subscribers = new Set()

    function read() {
        if (activeEffect) { subscribers.add(activeEffect) }
        return value
    }

    read.set = (newValue) => {
        value = newValue
        subscribers.forEach((subscriber) => { subscriber() })
    }

    return read
}

export function effect(fn) {
    activeEffect = fn
    fn()
    activeEffect = null
}

function computed(fn) {
  let cachedValue;
  let outdated = true;                // should we recompute?

  const observer = () => {
    cleanup(observer);
    activeEffect = observer;
    cachedValue = fn();            // compute new value
    activeEffect = null;
    outdated = false;
  };

  observer.deps = new Set();

  function read() {
    if (outdated) observer();         // recompute when needed
    return cachedValue;
  }

  // When dependencies change → mark as dirty, so next read recomputes
  const wrappedObserver = () => {
    outdated = true;
  };

  // Register wrappedObserver as dependent of the computed
  observer.wrapped = wrappedObserver;

  // Run once to establish dependencies
  observer();

  return read;
}

function batch() {

}
