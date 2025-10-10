const CRITICAL_ATTRS = ["ng-click", "ng-change", "ng-submit", "ng-mouseover"];

export default {
    meta: {
        type: "problem",
        docs: {
            description: "Detects controller–template coupling (high number of bindings and method calls) in AngularJS templates.",
        },
        messages: {
            couplingDetected: `[METRICS:{{metricsJson}}] Controller-Template Coupling: {{bindingCount}} bindings & {{methodReferences}} method calls detected.`,
        }
    },

    create(context) {
        let bindingCount = 0;
        let methodRefs = [];

        return {
            /* NOTE: These visitors rely on @html-eslint/parser
            being configured in ESLint. They will appear unused in a standard IDE setup
            but are essential for analyzing the template AST.*/

            Text(node) {
                const value = node.value?.trim();
                if (!value) return;

                const bindings = value.match(/{{/g);
                if (bindings) bindingCount += bindings.length;

                const methods = value.match(/\b\w+\s*\(/g);
                if (methods) methodRefs.push(...methods);
            },

            Attribute(node) {
                const attrName = node.key?.value || "";
                const attrVal = node.value?.value || "";

                if (CRITICAL_ATTRS.includes(attrName)) {
                    const methods = attrVal.match(/\b\w+\s*\(/g);
                    if (methods) {
                        methodRefs.push(...methods.map(m => `(HIGH_SEV_ATTR) ${m.trim()}`));
                    }
                }
            },

            "Program:exit"(node) {
                const file = context.getFilename();
                const totalCouplingCount = bindingCount + methodRefs.length;
                let couplingSeverity = 'LOW';
                let reportNeeded = false;

                if (bindingCount >= 15) {
                    couplingSeverity = 'CRITICAL';
                    reportNeeded = true;
                } else if (bindingCount >= 8) {
                    couplingSeverity = 'HIGH';
                    reportNeeded = true;
                } else if (bindingCount > 5) {
                    couplingSeverity = 'MEDIUM';
                    reportNeeded = true;
                }

                if (methodRefs.length > 0) {
                    const hasHighSevAttr = methodRefs.some(m => m.includes('HIGH_SEV_ATTR'));

                    if (hasHighSevAttr || couplingSeverity === 'CRITICAL') {
                        couplingSeverity = 'CRITICAL';
                    } else if (couplingSeverity === 'LOW' || couplingSeverity === 'MEDIUM') {
                        couplingSeverity = 'HIGH';
                    }
                    reportNeeded = true;
                }

                if (reportNeeded) {
                    const customMetrics = {
                        issue: "TEMPLATE_COUPLING",
                        severity: couplingSeverity,
                        bindingCount: bindingCount,
                        methodReferences: methodRefs.length,
                        totalCouplingCount: totalCouplingCount,
                        file: file,
                        topMethods: methodRefs
                            .map(m => m.replace('(HIGH_SEV_ATTR)', '').trim())
                            .slice(0, 3),
                    };

                    const metricsJson = JSON.stringify(customMetrics);

                    context.report({
                        node,
                        messageId: 'couplingDetected',
                        data: {
                            metricsJson: metricsJson,
                            bindingCount: bindingCount,
                            methodReferences: methodRefs.length,
                        }
                    });
                }
            },
        };
    },
};