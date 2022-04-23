import * as tsconfigPaths from 'tsconfig-paths';
import { RuleTester } from '@typescript-eslint/experimental-utils/dist/ts-eslint';
import noExternalRelativeImports from './no-external-relative-imports';
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

ruleTester.run('no-external-relative-imports', noExternalRelativeImports, {
  valid: [
    {
      filename: `${absoluteBaseUrl}/first_module/myfolder/myfile.ts`,
      code: "import { something } from '../first_module_file';",
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
  ],
  invalid: [
    {
      // cannot import from another module
      filename: `${absoluteBaseUrl}/first_module/myfolder/myfile.ts`,
      code: "import { something } from '../../second_module/somefile';",
      errors: [{ messageId: 'noExternalRelativeImports' }],
    },
    {
      // cannot import from another module using alias
      filename: `${absoluteBaseUrl}/first_module/myfolder/myfile.ts`,
      code: "import { something } from '@module2/somefile';",
      errors: [{ messageId: 'noExternalRelativeImports' }],
    },
    {
      // cannot import from parent of another module
      filename: `${absoluteBaseUrl}/third_module/nested/myfolder/myfile.ts`,
      code: "import { something } from '../../third_module/somefile';",
      options: [{ allowedImports: ['@nested/*'] }],
      errors: [{ messageId: 'noExternalRelativeImports' }],
    },
    {
      // cannot import from anywhere else outside of current module
      filename: `${absoluteBaseUrl}/third_module/nested/myfolder/myfile.ts`,
      code: "import { something } from '../../not_in_a_module/somefile';",
      errors: [{ messageId: 'noExternalRelativeImports' }],
    },
    {
      // with require syntax
      filename: `${absoluteBaseUrl}/first_module/myfolder/myfile.ts`,
      code: "const something = require('../../second_module/somefile');",
      errors: [{ messageId: 'noExternalRelativeImports' }],
    },
    {
      // with jest.mock
      filename: `${absoluteBaseUrl}/first_module/myfolder/myfile.ts`,
      code: "const something = jest.mock('../../second_module/somefile');",
      errors: [{ messageId: 'noExternalRelativeImports' }],
    },
    {
      // with import equals syntax
      filename: `${absoluteBaseUrl}/first_module/myfolder/myfile.ts`,
      code: "import something = require('../../second_module/somefile');",
      errors: [{ messageId: 'noExternalRelativeImports' }],
    },
  ],
});
