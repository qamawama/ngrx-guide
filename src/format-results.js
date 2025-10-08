import fs from "fs";

const SEVERITY_ORDER = {
    'CRITICAL': 1,
    'HIGH': 2,
    'MEDIUM': 3,
    'LOW': 4,
    'WARN': 5
};

const [eslintOutput, formattedOutput] = process.argv.slice(2);

console.log("⚙️ Running formatter on:", eslintOutput, "→", formattedOutput);

const raw = fs.readFileSync(eslintOutput, "utf8");
const results = JSON.parse(raw);

function suggestFix(ruleId, data = {}) {
    const severity = data.severity || 'HIGH';

    const priority = SEVERITY_ORDER[severity];
    const prefix = `[P${priority} - ${severity}] `;

    const {
        count,
        functionCount,
        topProperties = [],
        functions = [],
        method
    } = data;

    switch (ruleId) {
        case "custom/scope-soup":
            const propsList = topProperties.slice(0, 3).join(', ');
            return prefix + `The controller has ${count} bindings (${propsList}...). **ACTION:** Decompose this component and extract data logic into smaller services or pure utility functions.`;

        case "custom/controller-scope-coupling":
            const funcList = functions.slice(0, 2).join(', ');
            return prefix + `IMPERATIVE LOGIC: ${functionCount} methods (${funcList}...) are defined on $scope. **ACTION:** Extract these methods into an AngularJS Service, which serves as the foundation for a custom React Hook.`;

        case "custom/direct-dom":
            return prefix + `CRITICAL BLOCKER: Detected native DOM access using '${method}'. **ACTION:** This must be replaced with a declarative approach using React's Virtual DOM or a minimal, isolated use of 'useRef' within a 'useEffect' hook.`;

        case "custom/root-scope":
            return prefix + `CRITICAL BLOCKER: Global state dependency. **ACTION:** Refactor to use component prop drilling/events or migrate directly to a modern global state solution (Context API/Redux).`;

        case "custom/jquery-usage":
            return prefix + `MEDIUM SMELL: Detected jQuery method usage. **ACTION:** Replace utility functions (e.g., $.each) with native JS methods or replace DOM calls with standard Angular/React bindings.`;

        case "custom/controller-template-coupling":
            // Check if method calls were the primary issue
            const methodMessage = data.methodReferences > 0 ? `It calls ${data.methodReferences} controller methods directly.` : '';
            return prefix + `COMPLEX TEMPLATE: Found ${data.bindingCount} bindings. ${methodMessage} **ACTION:** Reduce complexity by splitting the component into smaller, highly focused React components (Component Composition).`;

        default:
            return prefix + "Check the project's comprehensive Migration Guide Appendix for recommendations.";
    }
}

let formatted = results.flatMap(file =>
    file.messages
        .filter(msg => msg.ruleId && msg.ruleId.startsWith("custom/"))
        .map(msg => {
            const customData = msg.data || {};
            const severity = customData.severity || 'WARN';

            return {
                // Core data points
                pattern: msg.ruleId,
                severity: severity,
                file: file.filePath.replace(/\\/g, '/'),
                line: msg.line,
                column: msg.column,

                suggestion: suggestFix(msg.ruleId, customData),

                originalMessage: msg.message,
                customMetrics: customData
            };
        })
);

formatted.sort((a, b) => {
    const aSeverityRank = SEVERITY_ORDER[a.severity] || 5;
    const bSeverityRank = SEVERITY_ORDER[b.severity] || 5;

    if (aSeverityRank !== bSeverityRank) {
        return aSeverityRank - bSeverityRank;
    }

    return a.file.localeCompare(b.file);
});


fs.writeFileSync(formattedOutput, JSON.stringify(formatted, null, 2));
console.log(`✅ ${formatted.length} issues successfully formatted into migration-output.json`);