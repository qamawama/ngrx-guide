import fs from 'fs';
import path from 'path';
import {migrationGuide} from './migration-guide.js';

const DEFAULT_INPUT_PATH = 'raw-programmatic-output.json';
const DEFAULT_OUTPUT_PATH = 'migration-output.json';

const inputPath = DEFAULT_INPUT_PATH;
const outputPath = DEFAULT_OUTPUT_PATH;

const projectRoot = process.cwd();

console.log(`⚙️ Running formatter on: ${inputPath} → ${outputPath}`);

function processResults(results) {
    const finalReport = [];
    const METRICS_REGEX = /^\[METRICS:({.*})\]\s*(.*)/s;

    results.forEach(fileResult => {
        fileResult.messages.forEach(message => {
            const rawMessage = message.message;
            let customMetrics = {};
            let cleanMessage = rawMessage;

            const match = rawMessage.match(METRICS_REGEX);

            const suggestion = getSuggestion(message.ruleId, customMetrics);

            if (match) {
                try {
                    customMetrics = JSON.parse(match[1]);
                    cleanMessage = match[2].trim();
                } catch (e) {
                    console.error(`[Formatter Error] Failed to parse metrics JSON for rule ${message.ruleId}:`, e.message);
                    cleanMessage = rawMessage;
                }
            } else {
                console.warn(`[Formatter Warning] Missing custom metrics for rule: ${message.ruleId} in file ${fileResult.filePath}`);
            }

            finalReport.push({
                filePath: fileResult.filePath,
                ruleId: message.ruleId,

                severity: customMetrics.severity || 'UNKNOWN',
                issue: customMetrics.issue || 'UNKNOWN',

                message: cleanMessage,
                customMetrics: customMetrics,

                suggestion: suggestion,
            });
        });
    });

    return finalReport;
}


function runFormatter() {
    try {
        const fullInputPath = path.resolve(projectRoot, inputPath);
        const rawResults = fs.readFileSync(fullInputPath, 'utf8'); // This line is now safe
        const results = JSON.parse(rawResults);

        const finalReport = processResults(results);

        const fullOutputPath = path.resolve(projectRoot, outputPath);
        fs.writeFileSync(fullOutputPath, JSON.stringify(finalReport, null, 2));

        console.log(`✅ Final report saved to: ${outputPath}`);

    } catch (error) {
        console.error('Fatal Error running formatter:', error.message);
        if (error.code === 'ENOENT') {
            console.error(`Check that the file '${inputPath}' exists and has been created by the analysis run.`);
        }
    }
}

function getSuggestion(ruleId, customMetrics) {
    switch (ruleId) {
        case 'custom/scope-soup':
            return migrationGuide.scopeSoupUsage();
        case 'custom/root-scope':
            return migrationGuide.rootScopeUsage();
        case 'custom/jquery-usage':
            return migrationGuide.jqueryUsage();
        case 'custom/direct-dom':
            return migrationGuide.directDomManipulation();
        case 'custom/controller-template-coupling':
            return migrationGuide.controllerTemplateCoupling();
        case 'custom/controller-scope-coupling':
            return migrationGuide.controllerScopeCoupling();
        default:
            return null;
    }
}
runFormatter();