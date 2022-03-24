import { RuleTester } from '@typescript-eslint/experimental-utils/dist/ts-eslint';
import noWildcardImports from './no-wildcard-imports';

const ruleTester: RuleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
});

ruleTester.run('no-wildcard-imports', noWildcardImports, {
  valid: [
    {
      options: [{ packages: ['lodash'] }],
      code: "import * as moment from 'moment';",
    },
    {
      options: [{ packages: ['lodash'] }],
      code: "import { noop } from 'lodash';",
    },
    {
      code: "import { noop } from 'lodash';",
    },
  ],
  invalid: [
    {
      code: "import * as _ from 'lodash'",
      errors: [{ messageId: 'noWildcardImports' }],
    },
    {
      code: `
        import * as moment from 'moment';
        const fourWeeks = +moment.duration({ weeks: 4 });
      `,
      errors: [{ messageId: 'noWildcardImports' }],
      output: `
        import { duration } from 'moment';
        const fourWeeks = +duration({ weeks: 4 });
      `,
    },
    {
      options: [{ packages: ['lodash'] }],
      code: `
        import * as _ from 'lodash';
        import * as moment from 'moment';
        const myFunction = _.noop;
        const myArray = _.filter([1, 2, 3], (x) => x > 3);
        const fourWeeks = +moment.duration({ weeks: 4 });
      `,
      errors: [{ messageId: 'noWildcardImports' }],
      // this should only fix lodash, since the lodash package was specified as an option
      output: `
        import { filter, noop } from 'lodash';
        import * as moment from 'moment';
        const myFunction = noop;
        const myArray = filter([1, 2, 3], (x) => x > 3);
        const fourWeeks = +moment.duration({ weeks: 4 });
      `,
    },
    {
      code: `
        import * as _ from 'lodash';
        import { SomeModule } from 'some-module';
        const myFunction = _.noop;
        const myArray = _.filter([1, 2, 3], (x) => x > 3);
        const result = new SomeModule(_);
      `,
      errors: [{ messageId: 'noWildcardImports' }],
      // cannot be fixed due to lodash being passed to SomeModule
      output: `
        import * as _ from 'lodash';
        import { SomeModule } from 'some-module';
        const myFunction = _.noop;
        const myArray = _.filter([1, 2, 3], (x) => x > 3);
        const result = new SomeModule(_);
      `,
    },
    {
      code: `
        import * as _ from 'lodash';
        const myKey = 'noop';
        const myFunction = _[myKey];
        const myArray = _.filter([1, 2, 3], (x) => x > 3);
      `,
      errors: [{ messageId: 'noWildcardImports' }],
      // cannot be fixed due to dynamic usage
      output: `
        import * as _ from 'lodash';
        const myKey = 'noop';
        const myFunction = _[myKey];
        const myArray = _.filter([1, 2, 3], (x) => x > 3);
      `,
    },
    {
      code: `
        import * as _ from 'lodash';
        const myVal = _([1, 2, 3]).filter((arr) => arr > 3).value();
        const myFun = _.noop;
      `,
      errors: [{ messageId: 'noWildcardImports' }],
      // cannot be fixed due to lodash being used as a function
      output: `
        import * as _ from 'lodash';
        const myVal = _([1, 2, 3]).filter((arr) => arr > 3).value();
        const myFun = _.noop;
      `,
    },
    {
      code: `
        import * as _ from 'lodash';
        const myLodash = _;
        const myFun = _.noop;
      `,
      errors: [{ messageId: 'noWildcardImports' }],
      // cannot be fixed due to lodash being assigned
      output: `
        import * as _ from 'lodash';
        const myLodash = _;
        const myFun = _.noop;
      `,
    },
    {
      code: `
        import * as _ from 'lodash';
        const noop = () => {};
        const myFun = _.noop;
      `,
      errors: [{ messageId: 'noWildcardImports' }],
      // cannot be fixed due to naming conflict
      output: `
        import * as _ from 'lodash';
        const noop = () => {};
        const myFun = _.noop;
      `,
    },
  ],
});
