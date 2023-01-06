"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tsconfigPaths = __importStar(require("tsconfig-paths"));
const ts_eslint_1 = require("@typescript-eslint/experimental-utils/dist/ts-eslint");
const no_dockerignore_1 = __importDefault(require("./no-dockerignore"));
const ruleTester = new ts_eslint_1.RuleTester({
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
});
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
    fileExists: (path) => {
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
    getLastModifiedTimestamp: (path) => {
        if (path === '/Users/mycomputer/heap/.dockerignore') {
            return dockerignoreLastModified;
        }
        throw new Error(`file not found: ${path}`);
    },
    getFileContents: (path) => {
        if (path === '/Users/mycomputer/heap/.dockerignore') {
            return dockerIgnoreContents;
        }
        throw new Error(`file not found: ${path}`);
    },
}));
ruleTester.run('no-test-file-imports', no_dockerignore_1.default, {
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
