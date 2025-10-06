// migration.config.mjs
import { defineConfig } from "eslint/config";
import html from "@html-eslint/eslint-plugin";
import htmlParser from "@html-eslint/parser";

import scopeSoup from "./src/rules/scope-soup.js";
import rootScope from "./src/rules/root-scope.js";
import controllerTemplateCoupling from "./src/rules/controller-template-coupling.js";
import directDom from "./src/rules/direct-dom.js";
import jqueryUsage from "./src/rules/jquery-usage.js";
import controllerScopeCoupling from "./src/rules/controller-scope-coupling.js";

export default defineConfig([
    // HTML files
    {
        files: ["**/*.html"],   // ⚡ match all HTML, filtered by CLI
        languageOptions: { parser: htmlParser },
        plugins: {
            "@html-eslint": html,
            custom: {
                rules: {
                    "controller-template-coupling": controllerTemplateCoupling,
                },
            },
        },
        rules: {
            "@html-eslint/indent": "off",
            "custom/controller-template-coupling": "warn",
        },
    },

    // JS files
    {
        files: ["**/*.js"],    // ⚡ match all JS, filtered by CLI
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
        },
        plugins: {
            custom: {
                rules: {
                    "scope-soup": scopeSoup,
                    "root-scope": rootScope,
                    "direct-dom": directDom,
                    "jquery-usage": jqueryUsage,
                    "controller-scope-coupling": controllerScopeCoupling,
                },
            },
        },
        rules: {
            "custom/scope-soup": "warn",
            "custom/root-scope": "warn",
            "custom/direct-dom": "warn",
            "custom/jquery-usage": "warn",
            "custom/controller-scope-coupling": "warn",
        },
    },
]);
