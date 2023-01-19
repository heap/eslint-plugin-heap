import { RuleTester } from '@typescript-eslint/experimental-utils/dist/ts-eslint';
import requireTZ from './require-tz';

const ruleTester: RuleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
});

ruleTester.run('requireTZ', requireTZ, {
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
    },
    // should also catch imports from "moment-timezone"
    {
      code: `
        import * as moment from 'moment-timezone';
        const test = moment(Date.now());
      `,
      errors: [{ messageId: 'requireTZ' }],
    },
    // should catch instances where the variable "moment" isn't used
    {
      code: `
        import * as asdf from 'moment';
        const test = asdf(Date.now());
      `,
      errors: [{ messageId: 'requireTZ' }],
    },
    // should catch import equals declarations
    {
      code: `
        import moment = require('moment');
        const test = moment(Date.now());
      `,
      errors: [{ messageId: 'requireTZ' }],
    },
    // multiple arguments passed to moment
    {
      code: `
        import * as moment from 'moment';
        const test = moment('2023-01-04 9:13', 'YYYY-MM-DD H:mm');
      `,
      errors: [{ messageId: 'requireTZ' }],
    },
    // no arguments passed to moment
    {
      code: `
        import * as moment from 'moment';
        import { trialEndMoment } from './trial-end-date';
        const duration = trialEndMoment.diff(moment());
      `,
      errors: [{ messageId: 'requireTZ' }],
    },
  ],
});
