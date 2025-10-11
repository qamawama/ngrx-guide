/**
 * @typedef {object} Advice
 * @property {string[]} refactor - Recommendations for immediate cleanup in AngularJS.
 * @property {string[]} migration - Guidance for migrating the pattern to React.
 */

export const migrationGuide = {
    scopeSoupUsage: () => ({
        refactor: [
            "Enforce 'controllerAs' to eliminate implicit $scope references.",
            "Relocate data manipulation and logic into AngularJS services.",
            "Restrict controller responsibility to view-model exposure only."
        ],
        migration: [
            "Replace $scope with component-local state using Hooks.",
            "Centralize shared state with Context or state management libraries.",
            "Transfer reusable logic into custom hooks or isolated utility modules."
        ]
    }),

    rootScopeUsage: () => ({
        refactor: [
            "Remove event broadcasting via $rootScope.",
            "Establish dedicated state services instead of global event reliance.",
            "Confine cross-component communication to service contracts."
        ],
        migration: [
            "Substitute $rootScope with Context-based global state.",
            "Convert broadcast patterns to explicit prop or store flows.",
            "Avoid implicit global dependencies in component hierarchy."
        ]
    }),

    controllerTemplateCoupling: () => ({
        refactor: [
            "Eliminate function calls and logic expressions from templates.",
            "Define computed values within the controller layer.",
            "Ensure templates access only resolved controller state."
        ],
        migration: [
            "Shift all view logic into component body or memoized selectors.",
            "Maintain JSX purity with declarative state rendering only.",
            "Isolate complex logic into hooks or helper modules."
        ]
    }),

    controllerScopeCoupling: () => ({
        refactor: [
            "Remove $watch and event listeners from controllers.",
            "Delegate reactive logic to services or lifecycle abstractions.",
            "Contain side-effects within structured callback mechanisms."
        ],
        migration: [
            "Transform $watch to useEffect-driven state observation.",
            "Embed lifecycle transitions within component execution context.",
            "Extract side-effects into encapsulated hooks."
        ]
    }),

    directDomManipulation: () => ({
        refactor: [
            "Prohibit DOM access from controllers and services.",
            "Encapsulate element interaction within directive boundaries.",
            "Replace manual mutation with binding-based rendering."
        ],
        migration: [
            "Employ useRef only for integration boundaries.",
            "Delegate DOM updates to state-driven rendering.",
            "Restrict imperative access to controlled escape hatches."
        ]
    }),

    jqueryUsage: () => ({
        refactor: [
            "Eliminate jQuery dependencies from component logic.",
            "Substitute DOM manipulation with directive-backed bindings.",
            "Replace AJAX calls with AngularJS $http or service wrappers."
        ],
        migration: [
            "Adopt fetch or axios within React-side data hooks.",
            "Bind UI state through component props and internal state.",
            "Remove imperative patterns in favor of declarative rendering."
        ]
    }),
};
