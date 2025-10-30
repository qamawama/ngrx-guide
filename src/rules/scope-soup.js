import {getMigrationAdvice} from "../migration-guide.js";

export default {
    meta: {
        type: "problem",
        docs: {
            description: "Detects scope soup (too many $scope assignments)",},
        messages: {
            soupDetected: "[METRICS:{{metricsJson}}] {{prefix}} scope soup detected: {{totalOccurrences}} properties assigned to $scope.",
        }
    },
    create(context) {
        let assignmentCount = 0;
        const scopeAssignments = [];
        let severity = 'LOW';

        return {
            AssignmentExpression(node) {
                if (
                    node.left.type === "MemberExpression" &&
                    node.left.object?.name === "$scope" &&
                    node.left.property?.name
                ) {
                    assignmentCount++;
                    scopeAssignments.push(node);
                }
            },

            "Program:exit"() {
                if (assignmentCount > 0) {
                    if (assignmentCount >= 10) {
                        severity = 'CRITICAL';
                    } else if (assignmentCount >= 5) {
                        severity = 'HIGH';
                    } else if (assignmentCount >= 3) {
                        severity = 'MEDIUM';
                    }

                    const messagePrefix = severity === 'CRITICAL' ? 'Extreme' : (severity === 'HIGH' ? 'Severe' : (severity === 'MEDIUM' ? 'Moderate' : 'Minor'));
                    const customMetrics = {
                        issue: "Scope soup",
                        severity: severity,
                        totalOccurrences: assignmentCount,
                        locations: scopeAssignments.map(a => ({
                            scopeAssignment: a.left.property.name,
                            line: a.loc.start.line,
                            column: a.loc.start.column
                        })),
                        migrationGuide: getMigrationAdvice("scopeSoupUsage", {
                            totalOccurrences: assignmentCount,
                            scopeAssignments: scopeAssignments,
                        })
                    };

                    const metricsJson = JSON.stringify(customMetrics);

                    context.report({
                        node: scopeAssignments[0] || context.getSourceCode().ast,
                        messageId: 'soupDetected',
                        data: {
                            metricsJson: metricsJson,
                            prefix: messagePrefix,
                            totalOccurrences: assignmentCount,
                        }
                    });
                }
            },
        };
    },
};