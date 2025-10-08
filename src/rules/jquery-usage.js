const DOM_METHODS = ['html','text','append','prepend','remove','addClass','removeClass','css','on','off'];
export default {
    meta: {
        type: "problem",
        docs: {
            description: "Detects jQuery usage which indicates tight coupling or direct DOM manipulation in AngularJS",
            category: "Best Practices",
            recommended: false,
        },
        schema: [],
    },

    create(context) {
        return {
            CallExpression(node) {
                // Detect $() or jQuery()
                if (
                    node.callee.type === "MemberExpression" &&
                    node.callee.object &&
                    (node.callee.object.name === "$" || node.callee.object.name === "jQuery")
                ) {
                    const method = node.callee.property.name;
                    const severity = DOM_METHODS.includes(method) ? 'CRITICAL_DOM_BLOCKER' : 'MEDIUM_UTILITY';

                    context.report({
                        node,
                        message:
                            `Detected jQuery method '$.${method}()'. Avoid direct DOM or AJAX handling — prefer AngularJS services (e.g., $http, $element).`,
                        data: {
                            method: method,
                            issue: 'JQUERY_USAGE',
                            severity: severity,
                            codeSnippet: context.getSourceCode().getText(node),
                        },
                        ruleId: "custom/jquery-usage",
                    });
                }

                // Detect $.something (e.g. $.ajax, $.on)
                if (
                    node.callee.type === "MemberExpression" &&
                    node.callee.object &&
                    node.callee.object.name === "$"
                ) {
                    const method = node.callee.property.name;
                    context.report({
                        node,
                        message:
                            `Detected jQuery method '$.${method}()'. Avoid direct DOM or AJAX handling — prefer AngularJS services (e.g., $http, $element).`,
                        ruleId: "custom/jquery-usage",
                    });
                }
            },
        };
    },
};
