export default {
    meta: {
        type: "problem",
        docs: {
            description: "Detects jQuery usage which indicates tight coupling or direct DOM manipulation in AngularJS",
            category: "Best Practices",
            recommended: false,
        },
        schema: [],
    },

    create(context) {
        return {
            CallExpression(node) {
                // Detect $() or jQuery()
                if (
                    (node.callee.name === "$" || node.callee.name === "jQuery")
                ) {
                    context.report({
                        node,
                        message:
                            "Detected jQuery usage ('{{name}}'). Consider using AngularJS's jqLite or directives instead of direct DOM manipulation.",
                        data: { name: node.callee.name },
                        ruleId: "custom/jquery-usage",
                    });
                }

                // Detect $.something (e.g. $.ajax, $.on)
                if (
                    node.callee.type === "MemberExpression" &&
                    node.callee.object &&
                    node.callee.object.name === "$"
                ) {
                    const method = node.callee.property.name;
                    context.report({
                        node,
                        message:
                            `Detected jQuery method '$.${method}()'. Avoid direct DOM or AJAX handling — prefer AngularJS services (e.g., $http, $element).`,
                        ruleId: "custom/jquery-usage",
                    });
                }
            },
        };
    },
};
