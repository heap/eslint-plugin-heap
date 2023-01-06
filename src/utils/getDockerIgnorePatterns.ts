import { getFileContents, getLastModifiedTimestamp } from './fileSystem';

const dockerignoreCache: Record<string, Array<string>> = {};

const parsePattern = (line: string) => {
  let pattern: string = line;
  const hashIndex = pattern.indexOf('#');
  if (hashIndex > -1) {
    pattern = pattern.slice(0, hashIndex);
  }
  return pattern.trim();
};

export const getDockerIgnorePatterns = (dockerignorePath: string) => {
  try {
    const lastModifiedTimeStamp = getLastModifiedTimestamp(dockerignorePath);
    const cacheKey = `${dockerignorePath}:${lastModifiedTimeStamp}`;
    if (dockerignoreCache[cacheKey]) {
      return dockerignoreCache[cacheKey];
    }
    const fileContents = getFileContents(dockerignorePath);
    const results = fileContents.split('\n').reduce((acc, line) => {
      const pattern = parsePattern(line);
      if (pattern) {
        acc.push(pattern);
      }
      return acc;
    }, [] as Array<string>);
    dockerignoreCache[cacheKey] = results;
    return results;
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      return [];
    }
    throw err;
  }
};
