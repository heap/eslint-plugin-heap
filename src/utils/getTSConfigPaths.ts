import { loadConfig } from 'tsconfig-paths';

export const getTSConfigPaths = (cwd: string) => {
  const configLoaderResult = loadConfig(cwd);
  if (configLoaderResult.resultType !== 'success') {
    throw new Error(`failed to init tsconfig-paths: ${configLoaderResult.message}`);
  }
  return configLoaderResult;
};
