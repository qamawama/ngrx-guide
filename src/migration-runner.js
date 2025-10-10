import { ESLint } from "eslint";
import fs from "fs";
import path from "path";

const DEFAULT_TARGET = "samples/custom-test";
const RAW_OUTPUT_FILE = "raw-programmatic-output.json";

const [argTarget = DEFAULT_TARGET] = process.argv.slice(2);

const projectRoot = process.cwd();
const configPath = path.resolve(projectRoot, "migration.config.mjs");
const targetDir = path.resolve(projectRoot, argTarget);

async function runAnalysis() {
    console.log(`⚙️ Running ESLint programmatically on target: ${targetDir}`);

    const eslint = new ESLint({
        cwd: projectRoot,
        overrideConfigFile: configPath,
        allowInlineConfig: false,
    });

    const results = await eslint.lintFiles([
        `${targetDir}/**/*.js`,
        `${targetDir}/**/*.html`
    ]);

    const output = JSON.stringify(results, null, 2);

    fs.writeFileSync(RAW_OUTPUT_FILE, output);
    console.log(`✅ Raw output saved to: ${RAW_OUTPUT_FILE}.`);
    console.log(`📝 Next, run 'format' to generate the final report.`);
}

runAnalysis().catch((error) => {
    console.error("ESLint Programmatic Error:", error);
    process.exit(1);
});