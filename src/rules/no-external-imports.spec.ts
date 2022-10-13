import * as tsconfigPaths from 'tsconfig-paths';
import { RuleTester } from '@typescript-eslint/experimental-utils/dist/ts-eslint';
import noExternalImports from './no-external-imports';
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

ruleTester.run('no-external-imports', noExternalImports, {
  valid: [
    {
      filename: `${absoluteBaseUrl}/first_module/myfolder/myfile.ts`,
      code: "import { something } from '../internal_file';",
    },
    {
      filename: `${absoluteBaseUrl}/first_module/myfolder/myfile.ts`,
      code: "import { something } from '../../first_module/internal_file';",
    },
    {
      filename: `${absoluteBaseUrl}/not_in_a_module/some_file.ts`,
      code: "import { something } from '../second_module';",
    },
    {
      filename: `${absoluteBaseUrl}/first_module/myfolder/myfile.ts`,
      code: "import { something } from '../../second_module/somefile';",
      options: [{ allowedImports: ['@module2/*'] }],
    },
    {
      filename: `${absoluteBaseUrl}/first_module/myfolder/myfile.ts`,
      code: "import { something } from '../../third_module/nested/somefile';",
      options: [{ allowedImports: ['@nested/*'] }],
    },
    {
      filename: `${absoluteBaseUrl}/first_module/myfolder/myfile.ts`,
      code: "import { something } from '@nested/somefile';",
      options: [{ allowedImports: ['@nested/*'] }],
    },
    {
      filename: `${absoluteBaseUrl}/first_module/myfolder/myfile.ts`,
      code: "import * as cypress from 'cypress';",
    },
    {
      filename: `${absoluteBaseUrl}/first_module/myfolder/myfile.ts`,
      code: "import { render } from '@testing-library/react';",
    },
  ],
  invalid: [
    {
      // cannot import from another module
      filename: `${absoluteBaseUrl}/first_module/myfolder/myfile.ts`,
      code: "import { something } from '../../second_module/somefile';",
      errors: [{ messageId: 'noExternalImports' }],
    },
    {
      // cannot import from another module using alias
      filename: `${absoluteBaseUrl}/first_module/myfolder/myfile.ts`,
      code: "import { something } from '@module2/somefile';",
      errors: [{ messageId: 'noExternalImports' }],
    },
    {
      // cannot import from parent of another module
      filename: `${absoluteBaseUrl}/third_module/nested/myfolder/myfile.ts`,
      code: "import { something } from '../../third_module/somefile';",
      options: [{ allowedImports: ['@nested/*'] }],
      errors: [{ messageId: 'noExternalImports' }],
    },
    {
      // cannot import from anywhere else outside of current module
      filename: `${absoluteBaseUrl}/third_module/nested/myfolder/myfile.ts`,
      code: "import { something } from '../../not_in_a_module/somefile';",
      errors: [{ messageId: 'noExternalImports' }],
    },
    {
      // with require syntax
      filename: `${absoluteBaseUrl}/first_module/myfolder/myfile.ts`,
      code: "const something = require('../../second_module/somefile');",
      errors: [{ messageId: 'noExternalImports' }],
    },
    {
      // with jest.mock
      filename: `${absoluteBaseUrl}/first_module/myfolder/myfile.ts`,
      code: "const something = jest.mock('../../second_module/somefile');",
      errors: [{ messageId: 'noExternalImports' }],
    },
    {
      // with import equals syntax
      filename: `${absoluteBaseUrl}/first_module/myfolder/myfile.ts`,
      code: "import something = require('../../second_module/somefile');",
      errors: [{ messageId: 'noExternalImports' }],
    },
    {
      // with export-all declaration
      filename: `${absoluteBaseUrl}/first_module/myfolder/myfile.ts`,
      code: "export * as something from '../../second_module/some_file'",
      errors: [{ messageId: 'noExternalImports' }],
    },
    {
      // with named export
      filename: `${absoluteBaseUrl}/first_module/myfolder/myfile.ts`,
      code: "export { something } from '../../second_module/some_file'",
      errors: [{ messageId: 'noExternalImports' }],
    },
    {
      // with export assignment
      filename: `${absoluteBaseUrl}/first_module/myfolder/myfile.ts`,
      code: "export = require('../../second_module/some_file')",
      errors: [{ messageId: 'noExternalImports' }],
    },
  ],
});
