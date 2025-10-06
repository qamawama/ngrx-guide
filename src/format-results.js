// format-results.js
import fs from "fs";

// Read input/output paths from CLI args
const [eslintOutput, formattedOutput] = process.argv.slice(2);

console.log("⚙️ Running formatter on:", eslintOutput, "→", formattedOutput);

// Read ESLint output
const raw = fs.readFileSync(eslintOutput, "utf8");
const results = JSON.parse(raw);

const formatted = results.flatMap(file =>
    file.messages
        .filter(msg => msg.ruleId && msg.ruleId.startsWith("custom/"))
        .map(msg => ({
            pattern: msg.ruleId,
            file: file.filePath,
            details: msg.message,
            suggestion: suggestFix(msg.ruleId)
        }))
);

function suggestFix(ruleId) {
    switch (ruleId) {
        case "custom/scope-soup":
            return "Refactor large controllers: split logic, use isolated scope or migrate to React state/props.";
        case "custom/controller-template-coupling":
            return "Decouple business logic from template: move logic to controller or migrate to React with props/state.";
        case "custom/direct-dom":
            return "Avoid direct DOM manipulation: use Angular directives or migrate to React refs/effects.";
        case "custom/jquery-usage":
            return "Avoid jQuery usage: prefer AngularJS services or migrate to React.";
        case "custom/root-scope":
            return "Avoid using $rootScope. Refactor for isolation and migration.";
        case "custom/controller-scope-coupling":
            return "Refactor controller to reduce $scope bindings and migrate to React state/props.";
        default:
            return "Check migration guide for recommendations.";
    }
}

fs.writeFileSync(formattedOutput, JSON.stringify(formatted, null, 2));
console.log("✅ migration-output.json created at", formattedOutput);
