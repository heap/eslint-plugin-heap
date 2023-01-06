"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const buildPathValidationListeners_1 = require("../utils/buildPathValidationListeners");
const createRule_1 = require("../utils/createRule");
const getTSConfigPaths_1 = require("../utils/getTSConfigPaths");
const resolvePathRelativeToBaseUrl_1 = require("../utils/resolvePathRelativeToBaseUrl");
const minimatch_1 = __importDefault(require("minimatch"));
const getDockerIgnorePatterns_1 = require("../utils/getDockerIgnorePatterns");
const fileSystem_1 = require("../utils/fileSystem");
const RULE_NAME = 'no-dockerignore';
const getExtension = (absoluteBaseUrl, relativePath) => {
    const fullImportPath = `${absoluteBaseUrl}/${relativePath}`;
    if ((0, fileSystem_1.fileExists)(`${fullImportPath}.ts`)) {
        return `${relativePath}.ts`;
    }
    if ((0, fileSystem_1.fileExists)(`${fullImportPath}.tsx`)) {
        return `${relativePath}.tsx`;
    }
    if ((0, fileSystem_1.fileExists)(`${fullImportPath}.d.ts`)) {
        return `${relativePath}.d.ts`;
    }
    return relativePath;
};
const folderContentsRemoved = (pattern) => !pattern.includes('*') || pattern.endsWith('/*');
const isDockerIgnored = (absoluteBaseUrl, importPathRelativeToProjectRoot) => {
    const relativePathWithExtension = getExtension(absoluteBaseUrl, importPathRelativeToProjectRoot);
    const dockerIgnorePatterns = (0, getDockerIgnorePatterns_1.getDockerIgnorePatterns)(`${absoluteBaseUrl}/.dockerignore`);
    return dockerIgnorePatterns.some((pattern) => {
        const result = (0, minimatch_1.default)(relativePathWithExtension, pattern);
        if (!result && folderContentsRemoved(pattern)) {
            return (0, minimatch_1.default)(relativePathWithExtension, `${pattern}/**`);
        }
        return result;
    });
};
exports.default = (0, createRule_1.createRule)({
    name: RULE_NAME,
    meta: {
        type: 'problem',
        docs: {
            category: 'Possible Errors',
            description: 'Prevent deploy failures by banning imports of files ignored by docker in production code.',
            recommended: 'error',
        },
        schema: [],
        messages: {
            noDockerignore: 'You are importing a file ingored by `.dockerignore`, which will cause deploys to fail. Either remove the import or rename the current file you are working in to match a pattern defined in `.dockerignore`',
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
        const { absoluteBaseUrl, paths } = (0, getTSConfigPaths_1.getTSConfigPaths)(currentPath);
        const currentFilenameRelativeToProjectRoot = currentFilename.slice(absoluteBaseUrl.length + 1);
        const isCurrentFileDockerIgnored = isDockerIgnored(absoluteBaseUrl, currentFilenameRelativeToProjectRoot);
        return (0, buildPathValidationListeners_1.buildPathValidationListeners)((node) => {
            const importSource = node.value;
            const importPathRelativeToProjectRoot = (0, resolvePathRelativeToBaseUrl_1.resolvePathRelativeToBaseUrl)(absoluteBaseUrl, paths, currentFilename, importSource);
            if (!isCurrentFileDockerIgnored &&
                isDockerIgnored(absoluteBaseUrl, importPathRelativeToProjectRoot)) {
                context.report({
                    node,
                    messageId: 'noDockerignore',
                });
            }
        });
    },
});
