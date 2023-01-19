import type { CallExpression, Expression, Literal } from '@typescript-eslint/types/dist/ast-spec';
import { createRule } from '../utils/createRule';

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

export default createRule<[], MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      category: 'Possible Errors',
      description: 'Enforce using non default moment constructor',
      recommended: 'error',
    },
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
            });
          }
        }
      },
    };
  },
});
