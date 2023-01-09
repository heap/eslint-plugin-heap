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
const prefer_path_alias_1 = __importDefault(require("./prefer-path-alias"));
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
ruleTester.run('preferPathAlias', prefer_path_alias_1.default, {
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
