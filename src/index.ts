import noMobx from './rules/no-mobx';
import noExternalImports from './rules/no-external-imports';
import noRootStoreImports from './rules/no-root-store-imports';
import noDockerignore from './rules/no-dockerignore';
import noWildcardImports from './rules/no-wildcard-imports';
import preferPathAlias from './rules/prefer-path-alias';
import requireTZ from './rules/require-tz';
import noEmotionCssInstanceClassname from './rules/no-emotion-css-instance-classname';

module.exports = {
  rules: {
    'no-mobx': noMobx,
    'no-dockerignore': noDockerignore,
    'no-external-imports': noExternalImports,
    'no-root-store-imports': noRootStoreImports,
    'no-wildcard-imports': noWildcardImports,
    'prefer-path-alias': preferPathAlias,
    'require-tz': requireTZ,
    'no-emotion-css-instance-classname': noEmotionCssInstanceClassname,
  },
};
