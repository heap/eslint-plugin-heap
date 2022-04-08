"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const createRule_1 = require("../utils/createRule");
const MESSAGE = 'MobX not allowed';
exports.default = (0, createRule_1.createRule)({
    name: 'no-mobx',
    meta: {
        type: 'problem',
        docs: {
            category: 'Best Practices',
            description: 'do not allow MobX since it is not compatible with upcoming React features',
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
            noMobx: MESSAGE,
        },
    },
    defaultOptions: [{}],
    create: (context, [options]) => {
        return {
            Decorator(node) {
                var _a;
                const name = node.expression && node.expression.name;
                if (name === 'observable' || name === 'action') {
                    const message = (_a = options === null || options === void 0 ? void 0 : options.message) !== null && _a !== void 0 ? _a : MESSAGE;
                    (0, createRule_1.reportForNode)(context, { node, message });
                }
            },
        };
    },
});
