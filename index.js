module.exports = {
  rules: {
    'no-mobx': {
      create: function (context) {
        return {
          Decorator(node) {
            const options = context.options && context.options.length ? context.options[0] : {};
            const message = options.message || 'MobX not allowed';
            const name = node.expression && node.expression.name;
            if (name === 'observable' || name === 'action') {
              context.report(node, message);
            }
          },
        };
      },
    },
    'no-root-store-import': {
      create: function (context) {
        return {
          ImportDeclaration(node) {
            const options = context.options && context.options.length ? context.options[0] : {};
            const message = options.message || 'Do not import RootStore';
            if (node.source.value.endsWith('/stores')) {
              context.report(node, message);
            }
          },
        };
      },
    },
  },
};
