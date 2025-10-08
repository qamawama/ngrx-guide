export default {
    meta: {
        type: "problem",
        docs: {
            description: "Detects usage of $rootScope, which acts as a tight global coupling and directly conflicts with React's unidirectional data flow (props/Context API/Redux).",
            category: "Best Practices",
            severity: "CRITICAL_BLOCKER"
        },
        messages: {
            noRootScope: "Avoid using $rootScope. It causes tight coupling and makes migration harder."},
    },
    create(context) {
        return {
            Identifier(node) {
                if (node.name === "$rootScope") {
                    let usageType = 'Injection/General Use';
                    if (node.parent.type === 'MemberExpression' && node.parent.object === node) {
                        // $rootScope.property or $rootScope.$emit()
                        usageType = 'Property Access/Method Call';
                    } else if (node.parent.type === 'Property') {
                        usageType = 'Object Property';
                    }

                    context.report({
                        node,
                        messageId: "noRootScope",
                        data: {
                            issue: "ROOT_SCOPE_USAGE",
                            severity: "CRITICAL",
                            usageType: usageType,
                            codeSnippet: context.getSourceCode().getText(node.parent),
                        }
                    });
                }
            },
        };
    },
};
