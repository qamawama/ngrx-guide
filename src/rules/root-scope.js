export default {
    meta: {
        type: "problem",
        docs: {
            description: "Detects usage of $rootScope, which acts as a tight global coupling and directly conflicts with React's unidirectional data flow (props/Context API/Redux).",},
        messages: {
            noRootScope: "[METRICS:{{metricsJson}}] Avoid using $rootScope. It causes tight coupling and makes migration harder.",
        },
    },
    create(context) {
        return {
            Identifier(node) {
                if (node.name === "$rootScope") {
                    const isAssignment = node.parent.type === "MemberExpression" && node.parent.object === node && node.parent.parent.type === "AssignmentExpression";
                    const usageType = isAssignment ? 'Assignment' : 'Read/Injection';

                    const customMetrics = {
                        issue: "ROOT_SCOPE_USAGE",
                        severity: "CRITICAL",
                        usageType: usageType,
                        file: context.getFilename(),
                        codeSnippet: context.getSourceCode().getText(node.parent),
                        location: {
                            line: node.loc.start.line,
                            column: node.loc.start.column
                        }
                    };

                    const metricsJson = JSON.stringify(customMetrics);

                    context.report({
                        node,
                        messageId: "noRootScope",
                        data: {
                            metricsJson: metricsJson,
                        }
                    });
                }
            }
        };
    },
};