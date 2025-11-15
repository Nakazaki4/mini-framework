export function appContainer(addTask, clearCompleted) {

    return {
        tag: "section",
        props: {
            class: "todoapp",
            "data-v-app": ""
        },
        children: [
            {
                tag: "header",
                props: { class: "header" },
                children: [
                    {
                        tag: "a",
                        props: {
                            href: "#/",
                            "aria-current": "page",
                            class: "router-link-active router-link-exact-active"
                        },
                        children: [
                            { tag: "h1", props: {}, children: ["todos"] }
                        ]
                    },
                    {
                        tag: "input",
                        props: {
                            type: "text",
                            class: "new-todo",
                            autofocus: true,
                            autocomplete: "off",
                            placeholder: "What needs to be done?",
                            onKeydown: (e) => {
                                if (e.key === "Enter") {
                                    addTask(e.target)
                                };
                            }
                        },
                        children: []
                    }
                ]
            },

            {
                tag: "main",
                props: { class: "main", style: "display: none;" },
                children: [
                    {
                        tag: "div",
                        props: { class: "toggle-all-container" },
                        children: [
                            {
                                tag: "input",
                                props: {
                                    type: "checkbox",
                                    id: "toggle-all-input",
                                    class: "toggle-all",
                                    disabled: true,
                                },
                                children: []
                            },
                            {
                                tag: "label",
                                props: { for: "toggle-all-input", class: "toggle-all-label" },
                                children: [" Toggle All Input "]
                            }
                        ]
                    },
                    {
                        tag: "ul",
                        props: { class: "todo-list" },
                        children: []
                    }
                ]
            },

            {
                tag: "footer",
                props: { class: "footer", style: "display: none;" },
                children: [
                    {
                        tag: "span",
                        props: { class: "todo-count" },
                        children: [
                            { tag: "strong", props: {}, children: ["0"] },
                            " items left "
                        ]
                    },
                    {
                        tag: "ul",
                        props: { class: "filters" },
                        children: [
                            {
                                tag: "li",
                                props: {},
                                children: [
                                    {
                                        tag: "a",
                                        props: {
                                            href: "#/",
                                            "aria-current": "page",
                                            class:
                                                "router-link-active router-link-exact-active selected"
                                        },
                                        children: ["All"]
                                    }
                                ]
                            },
                            {
                                tag: "li",
                                props: {},
                                children: [
                                    { tag: "a", props: { href: "#/" }, children: ["Active"] }
                                ]
                            },
                            {
                                tag: "li",
                                props: {},
                                children: [
                                    { tag: "a", props: { href: "#/completed" }, children: ["Completed"] }
                                ]
                            }
                        ]
                    },
                    {
                        tag: "button",
                        props: {
                            class: "clear-completed",
                            style: "display: none;",
                            onCLick: clearCompleted
                        },
                        children: ["Clear Completed"]
                    }
                ]
            }
        ]
    };
}