import type { RuleListener } from '@typescript-eslint/experimental-utils/dist/ts-eslint';
import type {
  Expression,
  Identifier,
  LeftHandSideExpression,
  Literal,
  StringLiteral,
} from '@typescript-eslint/types/dist/ast-spec';

const getIdentifierName = (node: any) =>
  node.type === 'Identifier' ? (node as Identifier).name : undefined;

const isRequireStatement = (expression: LeftHandSideExpression) =>
  expression.type === 'Identifier' && getIdentifierName(expression) === 'require';

const isJestMock = (expression: LeftHandSideExpression) =>
  expression.type === 'MemberExpression' &&
  getIdentifierName(expression.object) === 'jest' &&
  getIdentifierName(expression.property) === 'mock';

export const buildPathValidationListeners = (
  pathValidator: (node: StringLiteral) => void,
): RuleListener => {
  const validateExpression = (source: Expression | null) => {
    if (source?.type === 'Literal') {
      const literal = source as Literal;
      if (typeof literal.value === 'string') {
        pathValidator(literal as StringLiteral);
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
};
