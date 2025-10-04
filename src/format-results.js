import fs from "fs";

// read ESLint output.json
const raw = fs.readFileSync("output.json", "utf8");
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
        default:
            return "Check migration guide for recommendations.";
    }
}

fs.writeFileSync("migration-output.json", JSON.stringify(formatted, null, 2));
console.log("✅ migration-output.json created");
