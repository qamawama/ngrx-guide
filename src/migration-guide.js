/**
 * @typedef {object} Advice
 * @property {string[]} refactor - Recommendations for immediate cleanup in AngularJS.
 * @property {string[]} migration - Guidance for migrating the pattern to React.
 */

export const migrationGuide = {
    scopeSoupUsage: (metrics) => {
        const dataCount = metrics.dataAssignments || 0;
        const functionCount = metrics.functionAssignments || 0;

        return {
            refactor: [
                `Extract ${dataCount} data propert${dataCount !== 1 ? 'ies' : 'y'} and ${functionCount} function${functionCount !== 1 ? 's' : ''} from $scope`,
                `Move ${functionCount} function${functionCount !== 1 ? 's' : ''} to AngularJS services`,
                "Use controllerAs syntax with 'vm' pattern"
            ],
            migration: [
                `Convert ${dataCount} data propert${dataCount !== 1 ? 'ies' : 'y'} to React useState/useReducer`,
                `Transform ${functionCount} $scope function${functionCount !== 1 ? 's' : ''} to custom hooks`,
                "Replace $scope with component state management"
            ]
        };
    },

    rootScopeUsage: (metrics) => {
        const totalOccurrences = metrics.totalOccurrences || 0;
        const breakdown = metrics.breakdown || {};

        return {
            refactor: [
                `Remove ${totalOccurrences} $rootScope reference${totalOccurrences > 1 ? 's' : ''}`,
                breakdown.assignment ? `Replace ${breakdown.assignment} assignment${breakdown.assignment > 1 ? 's' : ''} with services` : "Replace $rootScope assignments",
                "Use AngularJS events or services for cross-component communication"
            ],
            migration: [
                `Migrate ${totalOccurrences} $rootScope usage${totalOccurrences > 1 ? 's' : ''} to React Context`,
                "Convert global state to Redux/Zustand or Context API",
                "Replace $rootScope events with prop drilling or event emitters"
            ]
        }
    },

    controllerTemplateCoupling: (metrics) => {
        const bindingCount = metrics.bindingCount || 0;
        const methodCount = metrics.methodReferencesCount || 0;
        const total = metrics.totalCouplingCount || 0;

        return {
            refactor: [
                `Reduce ${total} coupling point${total > 1 ? 's' : ''} (${bindingCount} bindings, ${methodCount} methods)`,
                "Move method calls from template to controller",
                "Use one-way data flow and avoid template logic"
            ],
            migration: [
                `Convert ${bindingCount} binding${bindingCount > 1 ? 's' : ''} and ${methodCount} method call${methodCount > 1 ? 's' : ''} to React props/state`,
                "Replace template logic with component logic and hooks",
                "Define explicit component interfaces"
            ]
        }
    },

    directDomManipulation: (metrics) => {
        const totalOccurrences = metrics.totalOccurrences || 0;
        const nativeCount = metrics.nativeDomCount || 0;
        const angularElementCount = metrics.angularElementCount || 0;

        return {
            refactor: [
                `Remove ${totalOccurrences} direct DOM manipulation${totalOccurrences > 1 ? 's' : ''}`,
                nativeCount > 0 ? `Replace ${nativeCount} native DOM call${nativeCount > 1 ? 's' : ''} with directives` : "",
                angularElementCount > 0 ? `Convert ${angularElementCount} angular.element call${angularElementCount > 1 ? 's' : ''} to bindings` : ""
            ],
            migration: [
                `Replace ${totalOccurrences} DOM manipulation${totalOccurrences > 1 ? 's' : ''} with React state`,
                "Use useRef only for integration with third-party libraries",
                "Convert imperative DOM updates to declarative rendering"
            ]
        }
    },

    jqueryUsage: (metrics) => {
        const totalOccurrences = metrics.totalOccurrences || 0;
        const domCount = metrics.domCount || 0;
        const ajaxCount = metrics.ajaxCount || 0;

        return {
            refactor: [
                `Eliminate ${totalOccurrences} jQuery usage${totalOccurrences > 1 ? 's' : ''}`,
                domCount > 0 ? `Replace ${domCount} DOM manipulation${domCount > 1 ? 's' : ''} with Angular directives` : "",
                ajaxCount > 0 ? `Convert ${ajaxCount} AJAX call${ajaxCount > 1 ? 's' : ''} to $http service` : ""
            ],
            migration: [
                `Remove ${totalOccurrences} jQuery dependency${totalOccurrences > 1 ? 's' : ''}`,
                "Replace jQuery DOM manipulation with React state/props",
                "Convert jQuery AJAX to fetch/axios in useEffect hooks"
            ]
        }
    },
};

export function getMigrationAdvice(ruleId, metrics) {
    const guide = migrationGuide[ruleId];
    if (guide) {
        return guide(metrics);
    }
    return {
        refactor: ["General refactoring needed"],
        migration: ["General migration approach required"]
    };
}