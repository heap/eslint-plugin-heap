import type { CallExpression, Expression, Literal } from '@typescript-eslint/types/dist/ast-spec';
import { createRule } from '../utils/createRule';
import type {
  ReportFixFunction,
  RuleFix,
} from '@typescript-eslint/experimental-utils/dist/ts-eslint';

type MessageIds = 'requireTZ' | 'noMomentUnaryExpression';

const RULE_NAME = 'require-tz';

const isMomentImport = (literal: Expression) =>
  literal.type === 'Literal' && ('moment' === literal.value || 'moment-timezone' === literal.value);

// determines if "+moment()" is being used
const isArglessUnaryExpression = (node: CallExpression) =>
  !node.arguments.length && node.parent?.type === 'UnaryExpression';

const hasTZAppendedToMomentInstance = (node: CallExpression) =>
  node.parent?.type === 'MemberExpression' &&
  node.parent.property.type === 'Identifier' &&
  (node.parent.property.name === 'tz' || node.parent.property.name === 'utc');

const buildFixFunction =
  (
    node: CallExpression,
    momentIdentifierName: string,
    momentImportLiteral: Literal,
  ): ReportFixFunction =>
  (fixer) => {
    const fixes: Array<RuleFix> = [];
    if (momentImportLiteral.value === 'moment') {
      fixes.push(fixer.replaceTextRange(momentImportLiteral.range, "'moment-timezone'"));
    }
    if (node.arguments.length) {
      const lastArgument = node.arguments[node.arguments.length - 1];
      fixes.push(fixer.insertTextAfter(node.callee, '.tz'));
      fixes.push(fixer.insertTextAfter(lastArgument, `, ${momentIdentifierName}.tz.guess()`));
    } else {
      fixes.push(
        fixer.replaceTextRange(
          node.range,
          `${momentIdentifierName}.tz(${momentIdentifierName}.tz.guess())`,
        ),
      );
    }
    return fixes;
  };

export default createRule<[], MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      category: 'Possible Errors',
      description: 'Enforce using non default moment constructor',
      recommended: 'error',
    },
    fixable: 'code',
    schema: [],
    messages: {
      requireTZ: 'Must use moment.tz or moment.utc instead of default constructor',
      noMomentUnaryExpression: 'Use Date.now() instead of +moment()',
    },
  },
  defaultOptions: [],
  create: (context) => {
    let momentIdentifierName: string | null = null;
    let momentImportLiteral: Literal | null = null;
    return {
      TSImportEqualsDeclaration(node) {
        if (node.moduleReference.type == 'TSExternalModuleReference') {
          const literal = node.moduleReference.expression;
          if (isMomentImport(literal)) {
            momentIdentifierName = node.id.name;
            momentImportLiteral = literal as Literal;
          }
        }
      },
      ImportDeclaration(node) {
        if (isMomentImport(node.source) && node.specifiers.length === 1) {
          momentIdentifierName = node.specifiers[0].local.name;
          momentImportLiteral = node.source;
        }
      },
      CallExpression(node) {
        if (
          momentIdentifierName &&
          momentImportLiteral &&
          node.callee.type === 'Identifier' &&
          node.callee.name === momentIdentifierName
        ) {
          const shouldExcludeFromErrorReporting =
            hasTZAppendedToMomentInstance(node) || // `moment().tz('America/Chicago')` allowed
            isArglessUnaryExpression(node); // `+moment()` allowed

          if (!shouldExcludeFromErrorReporting) {
            context.report({
              node,
              messageId: 'requireTZ',
              fix: buildFixFunction(node, momentIdentifierName, momentImportLiteral),
            });
          }
        }
      },
    };
  },
});
