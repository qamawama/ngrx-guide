const DOM_OBJECTS = ["document", "window"];
const NATIVE_DOM_METHODS = [
    "getElementById",
    "querySelector",
    "querySelectorAll",
    "createElement",
    "addEventListener",
    "removeEventListener",
];

export default {
    meta: {
        type: "problem",
        docs: {
            description: "Disallow direct DOM manipulation (Native APIs or angular.element)",
        },
        messages: {
            nativeDom: `[METRICS:{{metricsJson}}] Avoid direct DOM manipulation (found '{{method}}'). Use Angular/React bindings instead.`,
            angularElement: `[METRICS:{{metricsJson}}] Avoid using 'angular.element'. This bypasses component lifecycle and leads to difficult migration.`,
        },
    },

    create(context) {
        function reportIssue(node, issue, severity, method) {
            const customMetrics = {
                issue: issue,
                severity: severity,
                method: method,
                file: context.getFilename(),
                codeSnippet: context.getSourceCode().getText(node),
            };

            const metricsJson = JSON.stringify(customMetrics);

            const messageId = issue === "NATIVE_DOM_USAGE" ? "nativeDom" : "angularElement";

            context.report({
                node,
                messageId: messageId,
                data: {
                    metricsJson: metricsJson,
                    method: method,
                }
            });
        }

        return {
            CallExpression(node) {
                if (node.callee.type !== 'MemberExpression') {
                    return;
                }

                const objectName = node.callee.object?.name;
                const methodName = node.callee.property?.name;

                if (DOM_OBJECTS.includes(objectName)) {
                    if (methodName && NATIVE_DOM_METHODS.includes(methodName)) {
                        reportIssue(
                            node,
                            "NATIVE_DOM_USAGE",
                            "CRITICAL",
                            `${objectName}.${methodName}`
                        );
                        return;
                    }
                }

                if (objectName === 'angular' && methodName === 'element') {
                    reportIssue(
                        node,
                        "ANGULAR_ELEMENT_USAGE",
                        "HIGH",
                        "angular.element"
                    );
                    return;
                }
            }
        };
    },
};