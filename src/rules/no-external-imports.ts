import { createRule } from '../utils/createRule';
import * as path from 'path';
import * as tsconfigPaths from 'tsconfig-paths';
import { matchStar } from '../utils/matchStar';
import { RuleContext } from '@typescript-eslint/experimental-utils/dist/ts-eslint';
import {
  Identifier,
  LeftHandSideExpression,
  Literal,
} from '@typescript-eslint/types/dist/ast-spec';

type Options = { allowedImports?: Array<string> };
type MessageIds = 'noExternalImports';

const RULE_NAME = 'no-external-imports';

const getConfig = (cwd: string) => {
  const configLoaderResult = tsconfigPaths.loadConfig(cwd);
  if (configLoaderResult.resultType !== 'success') {
    throw new Error(`failed to init tsconfig-paths: ${configLoaderResult.message}`);
  }
  return configLoaderResult;
};

const getMatchingAlias = (paths: Record<string, string[]>, search: string) => {
  return Object.keys(paths).find((pathsConfigKey) =>
    paths[pathsConfigKey].some((pathsConfigValue) => !!matchStar(pathsConfigValue, search)),
  );
};

const buildPathValidator = (
  context: Readonly<RuleContext<'noExternalImports', [Options]>>,
  options: Options,
  paths: Record<string, string[]>,
  absoluteBaseUrl: string,
  currentPath: string,
  currentAlias: string | undefined,
) => {
  const getMatchingAliasForSource = (source: string) => {
    if (!source.includes('../')) {
      const matchedKey = Object.keys(paths).find(
        (pathsConfigKey) => !!matchStar(pathsConfigKey, source),
      );
      if (matchedKey) {
        return matchedKey;
      }
    }
    const importPath = path.resolve(currentPath, source);
    const relativeImportPath = importPath.slice(absoluteBaseUrl.length + 1);
    const matchingAlias = getMatchingAlias(paths, relativeImportPath);
    return matchingAlias;
  };
  return (node: Literal, source: string) => {
    const matchingAlias = getMatchingAliasForSource(source);
    if (matchingAlias === currentAlias) {
      return;
    }
    if (
      matchingAlias &&
      Array.isArray(options.allowedImports) &&
      options.allowedImports.includes(matchingAlias)
    ) {
      return;
    }
    context.report({
      node,
      messageId: 'noExternalImports',
      data: { alias: currentAlias },
    });
  };
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
      description: 'Disallow imports from outside of a specified module',
      recommended: 'error',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowedImports: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
      },
    ],
    messages: {
      noExternalImports:
        'Importing from outside of {{ alias }} is not allowed. Add to "allowedImports" option if a new dependency is needed.',
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
    return {
      TSImportEqualsDeclaration(node) {
        if (node.moduleReference.type == 'TSExternalModuleReference') {
          const literal = node.moduleReference.expression;
          if (literal && literal.type === 'Literal') {
            const source = literal.value;
            if (typeof source === 'string') {
              validatePath(literal, source);
            }
          }
        }
      },
      CallExpression(node) {
        if (isRequireStatement(node.callee) || isJestMock(node.callee)) {
          const literal = node.arguments[0] ?? {};
          if (literal && literal.type === 'Literal') {
            const source = literal.value;
            if (typeof source === 'string') {
              validatePath(literal, source);
            }
          }
        }
      },
      ImportDeclaration(node) {
        const source = node.source.value;
        if (typeof source === 'string') {
          validatePath(node.source, source);
        }
      },
    };
  },
});
