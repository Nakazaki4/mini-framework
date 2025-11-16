export function createTask(text, toggleFn, deleteFn) {
    return {
        tag: "li",
        props: {
            class: ""
        },
        children: [
            {
                tag: "div",
                props: {
                    class: "view"
                },
                children: [
                    {
                        tag: "input",
                        props: {
                            type: "checkbox",
                            class: "toggle",
                            onClick: toggleFn
                        },

                    },
                    {
                        tag: "label",
                        children: [text]
                    },
                    {
                        tag: "button",
                        props: {
                            class: "destroy",
                            onClick: deleteFn
                        }
                    }
                ]
            },
            {
                tag: "div",
                props: {
                    class: "input-container"
                },
                children: [
                    {
                        tag: "input",
                        props: {
                            id: "edit-todo-input",
                            type: "text",
                            class: "edit"
                        }
                    },
                    {
                        tag: "label",
                        props: {
                            class: "visually-hidden",
                            for: "edit-todo-input"
                        },
                        children: ["Edit Todo Input"]
                    }
                ]
            }
        ]
    }
}