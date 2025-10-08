export default {
    meta: {
        type: "problem",
        docs: {
            description: "Detects scope soup (too many $scope assignments)",
            category: "Best Practices",
            recommended: false
        },
        schema: [] // no options yet
    },
    create(context) {
        let scopeAssignments = [];

        return {
            AssignmentExpression(node) {
                // detect $scope.property = something
                if (
                    node.left.type === "MemberExpression" &&
                    node.left.object.name === "$scope"
                ) {
                    const propertyName = node.left.property.name;
                    if (propertyName && !propertyName.startsWith("$")) {
                        scopeAssignments.push(node);
                    }
                }
            },
            "Program:exit"() {
                const assignmentCount = scopeAssignments.length;
                if (assignmentCount > 5) {
                    let severity = 'LOW';
                    let messagePrefix = 'Moderate';

                    // Define Severity Tiers
                    if (assignmentCount >= 16) {
                        severity = 'CRITICAL';
                        messagePrefix = 'Critical';
                    } else if (assignmentCount >= 8) {
                        severity = 'HIGH';
                        messagePrefix = 'High';
                    } else {
                        severity = 'MEDIUM';
                    }

                    context.report({
                        // Report on the first detected assignment for context
                        node: scopeAssignments[0] || context.getScope().block,
                        message: `${messagePrefix} scope soup detected: ${assignmentCount} properties assigned to $scope.`,
                        data: {
                            issue: "SCOPE_SOUP",
                            severity: severity,
                            file: context.getFilename(),
                            count: assignmentCount,
                            locations: scopeAssignments.map(a => ({
                                line: a.loc.start.line,
                                column: a.loc.start.column
                            })),
                            // Show the first 3 or 5 properties for diagnostic context
                            topProperties: scopeAssignments.slice(0, 5).map(a => a.left.property.name)
                        }
                    });
                }

            }
        }
    }
};
