export default {
    meta: {
        type: "problem",
        docs: {
            description: "Disallow usage of $rootScope (tight coupling)",
            category: "Best Practices",
        },
        messages: {
            noRootScope: "Avoid using $rootScope. It causes tight coupling and makes migration harder.",
        },
    },
    create(context) {
        return {
            Identifier(node) {
                if (node.name === "$rootScope") {
                    context.report({
                        node,
                        messageId: "noRootScope",
                    });
                }
            },
        };
    },
};
