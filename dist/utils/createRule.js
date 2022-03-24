"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportForNode = exports.createRule = void 0;
const experimental_utils_1 = require("@typescript-eslint/experimental-utils");
exports.createRule = experimental_utils_1.ESLintUtils.RuleCreator((ruleName) => ruleName);
const reportForNode = (context, descriptor) => {
    return context.report(descriptor);
};
exports.reportForNode = reportForNode;
