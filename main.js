import { observable } from "./observable.js"

const button = document.getElementById('btn')
let count = observable(0)

count.subscribe((value) => { button.textContent = value })
function conditional() {
    count.subscribe((value) => {
        if (value % 3 == 0) {
            value = value + 10
            button.textContent = value
        }
    })
}

button.addEventListener('click', () => {
    count.unsubscribe(conditional)
    count.increment()
})

const title = document.getElementById('title')
let text = observable('Abdnour')

text.subscribe(modify)
function modify() {
    title.textContent = random
}
title.addEventListener('selectionchange', ()=>{
    text.
})