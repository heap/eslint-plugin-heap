"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPathValidationListeners = void 0;
const getIdentifierName = (node) => node.type === 'Identifier' ? node.name : undefined;
const isRequireStatement = (expression) => expression.type === 'Identifier' && getIdentifierName(expression) === 'require';
const isJestMock = (expression) => expression.type === 'MemberExpression' &&
    getIdentifierName(expression.object) === 'jest' &&
    getIdentifierName(expression.property) === 'mock';
const buildPathValidationListeners = (pathValidator) => {
    const validateExpression = (source) => {
        if ((source === null || source === void 0 ? void 0 : source.type) === 'Literal') {
            const literal = source;
            if (typeof literal.value === 'string') {
                pathValidator(literal);
            }
        }
    };
    return {
        TSImportEqualsDeclaration(node) {
            if (node.moduleReference.type == 'TSExternalModuleReference') {
                const literal = node.moduleReference.expression;
                validateExpression(literal);
            }
        },
        CallExpression(node) {
            var _a;
            if (isRequireStatement(node.callee) || isJestMock(node.callee)) {
                const literal = ((_a = node.arguments[0]) !== null && _a !== void 0 ? _a : null);
                validateExpression(literal);
            }
        },
        ImportDeclaration(node) {
            validateExpression(node.source);
        },
        ImportExpression(node) {
            validateExpression(node.source);
        },
        ExportAllDeclaration(node) {
            validateExpression(node.source);
        },
        ExportNamedDeclaration(node) {
            validateExpression(node.source);
        },
    };
};
exports.buildPathValidationListeners = buildPathValidationListeners;
