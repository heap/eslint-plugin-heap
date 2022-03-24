import noMobx from './rules/no-mobx';
import noRootStoreImports from './rules/no-root-store-imports';
import noWildcardImports from './rules/no-wildcard-imports';

module.exports = {
  rules: {
    'no-mobx': noMobx,
    'no-root-store-imports': noRootStoreImports,
    'no-wildcard-imports': noWildcardImports,
  },
};
