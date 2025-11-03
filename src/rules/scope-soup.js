import {getMigrationAdvice} from "../migration-guide.js";

export default {
    meta: {
        type: "problem",
        docs: {
            description: "Detects scope soup (data and function assignments to $scope)",
        },
        messages: {
            soupDetected: "[METRICS:{{metricsJson}}] {{severityText}} scope soup detected: {{totalOccurrences}} assignments to $scope ({{dataCount}} data, {{functionCount}} functions).",
        }
    },
    create(context) {
        let totalAssignments = 0;
        let dataAssignments = [];
        let functionAssignments = [];
        const uniqueProperties = new Set();
        const uniqueFunctions = new Set();

        return {
            AssignmentExpression(node) {
                if (
                    node.left.type === "MemberExpression" &&
                    node.left.object?.name === "$scope" &&
                    node.left.property?.name
                ) {
                    totalAssignments++;
                    const propName = node.left.property.name;
                    uniqueProperties.add(propName);

                    // Check if it's a function assignment
                    const isFunction =
                        node.right.type === "FunctionExpression" ||
                        node.right.type === "ArrowFunctionExpression";

                    const assignmentInfo = {
                        property: propName,
                        line: node.loc.start.line,
                        column: node.loc.start.column,
                        isFunction: isFunction,
                        node: node
                    };

                    if (isFunction) {
                        functionAssignments.push(assignmentInfo);
                        uniqueFunctions.add(propName);
                    } else {
                        dataAssignments.push(assignmentInfo);
                    }
                }
            },

            "Program:exit"(node) {
                if (totalAssignments > 0) {
                    let severity = 'LOW';
                    if (totalAssignments >= 10) {
                        severity = 'CRITICAL';
                    } else if (totalAssignments >= 5) {
                        severity = 'HIGH';
                    } else if (totalAssignments >= 3) {
                        severity = 'MEDIUM';
                    }

                    const severityText =
                        severity === 'CRITICAL' ? 'Extreme' :
                            severity === 'HIGH' ? 'Severe' :
                                severity === 'MEDIUM' ? 'Moderate' : 'Minor';

                    const customMetrics = {
                        issue: "SCOPE_SOUP",
                        severity: severity,
                        totalOccurrences: totalAssignments,
                        dataAssignments: dataAssignments.length,
                        functionAssignments: functionAssignments.length,
                        uniqueProperties: [...uniqueProperties],
                        uniqueFunctions: [...uniqueFunctions],
                        assignments: {
                            data: dataAssignments.map(a => ({
                                property: a.property,
                                line: a.line,
                                column: a.column
                            })),
                            functions: functionAssignments.map(a => ({
                                function: a.property,
                                line: a.line,
                                column: a.column
                            }))
                        },
                        migrationAdvice: getMigrationAdvice("scopeSoupUsage", {
                            totalOccurrences: totalAssignments,
                            dataAssignments: dataAssignments.length,
                            functionAssignments: functionAssignments.length,
                            uniqueProperties: [...uniqueProperties],
                            uniqueFunctions: [...uniqueFunctions]
                        })
                    };

                    const metricsJson = JSON.stringify(customMetrics);

                    context.report({
                        node: dataAssignments[0]?.node || functionAssignments[0]?.node || node,
                        messageId: 'soupDetected',
                        data: {
                            metricsJson: metricsJson,
                            severityText: severityText,
                            totalOccurrences: totalAssignments,
                            dataCount: dataAssignments.length,
                            functionCount: functionAssignments.length
                        }
                    });
                }
            },
        };
    },
};