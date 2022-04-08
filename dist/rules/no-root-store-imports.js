"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const createRule_1 = require("../utils/createRule");
const MESSAGE = 'RootStore imports are not allowed';
exports.default = (0, createRule_1.createRule)({
    name: 'no-root-store-imports',
    meta: {
        type: 'problem',
        docs: {
            category: 'Best Practices',
            description: 'discourage use of RootStore imports',
            recommended: 'error',
        },
        schema: [
            {
                type: 'object',
                properties: {
                    message: {
                        type: 'string',
                    },
                },
            },
        ],
        messages: {
            noRootStoreImports: MESSAGE,
        },
    },
    defaultOptions: [{}],
    create: (context, [options]) => ({
        ImportDeclaration(node) {
            var _a;
            const sourceValue = node.source.value;
            if (typeof sourceValue === 'string' && sourceValue.endsWith('/stores')) {
                const message = (_a = options === null || options === void 0 ? void 0 : options.message) !== null && _a !== void 0 ? _a : MESSAGE;
                (0, createRule_1.reportForNode)(context, { node, message });
            }
        },
    }),
});
