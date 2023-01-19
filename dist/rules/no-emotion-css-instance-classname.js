"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const createRule_1 = require("../utils/createRule");
const MESSAGE = "Emotion's css property should not be used directly within a React component. Please move the css instance to a variable outside of the component's scope before using.";
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
                    attributeValue.expression.callee.type === 'Identifier') {
                    if (attributeValue.expression.callee.name === 'css') {
                        context.report({
                            node,
                            messageId: 'noEmotionCSSInstanceClassname',
                        });
                    }
                    else if (attributeValue.expression.callee.name.toLowerCase() === 'classnames' &&
                        attributeValue.expression.arguments.length >= 1) {
                        const isInvalid = attributeValue.expression.arguments.some((arg) => {
                            return (arg.type === 'CallExpression' &&
                                arg.callee.type === 'Identifier' &&
                                arg.callee.name === 'css');
                        });
                        if (isInvalid) {
                            context.report({
                                node,
                                messageId: 'noEmotionCSSInstanceClassname',
                            });
                        }
                    }
                }
            }
        },
    }),
});
