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
    // relative imports that don't peek into other modules are fine
    {
      filename: `${absoluteBaseUrl}/first_module/myfolder/myfile.ts`,
      code: "import { something } from '../internal_file';",
    },
    // technically it's the same module, so no error is thrown
    {
      filename: `${absoluteBaseUrl}/first_module/myfolder/myfile.ts`,
      code: "import { something } from '../../first_module/internal_file';",
    },
    // random call expressions are allowed
    {
      filename: `${absoluteBaseUrl}/first_module/myfolder/myfile.ts`,
      code: "const test = myFunction('../../second_module/some_file.css');",
    },
  ],
  invalid: [
    // import-all declaration
    {
      filename: `${absoluteBaseUrl}/first_module/myfolder/myfile.ts`,
      code: "import * as asdf from '../../second_module/some_file';",
      errors: [{ messageId: 'preferPathAlias' }],
      output: `import * as asdf from '@module2/some_file';`,
    },
    // import declaration
    {
      filename: `${absoluteBaseUrl}/first_module/myfolder/myfile.ts`,
      code: "import '../../second_module/some_file.css'",
      errors: [{ messageId: 'preferPathAlias' }],
      output: "import '@module2/some_file.css'",
    },
    // named import
    {
      filename: `${absoluteBaseUrl}/first_module/myfolder/myfile.ts`,
      code: "import { something } from '../../second_module/some_file';",
      errors: [{ messageId: 'preferPathAlias' }],
      output: `import { something } from '@module2/some_file';`,
    },
    // import equals declaration
    {
      filename: `${absoluteBaseUrl}/first_module/myfolder/myfile.ts`,
      code: "import test = require('../../second_module/some_file');",
      errors: [{ messageId: 'preferPathAlias' }],
      output: `import test = require('@module2/some_file');`,
    },
    // import expression (dynamic imports)
    {
      filename: `${absoluteBaseUrl}/first_module/myfolder/myfile.ts`,
      code: "const test = import('../../second_module/some_file');",
      errors: [{ messageId: 'preferPathAlias' }],
      output: `const test = import('@module2/some_file');`,
    },
    // require call expression
    {
      filename: `${absoluteBaseUrl}/first_module/myfolder/myfile.ts`,
      code: "require('../../second_module/some_file');",
      errors: [{ messageId: 'preferPathAlias' }],
      output: `require('@module2/some_file');`,
    },
    // jest.mock call expression
    {
      filename: `${absoluteBaseUrl}/first_module/myfolder/myfile.ts`,
      code: "jest.mock('../../second_module/some_file');",
      errors: [{ messageId: 'preferPathAlias' }],
      output: `jest.mock('@module2/some_file');`,
    },
    // export-all declaration
    {
      filename: `${absoluteBaseUrl}/first_module/myfolder/myfile.ts`,
      code: "export * as something from '../../second_module/some_file'",
      errors: [{ messageId: 'preferPathAlias' }],
      output: `export * as something from '@module2/some_file'`,
    },
    // named export
    {
      filename: `${absoluteBaseUrl}/first_module/myfolder/myfile.ts`,
      code: "export { something } from '../../second_module/some_file'",
      errors: [{ messageId: 'preferPathAlias' }],
      output: "export { something } from '@module2/some_file'",
    },
    // export assignment
    {
      filename: `${absoluteBaseUrl}/first_module/myfolder/myfile.ts`,
      code: "export = require('../../second_module/some_file')",
      errors: [{ messageId: 'preferPathAlias' }],
      output: "export = require('@module2/some_file')",
    },
  ],
});
