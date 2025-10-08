export default {
    meta: {
        type: "problem",
        docs: {
            // Revised description to focus on imperative logic
            description: "Detects imperative logic and functions defined directly on $scope, which indicate strong controller–scope coupling and hinder component extraction.",
            category: "Best Practices",
        },
        schema: [],
    },
    create(context) {
        let scopeFunctions = 0;
        const definedFunctions = new Set(); // Stores the names of the functions

        return {
            AssignmentExpression(node) {
                // Ensure we are checking $scope.fn = ...
                if (
                    node.left.type === "MemberExpression" &&
                    node.left.object?.name === "$scope"
                ) {
                    // Check if the right side is a function definition
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
                if (scopeFunctions > 0) { // Any assigned function is a smell
                    // Define a severity based on the number of functions
                    const severity = scopeFunctions >= 3 ? 'CRITICAL' : 'HIGH';

                    context.report({
                        node,
                        message: `Controller defines ${scopeFunctions} imperative $scope functions. These must be extracted into services/React hooks.`,
                        data: {
                            issue: "CONTROLLER_SCOPE_FUNCTIONS",
                            severity: severity, // <-- KEY FYP METRIC
                            functionCount: scopeFunctions,
                            functions: [...definedFunctions],
                        }
                    });
                }
            },
        };
    },
};