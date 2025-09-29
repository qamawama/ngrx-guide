import { defineConfig } from "eslint/config";
import scopeSoup from "./src/rules/scope-soup.js";

export default defineConfig([
    {
        files: ["samples/**/*.js"],  // 👈 only run on sample repos
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
        },
        rules: {
            "custom/scope-soup": "warn",
        },
        plugins: {
            custom: {
                rules: {
                    "scope-soup": scopeSoup,
                },
            },
        },
    },
]);
