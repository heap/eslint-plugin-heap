import * as tsconfigPaths from 'tsconfig-paths';
import { RuleTester } from '@typescript-eslint/experimental-utils/dist/ts-eslint';
import preferPathAlias from './prefer-path-alias';
import { ConfigLoaderResult } from 'tsconfig-paths';

const ruleTester: RuleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
});

const absoluteBaseUrl = '/path/to/myapp';

jest.spyOn(tsconfigPaths, 'loadConfig').mockReturnValue({
  resultType: 'success',
  absoluteBaseUrl,
  paths: {
    cypress: ['./node_modules/cypress'],
    '@module1/*': ['first_module/*'],
    '@module2/*': ['second_module/*'],
    '@nested/*': ['third_module/nested/*'],
  },
} as unknown as ConfigLoaderResult);

ruleTester.run('preferPathAlias', preferPathAlias, {
  valid: [
    {
      // relative imports that don't peek into other modules are fine
      filename: `${absoluteBaseUrl}/first_module/myfolder/myfile.ts`,
      code: "import { something } from '../internal_file';",
    },
    {
      // technically it's the same module, so no error is thrown
      filename: `${absoluteBaseUrl}/first_module/myfolder/myfile.ts`,
      code: "import { something } from '../../first_module/internal_file';",
    },
  ],
  invalid: [
    {
      filename: `${absoluteBaseUrl}/first_module/myfolder/myfile.ts`,
      code: "import { something } from '../../second_module/some_file';",
      errors: [{ messageId: 'preferPathAlias' }],
      output: `import { something } from '@module2/some_file';`,
    },
    {
      filename: `${absoluteBaseUrl}/first_module/myfolder/myfile.ts`,
      code: "require('../../second_module/some_file');",
      errors: [{ messageId: 'preferPathAlias' }],
      output: `require('@module2/some_file');`,
    },
    {
      filename: `${absoluteBaseUrl}/first_module/myfolder/myfile.ts`,
      code: "jest.mock('../../second_module/some_file');",
      errors: [{ messageId: 'preferPathAlias' }],
      output: `jest.mock('@module2/some_file');`,
    },
  ],
});
