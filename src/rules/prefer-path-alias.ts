import { createRule } from '../utils/createRule';
import * as path from 'path';
import { loadConfig } from 'tsconfig-paths';
import { matchStar } from '../utils/matchStar';
import {
  ReportFixFunction,
  RuleContext,
  RuleFixer,
} from '@typescript-eslint/experimental-utils/dist/ts-eslint';
import { StringLiteral, Literal } from '@typescript-eslint/types/dist/ast-spec';
import { buildPathValidationListeners } from '../utils/buildPathValidationListeners';

type Options = { limitTo?: Array<string> };
type MessageIds = 'preferPathAlias';

const RULE_NAME = 'prefer-path-alias';

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
  node: Literal,
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
      return fixer.replaceText(node, `'${importWithAlias}'`);
    }
    return null;
  };
};

const buildPathValidator =
  (
    context: Readonly<RuleContext<'preferPathAlias', [Options]>>,
    options: Options,
    paths: Record<string, string[]>,
    absoluteBaseUrl: string,
    currentPath: string,
    currentAlias: string | undefined,
  ) =>
  (node: StringLiteral) => {
    const source = node.value;
    if (!source.includes('../')) {
      return;
    }
    const importPath = path.resolve(currentPath, source);
    const relativeImportPath = importPath.slice(absoluteBaseUrl.length + 1);
    const matchingAlias = getMatchingAlias(paths, relativeImportPath);
    if (!matchingAlias || matchingAlias === currentAlias) {
      return;
    }
    if (options.limitTo && !options.limitTo.includes(matchingAlias)) {
      return;
    }
    context.report({
      node,
      messageId: 'preferPathAlias',
      data: { alias: matchingAlias },
      fix: buildFixFunction(node, paths, matchingAlias, relativeImportPath),
    });
  };

export default createRule<[Options], MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      category: 'Best Practices',
      description: 'Prefer tsconfig path aliases to make refactoring easier',
      recommended: 'error',
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          limitTo: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
      },
    ],
    messages: {
      preferPathAlias: 'Path alias is preferred: `{{ alias }}`',
    },
  },
  defaultOptions: [{}],
  create: (context, [options]) => {
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
    const validatePath = buildPathValidator(
      context,
      options,
      paths,
      absoluteBaseUrl,
      currentPath,
      currentAlias,
    );
    return buildPathValidationListeners(validatePath);
  },
});
