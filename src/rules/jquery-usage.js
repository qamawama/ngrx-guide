import {getMigrationAdvice} from "../migration-guide.js";

const DOM_METHODS = [
    // Content manipulation
    'html', 'text', 'val',

    // DOM insertion & removal
    'append', 'prepend', 'before', 'after',
    'remove', 'empty', 'detach',

    // DOM traversal
    'find', 'children', 'parent', 'parents', 'closest',
    'next', 'prev', 'siblings',

    // CSS classes
    'addClass', 'removeClass', 'toggleClass', 'hasClass',

    // Attributes & properties
    'attr', 'removeAttr', 'prop', 'data', 'removeData',

    // CSS manipulation
    'css', 'show', 'hide', 'toggle',

    // Events
    'on', 'off', 'one', 'trigger', 'bind', 'unbind',

    // Dimensions & positioning
    'width', 'height', 'innerWidth', 'innerHeight',
    'outerWidth', 'outerHeight', 'offset', 'position',
    'scrollTop', 'scrollLeft',

    // Forms
    'serialize', 'serializeArray',

    // Animation
    'animate', 'fadeIn', 'fadeOut', 'fadeToggle', 'fadeTo',
    'slideDown', 'slideUp', 'slideToggle', 'stop',

    // Utilities
    'each', 'map', 'filter', 'is', 'not', 'length', 'size'
];

const AJAX_METHODS = [
    'ajax', 'get', 'post', 'getJSON', 'getScript',
    'load', 'ajaxSetup', 'ajaxStart', 'ajaxStop',
    'ajaxSuccess', 'ajaxError', 'ajaxComplete'
];

export default {
    meta: {
        type: "problem",
        docs: {
            description: "Detects jQuery usage which indicates tight coupling or direct DOM manipulation in AngularJS",
        },
        messages: {
            jqueryDetected: "[METRICS:{{metricsJson}}] Found {{totalCount}} jQuery usage(s) - {{domCount}} DOM methods, {{ajaxCount}} AJAX methods",
        },
    },

    create(context) {
        let occurrences = {
            DOM: [],
            AJAX: []
        };

        return {
            CallExpression(node) {
                if (node.callee.type === 'MemberExpression' && node.callee.object?.name === '$') {
                    const method = node.callee.property?.name;
                    if (method && AJAX_METHODS.includes(method)) {
                        occurrences.AJAX.push({
                            method: `$.${method}()`,
                            usageSeverity: method === 'ajax' ? 'CRITICAL' : 'HIGH',
                            line: node.loc.start.line,
                            column: node.loc.start.column,
                            codeSnippet: context.getSourceCode().getText(node)
                        });
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

                        occurrences.DOM.push({
                            method: `.${method}()`,
                            usageSeverity: 'HIGH',
                            line: node.loc.start.line,
                            column: node.loc.start.column,
                            codeSnippet: context.getSourceCode().getText(node)
                        });
                    }
                }
            },

            "Program:exit"(node) {
                const domCount = occurrences.DOM.length;
                const ajaxCount = occurrences.AJAX.length;
                const totalCount = domCount + ajaxCount;

                if (totalCount > 0) {
                    const customMetrics = {
                        issue: "JQuery usage",
                        severity: totalCount >= 5 ? "CRITICAL" : totalCount >= 3 ? "HIGH" : "MEDIUM",
                        totalOccurrences: totalCount,
                        countByCategory: {
                            domCount: domCount,
                            ajaxCount: ajaxCount,
                        },
                        locations: {
                            DOM: occurrences.DOM,
                            AJAX: occurrences.AJAX
                        },
                        migrationGuide: getMigrationAdvice("jqueryUsage", {
                            totalOccurrences: totalCount,
                            domCount: domCount,
                            ajaxCount: ajaxCount,
                        }),
                    };

                    const metricsJson = JSON.stringify(customMetrics);

                    context.report({
                        node,
                        messageId: "jqueryDetected",
                        data: {
                            metricsJson: metricsJson,
                            totalCount: totalCount,
                            domCount: domCount,
                            ajaxCount: ajaxCount
                        }
                    });
                }
            }
        };
    },
};