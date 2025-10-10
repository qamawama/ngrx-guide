const DOM_METHODS = ['html', 'text', 'append', 'prepend', 'remove', 'addClass', 'removeClass', 'css', 'on', 'off'];
export default {
    meta: {
        type: "problem",
        docs: {
            description: "Detects jQuery usage which indicates tight coupling or direct DOM manipulation in AngularJS",},
        messages: {
            jqueryDetected: "[METRICS:{{metricsJson}}] Detected jQuery method '{{fullMethod}}'. Avoid direct DOM or AJAX handling — prefer AngularJS services (e.g., $http, $element).",
        },
    },

    create(context) {
        function reportViolation(node, method, fullMethod, severity) {
            const customMetrics = {
                method: method,
                issue: 'JQUERY_USAGE',
                severity: severity,
                file: context.getFilename(),
                codeSnippet: context.getSourceCode().getText(node),
                location: {
                    line: node.loc.start.line,
                    column: node.loc.start.column
                }
            };

            const metricsJson = JSON.stringify(customMetrics);

            context.report({
                node,
                messageId: "jqueryDetected",
                data: {
                    metricsJson: metricsJson,
                    fullMethod: fullMethod,
                },
            });
        }

        return {
            CallExpression(node) {
                if (node.callee.type === 'MemberExpression' && node.callee.object?.name === '$') {
                    const method = node.callee.property?.name;
                    if (method && ['ajax', 'get', 'post', 'ready'].includes(method)) {
                        reportViolation(node, method, `$.${method}()`, method === 'ajax' ? 'CRITICAL' : 'HIGH');
                    }
                    return;
                }

                if (node.callee.type === 'MemberExpression' && node.callee.property?.name) {
                    const method = node.callee.property.name;
                    if (DOM_METHODS.includes(method)) {
                        let base = 'jQuery(...)';

                        if (node.callee.object?.type === 'CallExpression' &&
                            (node.callee.object.callee.name === '$' || node.callee.object.callee.name === 'jQuery')) {
                            base = node.callee.object.callee.name;
                        }

                        const fullMethod = `${base}.${method}()`;
                        reportViolation(node, method, fullMethod, 'HIGH');
                    }
                }
            },
        };
    },
};