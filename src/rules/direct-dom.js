import {getMigrationAdvice} from "../migration-guide.js";

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
            domManipulationFound: `[METRICS:{{metricsJson}}] Found {{totalCount}} direct DOM manipulation(s) - {{nativeDomCount}} native DOM, {{angularElementCount}} angular.element`,
        },
    },

    create(context) {
        let occurrences = {
            NATIVE_DOM_USAGE: [],
            ANGULAR_ELEMENT_USAGE: []
        };

        return {
            CallExpression(node) {
                if (node.callee.type !== 'MemberExpression') {
                    return;
                }

                const objectName = node.callee.object?.name;
                const methodName = node.callee.property?.name;

                if (DOM_OBJECTS.includes(objectName)) {
                    if (methodName && NATIVE_DOM_METHODS.includes(methodName)) {
                        occurrences.NATIVE_DOM_USAGE.push({
                            method: `${objectName}.${methodName}`,
                            line: node.loc.start.line,
                            column: node.loc.start.column,
                            codeSnippet: context.getSourceCode().getText(node)
                        });
                        return;
                    }
                }

                if (objectName === 'angular' && methodName === 'element') {
                    occurrences.ANGULAR_ELEMENT_USAGE.push({
                        method: "angular.element",
                        line: node.loc.start.line,
                        column: node.loc.start.column,
                        codeSnippet: context.getSourceCode().getText(node)
                    });
                }
            },

            "Program:exit"(node) {
                const totalNativeDom = occurrences.NATIVE_DOM_USAGE.length;
                const totalAngularElement = occurrences.ANGULAR_ELEMENT_USAGE.length;
                const totalCount = totalNativeDom + totalAngularElement;

                if (totalCount > 0) {
                    const customMetrics = {
                        issue: "Direct DOM manipulation",
                        severity: totalCount >= 3 ? "CRITICAL" : totalCount >= 2 ? "HIGH" : "MEDIUM",
                        totalOccurrences: totalCount,
                        countByCategory: {
                            nativeDomCount: totalNativeDom,
                            angularElementCount: totalAngularElement,
                        },
                        locations: {
                            nativeDom: occurrences.NATIVE_DOM_USAGE,
                            angularElement: occurrences.ANGULAR_ELEMENT_USAGE
                        },
                        migrationGuide: getMigrationAdvice("directDomManipulation", {
                            totalOccurrences: totalCount,
                            nativeDomCount: totalNativeDom,
                            angularElementCount: totalAngularElement,
                        })
                    };

                    const metricsJson = JSON.stringify(customMetrics);

                    context.report({
                        node,
                        messageId: "domManipulationFound",
                        data: {
                            metricsJson: metricsJson,
                            totalCount: totalCount,
                            nativeDomCount: totalNativeDom,
                            angularElementCount: totalAngularElement
                        }
                    });
                }
            }
        };
    },
};