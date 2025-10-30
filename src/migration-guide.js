/**
 * @typedef {object} Advice
 * @property {string[]} refactor - Recommendations for immediate cleanup in AngularJS.
 * @property {string[]} migration - Guidance for migrating the pattern to React.
 */

export const migrationGuide = {
    scopeSoupUsage: (metrics) => {
        const functionCount = metrics.totalOccurrences || 0;
        const scopeAssignment = metrics.scopeAssignment || [];

        return {
            refactor: [
                `Replace ${functionCount} $scope function${functionCount > 1 ? 's' : ''} with 'controllerAs' syntax`,
                "Move business logic from $scope to AngularJS services",
                scopeAssignment.length > 0 ? `Extract functions: ${scopeAssignment.slice(0, 3).join(', ')}${scopeAssignment.length > 3 ? '...' : ''}` : "Identify and extract $scope functions"
            ],
            migration: [
                `Convert ${functionCount} $scope function${functionCount > 1 ? 's' : ''} to React hooks`,
                "Replace $scope with useState/useReducer for local state",
                "Move shared logic to custom hooks or context"
            ]
        }
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

    controllerScopeCoupling: (metrics) => {
        const functionCount = metrics.totalOccurrences || 0;
        const uniqueFunctions = metrics.uniqueFunctions || [];

        return {
            refactor: [
                `Extract ${functionCount} $scope function${functionCount > 1 ? 's' : ''} from controller`,
                uniqueFunctions.length > 0 ? `Move functions to services: ${uniqueFunctions.slice(0, 3).join(', ')}${uniqueFunctions.length > 3 ? '...' : ''}` : "Identify $scope functions",
                "Use controllerAs syntax to eliminate $scope dependency"
            ],
            migration: [
                `Convert ${functionCount} $scope function${functionCount > 1 ? 's' : ''} to React component methods/hooks`,
                "Replace $scope with component state management",
                "Extract reusable logic to custom hooks"
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