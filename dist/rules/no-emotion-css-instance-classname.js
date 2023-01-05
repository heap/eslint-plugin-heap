"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const createRule_1 = require("../utils/createRule");
const MESSAGE = 'emotion css instance should not use for classname, use emotion variable instead';
exports.default = (0, createRule_1.createRule)({
    name: 'no-emotion-css-instance-classname',
    meta: {
        type: 'problem',
        docs: {
            category: 'Best Practices',
            description: 'discourage use of EmotionJS css instance for classnames',
            recommended: 'error',
        },
        schema: [],
        messages: {
            noEmotionCSSInstanceClassname: MESSAGE,
        },
    },
    defaultOptions: [],
    create: (context) => ({
        JSXAttribute(node) {
            const attributeType = node.name.type;
            const attributeName = node.name.name;
            const attributeValue = node.value;
            if (attributeType === 'JSXIdentifier' && attributeName === 'className') {
                if (attributeValue &&
                    attributeValue.type === 'JSXExpressionContainer' &&
                    attributeValue.expression.type === 'CallExpression' &&
                    attributeValue.expression.callee.type === 'Identifier' &&
                    attributeValue.expression.callee.name === 'css') {
                    context.report({
                        node,
                        messageId: 'noEmotionCSSInstanceClassname',
                    });
                }
            }
        },
    }),
});
