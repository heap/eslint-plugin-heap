"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const no_mobx_1 = __importDefault(require("./rules/no-mobx"));
const no_external_imports_1 = __importDefault(require("./rules/no-external-imports"));
const no_root_store_imports_1 = __importDefault(require("./rules/no-root-store-imports"));
const no_wildcard_imports_1 = __importDefault(require("./rules/no-wildcard-imports"));
const prefer_alias_imports_1 = __importDefault(require("./rules/prefer-alias-imports"));
module.exports = {
    rules: {
        'no-mobx': no_mobx_1.default,
        'no-external-imports': no_external_imports_1.default,
        'no-root-store-imports': no_root_store_imports_1.default,
        'no-wildcard-imports': no_wildcard_imports_1.default,
        'prefer-alias-imports': prefer_alias_imports_1.default,
    },
};
