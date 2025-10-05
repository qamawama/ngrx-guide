export default {
    meta: {
        type: "problem",
        docs: {
            description: "Detect direct DOM manipulation in AngularJS",
            category: "Best Practices",
        },
        schema: [],
        messages: {
            directDom: "Avoid direct DOM manipulation (found '{{method}}'). Use Angular/React bindings instead.",
        },
    },

    create(context) {
        return {
            CallExpression(node) {
                // document.getElementById(...)
                if (
                    node.callee.type === "MemberExpression" &&
                    node.callee.object.name === "document"
                ) {
                    const method = node.callee.property.name;
                    if (["getElementById", "querySelector", "querySelectorAll"].includes(method)) {
                        context.report({
                            node,
                            messageId: "directDom",
                            data: { method: `document.${method}` },
                        });
                    }
                }

                // angular.element(...)
                if (
                    node.callee.type === "MemberExpression" &&
                    node.callee.object.name === "angular" &&
                    node.callee.property.name === "element"
                ) {
                    context.report({
                        node,
                        messageId: "directDom",
                        data: { method: "angular.element" },
                    });
                }
            },
        };
    },
};
