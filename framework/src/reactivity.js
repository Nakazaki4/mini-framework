let activeEffect = null;

export function signal(initialValue) {
  let value = initialValue;
  const subscribers = new Set();

  function sig() {
    if (activeEffect) {
      if (activeEffect.wrappedObserver) {
        subscribers.add(activeEffect.wrappedObserver);
        activeEffect.deps.add(sig);
      } else {
        subscribers.add(activeEffect);
      }
    }
    return value;
  }

  sig.subscribers = subscribers;

  sig.set = (newValue) => {
    value = newValue;
    subscribers.forEach(sub => schedule(sub, false));
  };

  return sig;
}


export function effect(fn) {
  activeEffect = fn
  fn()
  activeEffect = null
}

function cleanup(observer) {
  for (const sig of observer.deps) {
    sig.subscribers.delete(observer.wrappedObserver)
  }
  observer.deps.clear()
}

function computed(fn) {
  let cachedValue;
  let outdated = true;

  const observer = () => {
    cleanup(observer);
    activeEffect = observer;
    try {
      cachedValue = fn();
    } finally {
      activeEffect = null;
      outdated = false;
    }
  };

  observer.deps = new Set();

  function read() {
    if (outdated) observer();
    return cachedValue;
  }

  const wrappedObserver = () => {
    outdated = true;
  };

  observer.wrappedObserver = wrappedObserver;

  observer();

  return read;
}

let effectQueue = new Set(); // microtask
let frameQueue = new Set(); // RAF
let frameScheduled = false;
let effectScheduled = false;

function schedule(fn, frame = false) {
  if (frame) {
    frameQueue.add(fn)

    if (!frameScheduled) {
      frameScheduled = true
      requestAnimationFrame(() => {
        const jobs = Array.from(frameQueue)
        frameQueue.clear();
        frameScheduled = false
        jobs.forEach(job => job())
      })
    }
  } else {
    effectQueue.add(fn)
    if (!effectScheduled) {
      effectScheduled = true
      queueMicrotask(() => {
        const jobs = Array.from(effectQueue)
        effectQueue.clear();
        effectScheduled = false
        jobs.forEach(job => job())
      })
    }
  }
}

// Auto-batch RAF
const originalRAF = window.requestAnimationFrame;
window.requestAnimationFrame = function (callback) {
  return originalRAF.call(window, (timestamp) => {
    schedule(() => callback(timestamp), true);
  });
};

// Auto-batch events (optional - user calls once)
export function autoBatchEvents() {
  const originalAddEventListener = EventTarget.prototype.addEventListener;

  EventTarget.prototype.addEventListener = function (type, listener, options) {
    const wrappedListener = function (event) {
      schedule(() => listener.call(this, event));
    };

    return originalAddEventListener.call(this, type, wrappedListener, options);
  };
}