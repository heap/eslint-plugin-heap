import {
  ReportFixFunction,
  RuleContext,
} from '@typescript-eslint/experimental-utils/dist/ts-eslint';
import {
  ImportDeclaration,
  ImportNamespaceSpecifier,
  Program,
  Range,
  Token,
} from '@typescript-eslint/types/dist/ast-spec';
import { createRule } from '../utils/createRule';

interface UsageRecord {
  identifierRange: [number, number];
  punctuatorRange: [number, number];
  usage: string;
}

const isIdentifier = ({ type }: Token) => type === 'Identifier' || type === 'JSXIdentifier';

const isOccurrence = (identifier: Token, punctuator: Token, identifierValueToFind: string) =>
  isIdentifier(identifier) &&
  identifier.value === identifierValueToFind &&
  punctuator.type === 'Punctuator';

const isInvalidUsage = (program: Program, importIdentifierValue: string, usageToFind: string) => {
  const tokens = program.tokens;
  if (!Array.isArray(tokens)) {
    return true;
  }
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].value === usageToFind) {
      if (i < 2) {
        return true;
      }
      const identifier = tokens[i - 2];
      const punctuator = tokens[i - 1];
      if (!isOccurrence(identifier, punctuator, importIdentifierValue)) {
        return true;
      }
    }
  }
  return false;
};

const findValidUsages = (program: Program, importIdentifierValue: string) => {
  const tokens = program.tokens;
  if (!Array.isArray(tokens)) {
    return {};
  }
  const uniqueUsages = new Set<string>();
  const usageRecords: Array<UsageRecord> = [];
  for (let i = 2; i < tokens.length; i++) {
    const identifier = tokens[i - 2];
    const punctuator = tokens[i - 1];
    const token = tokens[i];
    if (isOccurrence(identifier, punctuator, importIdentifierValue)) {
      if (punctuator.value === '.') {
        /**
         * example:
         *
         * idenifier.value = "_"
         * punctuator.value = "."
         * token.value = "noop"
         *
         * code snippet: `_.noop`
         */
        uniqueUsages.add(token.value);
        usageRecords.push({
          identifierRange: identifier.range,
          punctuatorRange: punctuator.range,
          usage: token.value,
        });
      } else {
        // if encountering usage in any other way, do not autofix the file
        return {};
      }
    }
  }
  const usages = Array.from(uniqueUsages);
  usages.sort();
  return { usages, usageRecords };
};

const buildFixFunction =
  (
    node: ImportNamespaceSpecifier,
    usages: Array<string>,
    usageRecords: Array<UsageRecord>,
  ): ReportFixFunction =>
  (fixer) => {
    const fixes = [];
    fixes.push(fixer.replaceText(node, `{ ${usages.join(', ')} }`));
    usageRecords.forEach(({ identifierRange, punctuatorRange }) => {
      const range: Range = [identifierRange[0], punctuatorRange[1]];
      fixes.push(fixer.removeRange(range));
    });
    return fixes;
  };

const reportLintError = (
  context: Readonly<RuleContext<'noWildcardImports', Options>>,
  node: ImportNamespaceSpecifier,
  source: string,
) => {
  const parent = node.parent as ImportDeclaration;
  const program = parent.parent as Program;
  const importName = node.local.name; // e.g. for "import * as _", this will be "_"
  const { usages, usageRecords } = findValidUsages(program, importName);
  const hasInvalidUsages = usages?.some((usage) => isInvalidUsage(program, importName, usage));
  if (usages?.length && usageRecords?.length && !hasInvalidUsages) {
    context.report({
      node,
      messageId: 'noWildcardImports',
      data: { source },
      fix: buildFixFunction(node, usages, usageRecords),
    });
  } else {
    context.report({ node, messageId: 'noWildcardImports', data: { source } });
  }
};

type Options = [{ packages?: Array<string> }];
type MessageIds = 'noWildcardImports';

export default createRule<Options, MessageIds>({
  name: 'no-wildcard-imports',
  meta: {
    type: 'problem',
    docs: {
      category: 'Best Practices',
      description:
        'discorage wildcard imports since it increases frontend bundle size and ts-node startup time',
      recommended: 'error',
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          packages: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
      },
    ],
    messages: {
      noWildcardImports:
        'Wilcard imports ("import * as") are banned for {{ source }}. Destructure only the functionality you need',
    },
  },
  defaultOptions: [{}],
  create: (context, [options]) => {
    return {
      ImportNamespaceSpecifier(node) {
        if (node.parent) {
          const parent = node.parent as ImportDeclaration;
          const source = parent.source.value as string;
          if (!options.packages) {
            reportLintError(context, node, source);
            return;
          }
          if (!Array.isArray(options.packages)) {
            throw new Error(
              '"packages" option must be an Array for heap/no-wildcard-import eslint rule',
            );
          }
          if (options.packages.includes(source)) {
            reportLintError(context, node, source);
          }
        }
      },
    };
  },
});
