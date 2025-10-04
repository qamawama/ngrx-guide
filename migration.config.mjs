import { defineConfig } from "eslint/config";
import html from "@html-eslint/eslint-plugin";
import htmlParser from "@html-eslint/parser";

import scopeSoup from "./src/rules/scope-soup.js";
import rootScope from "./src/rules/root-scope.js";
import controllerTemplateCoupling from "./src/rules/controller-template-coupling.js";

export default defineConfig([
    // HTML files
    {
        files: ["samples/**/*.html"],
        languageOptions: {
            parser: htmlParser,
        },
        plugins: {
            "@html-eslint": html,
            custom: {
                rules: {
                    "controller-template-coupling": controllerTemplateCoupling,
                },
            },
        },
        rules: {
            "@html-eslint/indent": "off", // disable if not needed
            "custom/controller-template-coupling": "warn",
        },
    },

    // JS files
    {
        files: ["samples/**/*.js"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
        },
        plugins: {
            custom: {
                rules: {
                    "scope-soup": scopeSoup,
                    "root-scope": rootScope,
                },
            },
        },
        rules: {
            "custom/scope-soup": "warn",
            "custom/root-scope": "warn",
        },
    },
]);
