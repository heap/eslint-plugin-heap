"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const createRule_1 = require("../utils/createRule");
const path = __importStar(require("path"));
const tsconfigPaths = __importStar(require("tsconfig-paths"));
const matchStar_1 = require("../utils/matchStar");
const RULE_NAME = 'no-external-relative-imports';
const getConfig = (cwd) => {
    const configLoaderResult = tsconfigPaths.loadConfig(cwd);
    if (configLoaderResult.resultType !== 'success') {
        throw new Error(`failed to init tsconfig-paths: ${configLoaderResult.message}`);
    }
    return configLoaderResult;
};
const getMatchingAlias = (paths, search) => {
    return Object.keys(paths).find((pathsConfigKey) => paths[pathsConfigKey].some((pathsConfigValue) => !!(0, matchStar_1.matchStar)(pathsConfigValue, search)));
};
const buildPathValidator = (context, options, paths, absoluteBaseUrl, currentPath, currentAlias) => {
    const getMatchingAliasForSource = (source) => {
        if (source.startsWith('@')) {
            return Object.keys(paths).find((pathsConfigKey) => !!(0, matchStar_1.matchStar)(pathsConfigKey, source));
        }
        else {
            const importPath = path.resolve(currentPath, source);
            const relativeImportPath = importPath.slice(absoluteBaseUrl.length + 1);
            return getMatchingAlias(paths, relativeImportPath);
        }
    };
    return (node, source) => {
        if (!source.includes('../') && !source.startsWith('@')) {
            return;
        }
        const matchingAlias = getMatchingAliasForSource(source);
        if (matchingAlias === currentAlias) {
            return;
        }
        if (matchingAlias &&
            Array.isArray(options.allowedImports) &&
            options.allowedImports.includes(matchingAlias)) {
            return;
        }
        context.report({
            node,
            messageId: 'noExternalRelativeImports',
            data: { alias: currentAlias },
        });
    };
};
const isRequireStatement = (expression) => expression.type === 'Identifier' && getIdentifierName(expression) === 'require';
const isJestMock = (expression) => expression.type === 'MemberExpression' &&
    getIdentifierName(expression.object) === 'jest' &&
    getIdentifierName(expression.property) === 'mock';
const getIdentifierName = (node) => node.type === 'Identifier' ? node.name : undefined;
exports.default = (0, createRule_1.createRule)({
    name: RULE_NAME,
    meta: {
        type: 'problem',
        docs: {
            category: 'Best Practices',
            description: 'Disallow imports from outside of a specified module',
            recommended: 'error',
        },
        schema: [
            {
                type: 'object',
                properties: {
                    allowedImports: {
                        type: 'array',
                        items: {
                            type: 'string',
                        },
                    },
                },
            },
        ],
        messages: {
            noExternalRelativeImports: 'Importing from outside of {{ alias }} is not allowed. Add to "allowedImports" option if a new dependency is needed.',
        },
    },
    defaultOptions: [{}],
    create: (context, [options]) => {
        const { parserServices } = context;
        if (!parserServices) {
            throw new Error(`"heap/${RULE_NAME} can only be used with '@typescript-eslint/parser' parser option specified`);
        }
        const currentFilename = context.getFilename();
        const currentPath = path.dirname(context.getFilename());
        const { absoluteBaseUrl, paths } = getConfig(currentPath);
        const currentRelativeFilename = currentFilename.slice(absoluteBaseUrl.length + 1);
        const currentAlias = getMatchingAlias(paths, currentRelativeFilename);
        const validatePath = buildPathValidator(context, options, paths, absoluteBaseUrl, currentPath, currentAlias);
        return {
            TSImportEqualsDeclaration(node) {
                if (node.moduleReference.type == 'TSExternalModuleReference') {
                    const literal = node.moduleReference.expression;
                    if (literal && literal.type === 'Literal') {
                        const source = literal.value;
                        if (typeof source === 'string') {
                            validatePath(literal, source);
                        }
                    }
                }
            },
            CallExpression(node) {
                var _a;
                if (isRequireStatement(node.callee) || isJestMock(node.callee)) {
                    const literal = (_a = node.arguments[0]) !== null && _a !== void 0 ? _a : {};
                    if (literal && literal.type === 'Literal') {
                        const source = literal.value;
                        if (typeof source === 'string') {
                            validatePath(literal, source);
                        }
                    }
                }
            },
            ImportDeclaration(node) {
                const source = node.source.value;
                if (typeof source === 'string') {
                    validatePath(node.source, source);
                }
            },
        };
    },
});
