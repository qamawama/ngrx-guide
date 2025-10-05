export default {
    meta: {
        type: "problem",
        docs: {
            description: "Detects strong coupling between AngularJS controllers and $scope",
            category: "Best Practices",
        },
        schema: [],
    },
    create(context) {
        let scopeAssignments = 0;
        let scopeFunctions = 0;
        const assignedProps = new Set();
        const definedFuncs = new Set();

        return {
            AssignmentExpression(node) {
                // Detect $scope.property = ...
                if (
                    node.left.type === "MemberExpression" &&
                    node.left.object?.name === "$scope"
                ) {
                    scopeAssignments++;

                    const propName = node.left.property?.name || "(unknown)";
                    assignedProps.add(propName);

                    // Detect $scope.fn = function() { ... }
                    if (
                        node.right.type === "FunctionExpression" ||
                        node.right.type === "ArrowFunctionExpression"
                    ) {
                        scopeFunctions++;
                        definedFuncs.add(propName);
                    }
                }
            },

            "Program:exit"(node) {
                if (scopeAssignments > 5) {
                    context.report({
                        node,
                        message: `Controller has ${scopeAssignments} $scope bindings → strong controller–scope coupling detected.`,
                    });
                }

                if (scopeFunctions > 0) {
                    context.report({
                        node,
                        message: `Controller defines ${scopeFunctions} $scope functions: ${[
                            ...definedFuncs,
                        ].join(", ")}.`,
                    });
                }
            },
        };
    },
};
