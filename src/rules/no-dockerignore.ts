import { StringLiteral } from '@typescript-eslint/types/dist/ast-spec';
import * as path from 'path';
import { buildPathValidationListeners } from '../utils/buildPathValidationListeners';
import { createRule } from '../utils/createRule';
import { getTSConfigPaths } from '../utils/getTSConfigPaths';
import { resolvePathRelativeToBaseUrl } from '../utils/resolvePathRelativeToBaseUrl';
import minimatch from 'minimatch';
import { getDockerIgnorePatterns } from '../utils/getDockerIgnorePatterns';
import { fileExists } from '../utils/fileSystem';

type MessageIds = 'noDockerignore';

const RULE_NAME = 'no-dockerignore';

const getExtension = (absoluteBaseUrl: string, relativePath: string) => {
  const fullImportPath = `${absoluteBaseUrl}/${relativePath}`;
  if (fileExists(`${fullImportPath}.ts`)) {
    return `${relativePath}.ts`;
  }
  if (fileExists(`${fullImportPath}.tsx`)) {
    return `${relativePath}.tsx`;
  }
  if (fileExists(`${fullImportPath}.d.ts`)) {
    return `${relativePath}.d.ts`;
  }
  return relativePath;
};

const folderContentsRemoved = (pattern: string) => !pattern.includes('*') || pattern.endsWith('/*');

const isDockerIgnored = (absoluteBaseUrl: string, importPathRelativeToProjectRoot: string) => {
  const relativePathWithExtension = getExtension(absoluteBaseUrl, importPathRelativeToProjectRoot);
  const dockerIgnorePatterns = getDockerIgnorePatterns(`${absoluteBaseUrl}/.dockerignore`);
  return dockerIgnorePatterns.some((pattern) => {
    const result = minimatch(relativePathWithExtension, pattern);
    if (!result && folderContentsRemoved(pattern)) {
      return minimatch(relativePathWithExtension, `${pattern}/**`);
    }
    return result;
  });
};

export default createRule<[], MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      category: 'Possible Errors',
      description:
        'Prevent deploy failures by banning imports of files ignored by docker in production code.',
      recommended: 'error',
    },
    schema: [],
    messages: {
      noDockerignore:
        'You are importing a file ingored by `.dockerignore`, which will cause deploys to fail. Either remove the import or rename the current file you are working in to match a pattern defined in `.dockerignore`',
    },
  },
  defaultOptions: [],
  create: (context) => {
    const { parserServices } = context;
    if (!parserServices) {
      throw new Error(
        `"heap/${RULE_NAME} can only be used with '@typescript-eslint/parser' parser option specified`,
      );
    }
    const currentFilename = context.getFilename();
    const currentPath = path.dirname(context.getFilename());
    const { absoluteBaseUrl, paths } = getTSConfigPaths(currentPath);
    const currentFilenameRelativeToProjectRoot = currentFilename.slice(absoluteBaseUrl.length + 1);
    const isCurrentFileDockerIgnored = isDockerIgnored(
      absoluteBaseUrl,
      currentFilenameRelativeToProjectRoot,
    );
    return buildPathValidationListeners((node: StringLiteral) => {
      const importSource = node.value;
      const importPathRelativeToProjectRoot = resolvePathRelativeToBaseUrl(
        absoluteBaseUrl,
        paths,
        currentFilename,
        importSource,
      );
      if (
        !isCurrentFileDockerIgnored &&
        isDockerIgnored(absoluteBaseUrl, importPathRelativeToProjectRoot)
      ) {
        context.report({
          node,
          messageId: 'noDockerignore',
        });
      }
    });
  },
});
