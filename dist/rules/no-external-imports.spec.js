"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
const no_external_imports_1 = __importDefault(require("./no-external-imports"));
const ruleTester = new ts_eslint_1.RuleTester({
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
});
ruleTester.run('no-external-imports', no_external_imports_1.default, {
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
    ],
});
