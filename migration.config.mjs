import { defineConfig } from "eslint/config";
import scopeSoup from "./src/rules/scope-soup.js";
import rootScope from "./src/rules/root-scope.js";
import controllerTemplateCoupling from "./src/rules/controller-template-coupling.js";

export default defineConfig([
    {
        files: ["samples/**/*.js", "samples/**/*.html"],  // 👈 only run on sample repos
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
        },
        rules: {
            "custom/scope-soup": "warn",
            "custom/root-scope": "warn",
            "custom/direct-dom": "warn",
            "custom/controller-template-coupling": "warn",
        },
        plugins: {
            custom: {
                rules: {
                    "scope-soup": scopeSoup,
                    "root-scope": rootScope,
                    "controller-template-coupling": controllerTemplateCoupling,
                },
            },
        },
    },
]);
