import { Program, Token } from '@typescript-eslint/types/dist/ast-spec';
import { createRule } from '../utils/createRule';

type Options = [];
type MessageIds = 'preferImmutableAssignments';

const isIdentifier = ({ type }: Token) => type === 'Identifier' || type === 'JSXIdentifier';

const isInvalidUsage = (program: Program, importIdentifierValue: string) => {
  const tokens = program.tokens;
  if (!Array.isArray(tokens) || tokens.length < 5) {
    return false;
  }

  for (let i = 5; i < tokens.length; i++) {
    const lodashIdentifier = tokens[i - 5];
    const dotPunctuator = tokens[i - 4];
    const mergeIdentifier = tokens[i - 3];
    const openParenPunctuator = tokens[i - 2];
    const firstArgIdentifier = tokens[i - 1];
    const secondArgIdentifier = tokens[i];

    const isFirstArgEmptyObject =
      firstArgIdentifier.type === 'Punctuator' &&
      firstArgIdentifier.value === '{' &&
      secondArgIdentifier.type === 'Punctuator' &&
      secondArgIdentifier.value === '}';

    if (
      isIdentifier(lodashIdentifier) &&
      lodashIdentifier.value === importIdentifierValue &&
      dotPunctuator.type === 'Punctuator' &&
      dotPunctuator.value === '.' &&
      isIdentifier(mergeIdentifier) &&
      mergeIdentifier.value === 'merge' &&
      openParenPunctuator.type === 'Punctuator' &&
      openParenPunctuator.value === '(' &&
      !isFirstArgEmptyObject
    ) {
      return true;
    }
  }
  return false;
};

export default createRule<Options, MessageIds>({
  name: 'prefer-immutable-assignments',
  meta: {
    type: 'problem',
    docs: {
      category: 'Best Practices',
      description: 'discourage merge and assign without empty object as first argument',
      recommended: 'error',
    },
    schema: [],
    messages: {
      preferImmutableAssignments: 'Add an empty object as the first argument',
    },
  },
  defaultOptions: [],
  create: (context) => {
    return {
      ImportDeclaration(node) {
        if (node.source.value === 'lodash') {
          const libraryNode = node.specifiers[0]?.local;
          if (libraryNode?.type === 'Identifier') {
            const libraryName = libraryNode?.name;
            if (libraryName) {
              const program = node.parent as Program;
              if (isInvalidUsage(program, libraryName)) {
                context.report({
                  node,
                  messageId: 'preferImmutableAssignments',
                });
              }
            }
          }
        }
      },
    };
  },
});
