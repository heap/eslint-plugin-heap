import { createRule, reportForNode } from '../utils/createRule';

type Options = [{ message?: string }];
type MessageIds = 'noMobx';

const MESSAGE = 'MobX not allowed';

export default createRule<Options, MessageIds>({
  name: 'no-mobx',
  meta: {
    type: 'problem',
    docs: {
      category: 'Best Practices',
      description: 'do not allow MobX since it is not compatible with upcoming React features',
      recommended: 'error',
    },
    schema: [
      {
        type: 'object',
        properties: {
          message: {
            type: 'string',
          },
        },
      },
    ],
    messages: {
      noMobx: MESSAGE,
    },
  },
  defaultOptions: [{}],
  create: (context, [options]) => {
    return {
      Decorator(node) {
        const name = node.expression && (node.expression as any).name;
        if (name === 'observable' || name === 'action') {
          const message = options?.message ?? MESSAGE;
          reportForNode(context, { node, message });
        }
      },
    };
  },
});
