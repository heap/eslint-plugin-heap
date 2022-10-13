import { createRule } from '../utils/createRule';
import * as path from 'path';
import { loadConfig } from 'tsconfig-paths';
import { matchStar } from '../utils/matchStar';
import {
  ReportFixFunction,
  RuleContext,
  RuleFixer,
} from '@typescript-eslint/experimental-utils/dist/ts-eslint';
import {
  Expression,
  Identifier,
  LeftHandSideExpression,
  Literal,
} from '@typescript-eslint/types/dist/ast-spec';

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
  (node: Literal, source: string) => {
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

const isRequireStatement = (expression: LeftHandSideExpression) =>
  expression.type === 'Identifier' && getIdentifierName(expression) === 'require';

const isJestMock = (expression: LeftHandSideExpression) =>
  expression.type === 'MemberExpression' &&
  getIdentifierName(expression.object) === 'jest' &&
  getIdentifierName(expression.property) === 'mock';

const getIdentifierName = (node: any) =>
  node.type === 'Identifier' ? (node as Identifier).name : undefined;

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
    const validateExpression = (source: Expression | null) => {
      if (source?.type === 'Literal') {
        const literal = source as Literal;
        if (typeof literal.value === 'string') {
          validatePath(literal, literal.value);
        }
      }
    };
    return {
      TSImportEqualsDeclaration(node) {
        if (node.moduleReference.type == 'TSExternalModuleReference') {
          const literal = node.moduleReference.expression;
          validateExpression(literal);
        }
      },
      CallExpression(node) {
        if (isRequireStatement(node.callee) || isJestMock(node.callee)) {
          const literal = (node.arguments[0] ?? null) as Expression | null;
          validateExpression(literal);
        }
      },
      ImportDeclaration(node) {
        validateExpression(node.source);
      },
      ExportAllDeclaration(node) {
        validateExpression(node.source);
      },
      ExportNamedDeclaration(node) {
        validateExpression(node.source);
      },
    };
  },
});
