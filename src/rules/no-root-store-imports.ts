import { createRule, reportForNode } from '../utils/createRule';

type Options = [{ message?: string }];
type MessageIds = 'noRootStoreImports';

const MESSAGE = 'RootStore imports are not allowed';

export default createRule<Options, MessageIds>({
  name: 'no-root-store-imports',
  meta: {
    type: 'problem',
    docs: {
      category: 'Best Practices',
      description: 'discourage use of RootStore imports',
      recommended: 'error'
    },
    schema: [{
      type: 'object',
      properties: {
        message: {
          type: 'string',
        },
      },
    }],
    messages: {
      noRootStoreImports: MESSAGE,
    }
  },
  defaultOptions: [{}],
  create: (context, [options]) => ({
    ImportDeclaration(node) {
      const sourceValue = node.source.value;
      if (typeof sourceValue === 'string' && sourceValue.endsWith('/stores')) {
        const message = options?.message ?? MESSAGE;
        reportForNode(context, { node, message })
      }
    },
  })
});
