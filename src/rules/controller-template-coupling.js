import {getMigrationAdvice} from "../migration-guide.js";

const ANGULAR_ATTRS = [
    "ng-click", "ng-change", "ng-submit", "ng-mouseover", "ng-model",
    "ng-disabled", "ng-show", "ng-hide", "ng-if", "ng-repeat"
];

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
        let occurrences = {
            mustacheBinding: [],
            propertyBinding: [],
        };
        let methodRefs = [];

        return {
            /* NOTE: These visitors rely on @html-eslint/parser
            being configured in ESLint. They will appear unused in a standard IDE setup
            but are essential for analyzing the template AST.*/

            Text(node) {
                const value = node.value?.trim();
                if (!value) return;

                // Count complete {{ }} expressions and track them
                const bindings = value.match(/{{\s*[^}]+?\s*}}/g);
                if (bindings) {
                    bindings.forEach(binding => {
                        occurrences.mustacheBinding.push({
                            expression: binding,
                            line: node.loc.start.line,
                            column: node.loc.start.column,
                            codeSnippet: value
                        });
                    });
                }

                // Detect method calls in {{ }}
                const methodsInBindings = value.match(/{{\s*[^}]*\b\w+\s*\([^}]*}}/g);
                if (methodsInBindings) {
                    methodsInBindings.forEach(method => {
                        const cleanMethod = method.match(/\b\w+\s*\(/)[0];
                        methodRefs.push(`(Binding) ${cleanMethod.trim()}`);
                    });
                }
            },

            Attribute(node) {
                const attrName = node.key?.value || "";
                const attrVal = node.value?.value || "";

                if (!attrVal) return;

                const isAngularAttr = attrName.startsWith('ng-') ||
                    attrName.startsWith('ng:') ||
                    attrName.startsWith('md-') ||
                    attrName.startsWith('data-ng-') ||
                    ANGULAR_ATTRS.some(attr => attrName.includes(attr));

                if (isAngularAttr) {
                    const propertyRefs = attrVal.match(/\b(ctrl|vm|scope)\.\w+/g);
                    if (propertyRefs) {
                        propertyRefs.forEach(property => {
                            occurrences.propertyBinding.push({
                                expression: property,
                                attribute: attrName,
                                line: node.loc.start.line,
                                column: node.loc.start.column,
                                codeSnippet: `${attrName}="${attrVal}"`
                            });
                        });
                    }

                    const methods = attrVal.match(/\b\w+\s*\([^)]*\)/g);
                    if (methods) {
                        methodRefs.push(...methods.map(m => `(Attribute:${attrName}) ${m.trim()}`));
                    }
                }
            },

            "Program:exit"(node) {
                const uniqueMethodRefs = [...new Set(methodRefs)];
                const mustacheBindCount = occurrences.mustacheBinding.length;
                const propertyBindCount = occurrences.propertyBinding.length;
                const bindingCount = mustacheBindCount + propertyBindCount;

                const totalCouplingCount = bindingCount + uniqueMethodRefs.length;
                let couplingSeverity = 'LOW';
                let reportNeeded = false;

                if (totalCouplingCount >= 15) {
                    couplingSeverity = 'CRITICAL';
                    reportNeeded = true;
                } else if (totalCouplingCount >= 8) {
                    couplingSeverity = 'HIGH';
                    reportNeeded = true;
                } else if (totalCouplingCount >= 5) {
                    couplingSeverity = 'MEDIUM';
                    reportNeeded = true;
                }

                if (reportNeeded) {
                    const customMetrics = {
                        issue: "Controller-template coupling",
                        severity: couplingSeverity,
                        totalCouplingCount: totalCouplingCount,
                        countByCategory: {
                            bindingCount: bindingCount,
                            methodReferencesCount: uniqueMethodRefs.length,
                        },
                        location: {
                            mustacheBinding: occurrences.mustacheBinding,
                            propertyBinding: occurrences.propertyBinding,
                        },
                        allMethodsRefs: uniqueMethodRefs,
                        migrationGuide: getMigrationAdvice("controllerTemplateCoupling", {
                            bindingCount: bindingCount,
                            methodReferencesCount: uniqueMethodRefs.length,
                            totalCouplingCount: totalCouplingCount,
                        }),
                    };

                    const metricsJson = JSON.stringify(customMetrics);

                    context.report({
                        node,
                        messageId: 'couplingDetected',
                        data: {
                            metricsJson: metricsJson,
                            bindingCount: bindingCount,
                            methodReferences: uniqueMethodRefs.length,
                        }
                    });
                }
            },
        };
    },
};