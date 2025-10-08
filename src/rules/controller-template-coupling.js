export default {
    meta: {
        type: "problem",
        docs: {
            description: "Detects controller–template coupling in AngularJS templates",
            category: "Best Practices",
        },
        schema: [],
    },
    create(context) {
        let bindingCount = 0;
        let methodRefs = [];

        return {
            // Detect text nodes with AngularJS interpolation
            Text(node) {
                const value = node.value?.trim();
                if (!value) return;

                // Count AngularJS bindings {{ ... }}
                const bindings = value.match(/{{/g);
                if (bindings) bindingCount += bindings.length;

                // Detect method calls like foo()
                const methods = value.match(/\b\w+\s*\(/g);
                if (methods) methodRefs.push(...methods);
            },

            // Detect AngularJS-related attributes
            Attribute(node) {
                const CRITICAL_ATTRS = ["ng-click", "ng-change", "ng-submit", "ng-mouseover"];
                const attrName = node.key?.value || "";
                const attrVal = node.value?.value || "";

                // ng-* attributes are bindings
                if (CRITICAL_ATTRS.includes(attrName)) {
                    // A method call here is very high severity
                    const methods = attrVal.match(/\b\w+\s*\(/g);
                    if (methods) {
                        // Give this a higher weight/severity
                        methodRefs.push(...methods.map(m => `(HIGH_SEV_ATTR) ${m.trim()}`));
                    }
                }
            },

            "Program:exit"(node) {
                const file = context.getFilename();
                let couplingSeverity = 'LOW';
                let reportNeeded = false;

                // Define Severity based on Binding Count
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

                // Any method calls are HIGH or CRITICAL
                if (methodRefs.length > 0) {
                    couplingSeverity = (couplingSeverity === 'CRITICAL' || methodRefs.some(m => m.includes('HIGH_SEV_ATTR')))
                        ? 'CRITICAL' : 'HIGH';
                    reportNeeded = true;
                }

                if (reportNeeded) {
                    context.report({
                        node,
                        message: `Controller-Template Coupling: ${bindingCount} bindings & ${methodRefs.length} method calls detected.`,
                        data: {
                            issue: "TEMPLATE_COUPLING",
                            severity: couplingSeverity,
                            bindingCount: bindingCount,
                            methodReferences: methodRefs.length,
                            topMethods: methodRefs.slice(0, 3).map(m => m.trim()),
                        }
                    });
                }
            },
        };
    },
};
