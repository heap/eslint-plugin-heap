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
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvePathRelativeToBaseUrl = void 0;
const path = __importStar(require("path"));
const resolveTSConfigPath = (tsConfigPaths, importPath) => {
    if (!importPath.startsWith('@')) {
        return importPath;
    }
    for (const [pathKey, pathValue] of Object.entries(tsConfigPaths)) {
        if (importPath.startsWith(pathKey.substring(0, pathKey.length - 1))) {
            const key = pathKey.substring(0, pathKey.length - 2);
            const value = pathValue[0].substring(0, pathValue[0].length - 2);
            return importPath.replace(key, value);
        }
    }
    return importPath;
};
const resolvePathRelativeToBaseUrl = (absoluteBaseUrl, tsConfigPaths, currentFilePath, importPath) => {
    if (importPath.startsWith('@')) {
        return resolveTSConfigPath(tsConfigPaths, importPath);
    }
    if (importPath.startsWith('.')) {
        const resolvedPath = path.resolve(currentFilePath, `../${importPath}`);
        return resolvedPath.slice(absoluteBaseUrl.length + 1);
    }
    return importPath;
};
exports.resolvePathRelativeToBaseUrl = resolvePathRelativeToBaseUrl;
