export default {
    meta: {
        type: "problem",
        docs: {
            description: "Detects scope soup (too many $scope assignments)",},
        messages: {
            soupDetected: "[METRICS:{{metricsJson}}] {{prefix}} scope soup detected: {{count}} properties assigned to $scope.",
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
                        issue: "SCOPE_SOUP",
                        severity: severity,
                        count: assignmentCount,
                        file: context.getFilename(),
                        locations: scopeAssignments.map(a => ({
                            line: a.loc.start.line,
                            column: a.loc.start.column
                        })),
                        topProperties: scopeAssignments.slice(0, 5).map(a => a.left.property.name)
                    };

                    const metricsJson = JSON.stringify(customMetrics);

                    context.report({
                        node: scopeAssignments[0] || context.getSourceCode().ast,
                        messageId: 'soupDetected',
                        data: {
                            metricsJson: metricsJson,
                            prefix: messagePrefix,
                            count: assignmentCount,
                        }
                    });
                }
            },
        };
    },
};