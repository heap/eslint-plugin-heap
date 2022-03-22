const isIdentifier = ({ type }) => type === 'Identifier' || type === 'JSXIdentifier';

const findUsages = (program, importIdentifierValue) => {
  const tokens = program.tokens;
  if (!Array.isArray(tokens)) {
    return {};
  }
  const uniqueUsages = new Set();
  const usageRecords = [];
  for (let i = 2; i < tokens.length; i++) {
    const identifier = tokens[i - 2];
    const punctuator = tokens[i - 1];
    const token = tokens[i];
    if (
      isIdentifier(identifier) &&
      identifier.value === importIdentifierValue &&
      punctuator.type === 'Punctuator'
    ) {
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

const buildFixFunction = (node, usages, usageRecords) => (fixer) => {
  const fixes = [];
  fixes.push(fixer.replaceText(node, `{ ${usages.join(', ')} }`));
  usageRecords.forEach(({ identifierRange, punctuatorRange }) => {
    const range = [identifierRange[0], punctuatorRange[1]];
    fixes.push(fixer.removeRange(range));
  });
  return fixes;
};

const reportError = (context, node, source) => {
  const program = node.parent.parent;
  const importName = node.local.name; // e.g. for "import * as _", this will be "_"
  const { usages, usageRecords } = findUsages(program, importName);
  const message = `Wilcard imports ("import * as") are banned for ${source}. Destructure only the modules you need`;
  if (usages && usages.length) {
    context.report({
      node,
      message,
      fix: buildFixFunction(node, usages, usageRecords),
    });
  } else {
    context.report(node, message);
  }
};

const create = (context) => {
  return {
    ImportNamespaceSpecifier(node) {
      const source = node.parent.source.value;
      const options = context.options && context.options.length ? context.options[0] : {};
      if (!options.packages) {
        reportError(context, node, source);
        return;
      }
      if (!Array.isArray(options.packages)) {
        throw new Error(
          `"packages" option must be an Array for heap/no-wildcard-import eslint rule`,
        );
      }
      if (options.packages.includes(source)) {
        reportError(context, node, source);
      }
    },
  };
};

module.exports = { create };
