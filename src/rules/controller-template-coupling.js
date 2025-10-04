export default {
    meta: {
        type: "problem",
        docs: {
            description: "Detects controller–template coupling in AngularJS templates",
            category: "Best Practices",
        },
        schema: [],
    },
    create(context) {
        let bindingCount = 0;
        let methodRefs = [];

        return {
            // Matches HTML text nodes
            "HTMLElement > HTMLText"(node) {
                const value = node.value;

                if (!value) return;

                // Count bindings {{ ... }}
                bindingCount += (value.match(/{{/g) || []).length;

                // Detect direct method calls foo(…)
                const methodMatches = value.match(/\b\w+\s*\(/g) || [];
                methodRefs.push(...methodMatches);
            },

            // Matches HTML attributes
            "HTMLAttribute"(node) {
                if (!node.value || !node.value.value) return;

                const val = node.value.value;

                // Detect method calls in attributes
                const methodMatches = val.match(/\b\w+\s*\(/g) || [];
                methodRefs.push(...methodMatches);
            },

            "Program:exit"(node) {
                if (bindingCount > 5) {
                    context.report({
                        node,
                        message: `Template has ${bindingCount} bindings → possible controller–template coupling.`,
                    });
                }

                if (methodRefs.length > 0) {
                    context.report({
                        node,
                        message: `Template directly calls controller methods: ${methodRefs.join(", ")}.`,
                    });
                }
            },
        };
    },
};
