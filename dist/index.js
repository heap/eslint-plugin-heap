"use strict";
module.exports = {
    rules: {
        'no-mobx': require('./rules/no-mobx').default,
        'no-root-store-imports': require('./rules/no-root-store-imports').default,
        'no-wildcard-imports': require('./rules/no-wildcard-imports').default,
    },
};
