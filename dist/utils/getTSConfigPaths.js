"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTSConfigPaths = void 0;
const tsconfig_paths_1 = require("tsconfig-paths");
const getTSConfigPaths = (cwd) => {
    const configLoaderResult = (0, tsconfig_paths_1.loadConfig)(cwd);
    if (configLoaderResult.resultType !== 'success') {
        throw new Error(`failed to init tsconfig-paths: ${configLoaderResult.message}`);
    }
    return configLoaderResult;
};
exports.getTSConfigPaths = getTSConfigPaths;
