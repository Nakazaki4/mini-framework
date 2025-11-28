export function createElement(vnode) {
    if (typeof vnode === 'function') {
        const textNode = document.createTextNode(vnode);
        effect(()=>{
            textNode.textContent = vnode()
        })
        return textNode
    }
}

function setAttribute(el, key, value) {
    
}


// h('p', {}, () => `Hello ${name()}`)