import {getMigrationAdvice} from "../migration-guide.js";

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
        let scopeFunctionsCount = 0;
        let scopeFunctions = [];
        const uniqueFunctions = new Set();

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
                        scopeFunctionsCount++;
                        const propName = node.left.property?.name || "(unknown)";
                        scopeFunctions.push({
                            scopeFunction: propName,
                            line: node.loc.start.line,
                            column: node.loc.start.column,
                            node: node
                        });
                        uniqueFunctions.add(propName);
                    }
                }
            },

            "Program:exit"(node) {
                if (scopeFunctionsCount > 0) {
                    const severity = scopeFunctionsCount >= 3 ? 'CRITICAL' : 'HIGH'; // Fixed: use scopeFunctionsCount

                    const customMetrics = {
                        issue: "Controller-scope coupling",
                        severity: severity,
                        totalOccurrences: scopeFunctionsCount,
                        locations: scopeFunctions.map(occ => ({
                            function: occ.scopeFunction,
                            line: occ.line,
                            column: occ.column
                        })),
                        migrationAdvice: getMigrationAdvice("controllerScopeCoupling", {
                            totalOccurrences: scopeFunctionsCount,
                            uniqueFunctions: [...uniqueFunctions],
                        }),
                    };

                    const metricsJson = JSON.stringify(customMetrics);

                    context.report({
                        node,
                        messageId: 'couplingDetected',
                        data: {
                            metricsJson: metricsJson,
                            functionCount: scopeFunctionsCount,
                        }
                    });
                }
            },
        };
    },
};