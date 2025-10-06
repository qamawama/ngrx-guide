// migration-runner.js
import { spawn } from "child_process";

const target = process.argv[2] || "samples";
const eslintOutput = "output.json";
const formattedOutput = "migration-output.json";

const eslintArgs = [
    "-c", "migration.config.mjs",
    "--ext", ".js,.html",
    `${target}/**/*`,      // ⚡ pass dynamic project path here
    "-f", "json",
    "-o", eslintOutput,
    "--max-warnings=1000"
];

const eslint = spawn("eslint", eslintArgs, { stdio: "inherit", shell: true });

eslint.on("exit", (code) => {
    console.log("⚙️ ESLint finished with code", code);

    // Run formatter anyway
    const formatter = spawn(
        "node",
        ["src/format-results.js", eslintOutput, formattedOutput],
        { stdio: "inherit", shell: true }
    );

    formatter.on("exit", (fCode) => {
        console.log("✅ Formatter finished with code", fCode);
        process.exit(fCode);
    });
});
