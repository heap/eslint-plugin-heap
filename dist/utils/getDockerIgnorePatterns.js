"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDockerIgnorePatterns = void 0;
const fileSystem_1 = require("./fileSystem");
const dockerignoreCache = {};
const parsePattern = (line) => {
    let pattern = line;
    const hashIndex = pattern.indexOf('#');
    if (hashIndex > -1) {
        pattern = pattern.slice(0, hashIndex);
    }
    return pattern.trim();
};
const getDockerIgnorePatterns = (dockerignorePath) => {
    try {
        const lastModifiedTimeStamp = (0, fileSystem_1.getLastModifiedTimestamp)(dockerignorePath);
        const cacheKey = `${dockerignorePath}:${lastModifiedTimeStamp}`;
        if (dockerignoreCache[cacheKey]) {
            return dockerignoreCache[cacheKey];
        }
        const fileContents = (0, fileSystem_1.getFileContents)(dockerignorePath);
        const results = fileContents.split('\n').reduce((acc, line) => {
            const pattern = parsePattern(line);
            if (pattern) {
                acc.push(pattern);
            }
            return acc;
        }, []);
        dockerignoreCache[cacheKey] = results;
        return results;
    }
    catch (err) {
        if (err.code === 'ENOENT') {
            return [];
        }
        throw err;
    }
};
exports.getDockerIgnorePatterns = getDockerIgnorePatterns;
