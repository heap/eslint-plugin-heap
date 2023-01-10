import * as tsconfigPaths from 'tsconfig-paths';
import { RuleTester } from '@typescript-eslint/experimental-utils/dist/ts-eslint';
import noDockerignore from './no-dockerignore';
import { ConfigLoaderResult } from 'tsconfig-paths';

const ruleTester: RuleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
});

const absoluteBaseUrl = '/Users/mycomputer/heap';

jest.spyOn(tsconfigPaths, 'loadConfig').mockReturnValue({
  resultType: 'success',
  absoluteBaseUrl,
  paths: {
    cypress: ['./node_modules/cypress'],
    '@analysis/*': ['front/src/analysis/*'],
    '@app/*': ['front/src/app/*'],
    '@front-utils/*': ['front/src/front-utils/*'],
  },
} as unknown as ConfigLoaderResult);

const dockerignoreLastModified = new Date();

const dockerIgnoreContents = `
# This is a fake .dockerignore file
.git
.dockerignore

*.txt
*.log
front/public/*

node_modules
test
manual_test
scripts/dev/db/*

**/*.mock.*  # lets add a comment
**/*.spec.*
**/*.page.*
**/*.story.*
**/test_data/*
**/TestAppInitializer.tsx
`;

jest.mock('../utils/fileSystem', () => ({
  fileExists: (path: string) => {
    const existingFiles = [
      '/Users/mycomputer/heap/.dockerignore',
      '/Users/mycomputer/heap/front/src/analysis/stores/mystore.ts',
      '/Users/mycomputer/heap/front/src/analysis/stores/mystore.mock.ts',
      '/Users/mycomputer/heap/front/src/app/views/myview.ts',
      '/Users/mycomputer/heap/front/src/app/views/MyComponent.tsx',
      '/Users/mycomputer/heap/front/src/app/views/MyComponent.spec.tsx',
      '/Users/mycomputer/heap/front/src/app/TestAppInitializer.tsx',
      '/Users/mycomputer/heap/front/src/front_utils/humanizers/humanize.ts',
      '/Users/mycomputer/heap/scripts/dev/db/jest/create_databases_for_tests.ts',
    ];
    return existingFiles.includes(path);
  },
  getLastModifiedTimestamp: (path: string) => {
    if (path === '/Users/mycomputer/heap/.dockerignore') {
      return dockerignoreLastModified;
    }
    throw new Error(`file not found: ${path}`);
  },
  getFileContents: (path: string) => {
    if (path === '/Users/mycomputer/heap/.dockerignore') {
      return dockerIgnoreContents;
    }
    throw new Error(`file not found: ${path}`);
  },
}));

ruleTester.run('no-dockerignore', noDockerignore, {
  valid: [
    {
      filename: `${absoluteBaseUrl}/front/src/app/views/MyComponent.tsx`,
      code: "import { myStore } from '../../analysis/stores/mystore';",
    },
    {
      filename: `${absoluteBaseUrl}/front/src/app/views/MyComponent.tsx`,
      code: "import { myStore } from '../../analysis/stores/asdf';",
    },
    {
      // allows if containing file is also ignored
      filename: `${absoluteBaseUrl}/scripts/dev/db/jest/create_databases_for_tests.ts`,
      code: "const testUtil = require('../../../../test/util');",
    },
  ],
  invalid: [
    {
      // catches folders that don't have wildcards with pattern starting with "."
      filename: `${absoluteBaseUrl}/front/src/app/views/MyComponent.tsx`,
      code: "import { myStore } from '../../../../.git/some_folder/some_file';",
      errors: [{ messageId: 'noDockerignore' }],
    },
    {
      // catches with path aliases used
      filename: `${absoluteBaseUrl}/front/src/app/views/MyComponent.tsx`,
      code: "import { myStore } from '@app/test_data/some_file';",
      errors: [{ messageId: 'noDockerignore' }],
    },
    {
      // catches folders that don't have wildcards
      filename: `${absoluteBaseUrl}/front/src/app/views/MyComponent.tsx`,
      code: "import { myStore } from '../../../../test/some_folder/some_file';",
      errors: [{ messageId: 'noDockerignore' }],
    },
    {
      // catches folders with wildcards
      filename: `${absoluteBaseUrl}/front/src/app/views/MyComponent.tsx`,
      code: "import { myStore } from './test_data/some_file';",
      errors: [{ messageId: 'noDockerignore' }],
    },
    {
      // catches files
      filename: `${absoluteBaseUrl}/front/src/app/views/MyComponent.tsx`,
      code: "import { myStore } from '../../utils/TestAppInitializer.tsx';",
      errors: [{ messageId: 'noDockerignore' }],
    },
    {
      // catches dynamic import
      filename: `${absoluteBaseUrl}/front/src/app/views/MyComponent.tsx`,
      code: "import('../TestAppInitializer');",
      errors: [{ messageId: 'noDockerignore' }],
    },
    {
      // catches import equals declaration
      filename: `${absoluteBaseUrl}/front/src/app/views/MyComponent.tsx`,
      code: "import TestAppInitializer = require('../TestAppInitializer');",
      errors: [{ messageId: 'noDockerignore' }],
    },
    {
      // catches import equals declaration
      filename: `${absoluteBaseUrl}/front/src/app/views/MyComponent.tsx`,
      code: "import TestAppInitializer = require('../TestAppInitializer');",
      errors: [{ messageId: 'noDockerignore' }],
    },
    {
      // catches export equals declaration
      filename: `${absoluteBaseUrl}/front/src/app/views/MyComponent.tsx`,
      code: "export * as something from '@app/TestAppInitializer';",
      errors: [{ messageId: 'noDockerignore' }],
    },
  ],
});
