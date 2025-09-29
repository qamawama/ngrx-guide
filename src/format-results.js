import fs from "fs";

// read ESLint output.json
const raw = fs.readFileSync("output.json", "utf8");
const results = JSON.parse(raw);

const formatted = results.flatMap(file => {
    return file.messages.map(msg => ({
        pattern: msg.ruleId,
        file: file.filePath,
        location: { line: msg.line, column: msg.column },
        details: msg.message,
        suggestion: suggestFix(msg.ruleId)
    }));
});

function suggestFix(ruleId) {
    switch (ruleId) {
        case "custom/scope-soup":
            return "Refactor large controllers: split logic, use isolated scope or migrate to React state/props.";
        default:
            return "Check migration guide for recommendations.";
    }
}

fs.writeFileSync("migration-output.json", JSON.stringify(formatted, null, 2));
console.log("✅ migration-output.json created");
