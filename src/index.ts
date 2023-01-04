import noMobx from './rules/no-mobx';
import noExternalImports from './rules/no-external-imports';
import noRootStoreImports from './rules/no-root-store-imports';
import noWildcardImports from './rules/no-wildcard-imports';
import preferPathAlias from './rules/prefer-path-alias';
import requireTZ from './rules/require-tz';

module.exports = {
  rules: {
    'no-mobx': noMobx,
    'no-external-imports': noExternalImports,
    'no-root-store-imports': noRootStoreImports,
    'no-wildcard-imports': noWildcardImports,
    'prefer-path-alias': preferPathAlias,
    'require-tz': requireTZ,
  },
};
