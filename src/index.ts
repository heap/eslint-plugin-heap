import noMobx from './rules/no-mobx';
import noExternalImports from './rules/no-external-imports';
import noRootStoreImports from './rules/no-root-store-imports';
import noWildcardImports from './rules/no-wildcard-imports';
import preferAliasImports from './rules/prefer-alias-imports';
import preferImmutableAssignments from './rules/prefer-immutable-assignments';

module.exports = {
  rules: {
    'no-mobx': noMobx,
    'no-external-imports': noExternalImports,
    'no-root-store-imports': noRootStoreImports,
    'no-wildcard-imports': noWildcardImports,
    'prefer-alias-imports': preferAliasImports,
    'prefer-immutable-assignments': preferImmutableAssignments,
  },
};
