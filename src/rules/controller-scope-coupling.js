export default {
    meta: {
        type: "problem",
        docs: {
            description: "Detects imperative logic and functions defined directly on $scope, which indicate strong controller–scope coupling and hinder component extraction.",
        },
        messages: {
            couplingDetected: "[METRICS:{{metricsJson}}] Controller defines {{functionCount}} imperative $scope functions. These must be extracted into services/React hooks.",
        }
    },
    create(context) {
        let scopeFunctions = 0;
        const definedFunctions = new Set();

        return {
            AssignmentExpression(node) {
                if (
                    node.left.type === "MemberExpression" &&
                    node.left.object?.name === "$scope"
                ) {
                    if (
                        node.right.type === "FunctionExpression" ||
                        node.right.type === "ArrowFunctionExpression"
                    ) {
                        scopeFunctions++;
                        const propName = node.left.property?.name || "(unknown)";
                        definedFunctions.add(propName);
                    }
                }
            },

            "Program:exit"(node) {
                if (scopeFunctions > 0) {
                    const severity = scopeFunctions >= 3 ? 'CRITICAL' : 'HIGH';

                    const customMetrics = {
                        issue: "CONTROLLER_SCOPE_FUNCTIONS",
                        severity: severity,
                        functionCount: scopeFunctions,
                        functions: [...definedFunctions],
                        file: context.getFilename(),
                        location: {
                            line: node.loc.start.line,
                            column: node.loc.start.column
                        }
                    };

                    const metricsJson = JSON.stringify(customMetrics);

                    context.report({
                        node,
                        messageId: 'couplingDetected',
                        data: {
                            metricsJson: metricsJson,
                            functionCount: scopeFunctions,
                        }
                    });
                }
            },
        };
    },
};