"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ts_eslint_1 = require("@typescript-eslint/experimental-utils/dist/ts-eslint");
const require_tz_1 = __importDefault(require("./require-tz"));
const ruleTester = new ts_eslint_1.RuleTester({
    parser: require.resolve('@typescript-eslint/parser'),
});
ruleTester.run('requireTZ', require_tz_1.default, {
    valid: [
        {
            code: `
        import * as moment from 'moment';
        const test = moment.tz(Date.now(), 'America/Chicago');
      `,
        },
        {
            code: `
        import * as moment from 'moment';
        const test = moment.utc(Date.now());
      `,
        },
        // it should allow +moment()
        {
            code: `
        import * as moment from 'moment';
        const nextDay = +moment() + 86400000;
      `,
        },
        // it should allow usages when `.tz` is appended to moment instance
        {
            code: `
        import * as moment from 'moment';

        moment(Date.now()).tz('America/Chicago');
      `,
        },
        // it should allow usages when `.utc` is appended to moment instance
        {
            code: `
        import * as moment from 'moment';

        moment(Date.now()).utc();
      `,
        },
        {
            code: `
        import * as moment from 'moment';
        const nextDay = +moment() + 86400000;
      `,
        },
        // importing from another library is fine (even if the identifier name is "moment")
        {
            code: `
        import * as moment from 'another-library';
        const test = moment(Date.now());
      `,
        },
    ],
    invalid: [
        // default constructors prohibited
        {
            code: `
        import * as moment from 'moment';
        const test = moment(Date.now());
      `,
            errors: [{ messageId: 'requireTZ' }],
            output: `
        import * as moment from 'moment-timezone';
        const test = moment.tz(Date.now(), moment.tz.guess());
      `,
        },
        // should also catch imports from "moment-timezone"
        {
            code: `
        import * as moment from 'moment-timezone';
        const test = moment(Date.now());
      `,
            errors: [{ messageId: 'requireTZ' }],
            output: `
        import * as moment from 'moment-timezone';
        const test = moment.tz(Date.now(), moment.tz.guess());
      `,
        },
        // should catch instances where the variable "moment" isn't used
        {
            code: `
        import * as asdf from 'moment';
        const test = asdf(Date.now());
      `,
            errors: [{ messageId: 'requireTZ' }],
            output: `
        import * as asdf from 'moment-timezone';
        const test = asdf.tz(Date.now(), asdf.tz.guess());
      `,
        },
        // should catch import equals declarations
        {
            code: `
        import moment = require('moment');
        const test = moment(Date.now());
      `,
            errors: [{ messageId: 'requireTZ' }],
            output: `
        import moment = require('moment-timezone');
        const test = moment.tz(Date.now(), moment.tz.guess());
      `,
        },
        // multiple arguments passed to moment
        {
            code: `
        import * as moment from 'moment';
        const test = moment('2023-01-04 9:13', 'YYYY-MM-DD H:mm');
      `,
            errors: [{ messageId: 'requireTZ' }],
            output: `
        import * as moment from 'moment-timezone';
        const test = moment.tz('2023-01-04 9:13', 'YYYY-MM-DD H:mm', moment.tz.guess());
      `,
        },
        // no arguments passed to moment
        {
            code: `
        import * as moment from 'moment';
        import { trialEndMoment } from './trial-end-date';
        const duration = trialEndMoment.diff(moment());
      `,
            errors: [{ messageId: 'requireTZ' }],
            output: `
        import * as moment from 'moment-timezone';
        import { trialEndMoment } from './trial-end-date';
        const duration = trialEndMoment.diff(moment.tz(moment.tz.guess()));
      `,
        },
    ],
});
