import {getMigrationAdvice} from "../migration-guide.js";

export default {
    meta: {
        type: "problem",
        docs: {
            description: "Detects usage of $rootScope, which acts as a tight global coupling and directly conflicts with React's unidirectional data flow (props/Context API/Redux).",
        },
        messages: {
            noRootScope: "[METRICS:{{metricsJson}}] Found {{totalCount}} $rootScope usage(s)",
        },
    },
    create(context) {
        let occurrences = [];
        let occurrenceCount = {
            total: 0,
            injection: 0,
            assignment: 0,
            read: 0
        };

        return {
            Identifier(node) {
                if (node.name === "$rootScope") {
                    let usageType = 'Read';

                    if (node.parent.type === "MemberExpression" &&
                        node.parent.object === node &&
                        node.parent.parent.type === "AssignmentExpression") {
                        usageType = 'Assignment';
                    } else if (node.parent.type === "CallExpression" &&
                        node.parent.callee === node) {
                        usageType = 'FunctionCall';
                    }

                    occurrences.push({
                        node,
                        usageType,
                        line: node.loc.start.line,
                        column: node.loc.start.column,
                        codeSnippet: context.getSourceCode().getText(node.parent)
                    });
                }
            },

            "Program:exit"(node) {
                occurrenceCount.total = occurrences.length;
                occurrenceCount.injection = occurrences.filter(occ =>
                    occ.usageType === 'Read' && occ.node.parent.type === 'VariableDeclarator'
                ).length;
                occurrenceCount.assignment = occurrences.filter(occ =>
                    occ.usageType === 'Assignment'
                ).length;
                occurrenceCount.read = occurrences.filter(occ =>
                    occ.usageType === 'Read' && occ.usageType !== 'Assignment' && occ.usageType !== 'FunctionCall'
                ).length;

                if (occurrenceCount.total > 0) {
                    const customMetrics = {
                        issue: "Root scope usage",
                        severity: occurrenceCount.total >= 3 ? "CRITICAL" : occurrenceCount.total >= 2 ? "HIGH" : "MEDIUM",
                        totalOccurrences: occurrenceCount.total,
                        countByCategory: {
                            injection: occurrenceCount.injection,
                            assignment: occurrenceCount.assignment,
                            read: occurrenceCount.read
                        },
                        locations: occurrences.map(occ => ({
                            type: occ.usageType,
                            line: occ.line,
                            column: occ.column,
                            codeSnippet: occ.codeSnippet
                        })),
                        migrationGuide: getMigrationAdvice("rootScopeUsage", {
                            totalOccurrences: occurrenceCount.total,
                            breakdown: {
                                assignment: occurrenceCount.assignment,
                                injection: occurrenceCount.injection,
                                read: occurrenceCount.read
                            }
                        }),
                    };

                    const metricsJson = JSON.stringify(customMetrics);

                    context.report({
                        node,
                        messageId: "noRootScope",
                        data: {
                            metricsJson: metricsJson,
                            totalCount: occurrenceCount.total
                        }
                    });
                }
            }
        };
    },
};