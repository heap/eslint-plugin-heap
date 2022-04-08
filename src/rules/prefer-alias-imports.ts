import { createRule } from '../utils/createRule';
import * as path from 'path';
import { loadConfig } from 'tsconfig-paths';
import { matchStar } from '../utils/matchStar';
import { ReportFixFunction, RuleFixer } from '@typescript-eslint/experimental-utils/dist/ts-eslint';
import { ImportDeclaration } from '@typescript-eslint/types/dist/ast-spec';

type Options = [];
type MessageIds = 'preferAliasImports';

const RULE_NAME = 'prefer-alias-imports';

const getConfig = (cwd: string) => {
  const configLoaderResult = loadConfig(cwd);
  if (configLoaderResult.resultType !== 'success') {
    throw new Error(`failed to init tsconfig-paths: ${configLoaderResult.message}`);
  }
  return configLoaderResult;
};

const getMatchingAlias = (paths: Record<string, string[]>, search: string) => {
  return Object.keys(paths).find((globAlias) =>
    paths[globAlias].some((globPath) => !!matchStar(globPath, search)),
  );
};

const buildFixFunction = (
  node: ImportDeclaration,
  paths: Record<string, Array<string>>,
  matchingAlias: string,
  relativeImportPath: string,
): ReportFixFunction | undefined => {
  if (!matchingAlias.endsWith('*')) {
    return;
  }
  return (fixer: RuleFixer) => {
    let matched: string | undefined;
    paths[matchingAlias].forEach((globPath) => {
      const _matched = matchStar(globPath, relativeImportPath);
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

export default createRule<Options, MessageIds>({
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
      throw new Error(
        `"heap/${RULE_NAME} can only be used with '@typescript-eslint/parser' parser option specified`,
      );
    }
    const currentFilename = context.getFilename();
    const currentPath = path.dirname(context.getFilename());
    const { absoluteBaseUrl, paths } = getConfig(currentPath);
    const currentRelativeFilename = currentFilename.slice(absoluteBaseUrl.length + 1);
    const currentAlias = getMatchingAlias(paths, currentRelativeFilename);
    return {
      ImportDeclaration(node) {
        const source = node.source.value as string;
        if (!source.includes('../')) {
          return;
        }
        const importPath = path.resolve(currentPath, node.source.value as string);
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
