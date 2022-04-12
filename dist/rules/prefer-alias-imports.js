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
const tsconfig_paths_1 = require("tsconfig-paths");
const matchStar_1 = require("../utils/matchStar");
const RULE_NAME = 'prefer-alias-imports';
const getConfig = (cwd) => {
    const configLoaderResult = (0, tsconfig_paths_1.loadConfig)(cwd);
    if (configLoaderResult.resultType !== 'success') {
        throw new Error(`failed to init tsconfig-paths: ${configLoaderResult.message}`);
    }
    return configLoaderResult;
};
const getMatchingAlias = (paths, search) => {
    return Object.keys(paths).find((globAlias) => paths[globAlias].some((globPath) => !!(0, matchStar_1.matchStar)(globPath, search)));
};
const buildFixFunction = (node, paths, matchingAlias, relativeImportPath) => {
    if (!matchingAlias.endsWith('*')) {
        return;
    }
    return (fixer) => {
        let matched;
        paths[matchingAlias].forEach((globPath) => {
            const _matched = (0, matchStar_1.matchStar)(globPath, relativeImportPath);
            if (_matched) {
                matched = _matched;
            }
        });
        if (matched) {
            const importWithAlias = matchingAlias.replace('*', matched);
            return fixer.replaceText(node.source, `'${importWithAlias}'`);
        }
        return null;
    };
};
exports.default = (0, createRule_1.createRule)({
    name: RULE_NAME,
    meta: {
        type: 'problem',
        docs: {
            category: 'Best Practices',
            description: 'Prefer tsconfig path aliases to make refactoring easier',
            recommended: 'error',
        },
        fixable: 'code',
        schema: [],
        messages: {
            preferAliasImports: 'Path alias is preferred: `{{ alias }}`',
        },
    },
    defaultOptions: [],
    create: (context) => {
        const { parserServices } = context;
        if (!parserServices) {
            throw new Error(`"heap/${RULE_NAME} can only be used with '@typescript-eslint/parser' parser option specified`);
        }
        const currentFilename = context.getFilename();
        const currentPath = path.dirname(context.getFilename());
        const { absoluteBaseUrl, paths } = getConfig(currentPath);
        const currentRelativeFilename = currentFilename.slice(absoluteBaseUrl.length + 1);
        const currentAlias = getMatchingAlias(paths, currentRelativeFilename);
        return {
            ImportDeclaration(node) {
                const source = node.source.value;
                if (!source.includes('../')) {
                    return;
                }
                const importPath = path.resolve(currentPath, node.source.value);
                const relativeImportPath = importPath.slice(absoluteBaseUrl.length + 1);
                const matchingAlias = getMatchingAlias(paths, relativeImportPath);
                if (!matchingAlias || matchingAlias === currentAlias) {
                    return;
                }
                context.report({
                    node,
                    messageId: 'preferAliasImports',
                    data: { alias: matchingAlias },
                    fix: buildFixFunction(node, paths, matchingAlias, relativeImportPath),
                });
            },
        };
    },
});
