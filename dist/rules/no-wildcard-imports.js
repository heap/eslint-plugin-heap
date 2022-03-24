"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const createRule_1 = require("../utils/createRule");
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
        if (isIdentifier(identifier) &&
            identifier.value === importIdentifierValue &&
            punctuator.type === 'Punctuator') {
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
            }
            else {
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
const reportLintError = (context, node, source) => {
    const program = node.parent.parent;
    const importName = node.local.name; // e.g. for "import * as _", this will be "_"
    const { usages, usageRecords } = findUsages(program, importName);
    const message = `Wilcard imports ("import * as") are banned for ${source}. Destructure only the modules you need`;
    if (usages && usages.length) {
        (0, createRule_1.reportForNode)(context, {
            node,
            message,
            fix: buildFixFunction(node, usages, usageRecords),
        });
    }
    else {
        context.report(node, message);
    }
};
exports.default = (0, createRule_1.createRule)({
    name: 'no-wildcard-imports',
    meta: {
        type: 'problem',
        docs: {
            category: 'Best Practices',
            description: 'discorage wildcard imports since it increases frontend bundle size and ts-node startup time',
            recommended: 'error'
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
                        }
                    },
                },
            },
        ],
        messages: {
            noWildcardImports: 'Wilcard imports ("import * as") are banned for this library. Destructure only the functionality you need',
        }
    },
    defaultOptions: [{}],
    create: (context, [options]) => {
        return {
            ImportNamespaceSpecifier(node) {
                if (node.parent) {
                    const parent = node.parent;
                    const source = parent.source.value;
                    if (!options.packages) {
                        reportLintError(context, node, source);
                        return;
                    }
                    if (!Array.isArray(options.packages)) {
                        throw new Error(`"packages" option must be an Array for heap/no-wildcard-import eslint rule`);
                    }
                    if (options.packages.includes(source)) {
                        reportLintError(context, node, source);
                    }
                }
            },
        };
    }
});
