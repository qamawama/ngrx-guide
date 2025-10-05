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
            // Detect text nodes with AngularJS interpolation
            Text(node) {
                const value = node.value?.trim();
                if (!value) return;

                // Count AngularJS bindings {{ ... }}
                const bindings = value.match(/{{/g);
                if (bindings) bindingCount += bindings.length;

                // Detect method calls like foo()
                const methods = value.match(/\b\w+\s*\(/g);
                if (methods) methodRefs.push(...methods);
            },

            // Detect AngularJS-related attributes
            Attribute(node) {
                const attrName = node.key?.value || "";
                const attrVal = node.value?.value || "";

                // ng-* attributes are bindings
                if (attrName.startsWith("ng-")) {
                    bindingCount++;
                }

                // Detect controller method calls in attributes
                const methods = attrVal.match(/\b\w+\s*\(/g);
                if (methods) methodRefs.push(...methods);
            },

            "Program:exit"(node) {
                const file = context.getFilename();

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
