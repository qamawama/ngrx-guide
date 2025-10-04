import { parse } from 'angular-html-parser';

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
        // Only run this on .html files
        if (!context.getFilename().endsWith(".html")) {
            return {};
        }

        return {
            Program(node) {
                const sourceCode = context.getSourceCode().text;
                const { rootNodes } = parse(sourceCode);

                let bindingCount = 0;
                let methodRefs = [];

                function walk(nodes) {
                    for (const n of nodes) {
                        // Interpolations like {{ ctrl.something }}
                        if (n.value && n.value.includes("{{")) {
                            bindingCount += (n.value.match(/{{/g) || []).length;
                            const methodMatches = n.value.match(/\b\w+\s*\(/g) || [];
                            methodRefs.push(...methodMatches);
                        }

                        // Attributes like ng-click="ctrl.doSomething()"
                        if (n.attrs) {
                            for (const attr of n.attrs) {
                                if (attr.value && attr.value.includes("(")) {
                                    methodRefs.push(attr.value);
                                }
                            }
                        }

                        if (n.children) walk(n.children);
                    }
                }

                walk(rootNodes);

                // Rule 1: Too many bindings → smells like coupling
                if (bindingCount > 5) {
                    context.report({
                        node,
                        message: `Template has ${bindingCount} bindings → possible controller–template coupling.`,
                    });
                }

                // Rule 2: Direct method calls
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
