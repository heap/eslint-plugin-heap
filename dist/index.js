"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const no_mobx_1 = __importDefault(require("./rules/no-mobx"));
const no_external_imports_1 = __importDefault(require("./rules/no-external-imports"));
const no_root_store_imports_1 = __importDefault(require("./rules/no-root-store-imports"));
const no_dockerignore_1 = __importDefault(require("./rules/no-dockerignore"));
const no_wildcard_imports_1 = __importDefault(require("./rules/no-wildcard-imports"));
const prefer_path_alias_1 = __importDefault(require("./rules/prefer-path-alias"));
const require_tz_1 = __importDefault(require("./rules/require-tz"));
const no_emotion_css_instance_classname_1 = __importDefault(require("./rules/no-emotion-css-instance-classname"));
module.exports = {
    rules: {
        'no-mobx': no_mobx_1.default,
        'no-dockerignore': no_dockerignore_1.default,
        'no-external-imports': no_external_imports_1.default,
        'no-root-store-imports': no_root_store_imports_1.default,
        'no-wildcard-imports': no_wildcard_imports_1.default,
        'prefer-path-alias': prefer_path_alias_1.default,
        'require-tz': require_tz_1.default,
        'no-emotion-css-instance-classname': no_emotion_css_instance_classname_1.default,
    },
};
