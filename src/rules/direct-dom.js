const GLOBAL_DOM_OBJECTS = ["document", "window"];
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
                    node.callee.object && GLOBAL_DOM_OBJECTS.includes(node.callee.object.name)
                ) {
                    const method = node.callee.property.name;
                    if (["getElementById", "querySelector", "querySelectorAll", "createElement", "addEventListener", "removeEventListener"].includes(method)) {
                        context.report({
                            node,
                            messageId: "directDom",
                            data: {
                                method: `${node.callee.object.name}.${method}`,
                                issue: "NATIVE_DOM_ACCESS", // New issue name for reporting
                                severity: "CRITICAL",
                                codeSnippet: context.getSourceCode().getText(node),
                                }
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
                        data: {
                            method: "angular.element",
                            issue: "ANGULAR_ELEMENT_USAGE",
                            severity: "HIGH",
                            codeSnippet: context.getSourceCode().getText(node),
                        }
                    });
                }
            },
        };
    },
};
