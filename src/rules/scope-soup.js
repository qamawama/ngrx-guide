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
                    scopeAssignments.push(node);
                }
            },
            "Program:exit"() {
                if (scopeAssignments.length > 3) {
                    context.report({
                        node: scopeAssignments[0],
                        message: `Possible scope soup detected: ${scopeAssignments.length} properties assigned to $scope`,
                        data: {
                            issue: "scope-soup",
                            file: context.getFilename(),
                            count: scopeAssignments.length,
                            locations: scopeAssignments.map(a => ({
                                line: a.loc.start.line,
                                column: a.loc.start.column
                            }))
                        }
                    });
                }
            },
        };
    },
};
