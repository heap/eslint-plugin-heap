import { ESLintUtils, TSESTree } from '@typescript-eslint/experimental-utils';
import {
  ReportFixFunction,
  RuleContext,
} from '@typescript-eslint/experimental-utils/dist/ts-eslint';

export const createRule = ESLintUtils.RuleCreator((ruleName) => ruleName);

interface ReportNodeDescriptor {
  readonly node: TSESTree.Node | TSESTree.Token;
  readonly loc?: Readonly<TSESTree.SourceLocation> | Readonly<TSESTree.LineAndColumnData>;
  message: string;
  fix?: ReportFixFunction;
}

export const reportForNode = (
  context: Readonly<RuleContext<any, any>>,
  descriptor: ReportNodeDescriptor,
) => {
  return context.report(descriptor as any);
};
