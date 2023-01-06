import * as path from 'path';

const resolveTSConfigPath = (tsConfigPaths: Record<string, Array<string>>, importPath: string) => {
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

export const resolvePathRelativeToBaseUrl = (
  absoluteBaseUrl: string,
  tsConfigPaths: Record<string, Array<string>>,
  currentFilePath: string,
  importPath: string,
) => {
  if (importPath.startsWith('@')) {
    return resolveTSConfigPath(tsConfigPaths, importPath);
  }
  if (importPath.startsWith('.')) {
    const resolvedPath = path.resolve(currentFilePath, `../${importPath}`);
    return resolvedPath.slice(absoluteBaseUrl.length + 1);
  }
  return importPath;
};
