const utils = require("@lusito/eslint-config/utils");

module.exports = {
    extends: ["@lusito/eslint-config-react"],
    rules: {
        ...utils.getA11yOffRules(), // just for now
        "max-classes-per-file": "off",
        "no-useless-constructor": "off",
        "@typescript-eslint/no-parameter-properties": "off",
        "new-cap": "off",
        "@typescript-eslint/naming-convention": "off",
        "no-bitwise": "off",
        "no-multi-assign": "off",
        "@typescript-eslint/no-empty-function": "off",
        "no-useless-constructor": "off",
        "@typescript-eslint/no-useless-constructor": "error",
        "react/require-default-props": "off",
    },
    env: {
        browser: true,
    },
};
