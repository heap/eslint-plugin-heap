import { RuleTester } from '@typescript-eslint/experimental-utils/dist/ts-eslint';
import preferImmutableAssignments from './prefer-immutable-assignments';

const ruleTester: RuleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
});

ruleTester.run('preferImmutableAssignments', preferImmutableAssignments, {
  valid: [
    {
      code: `
    import * as _ from 'lodash';

    const foo = { a: '1' };
    const bar = { a: '3', b: '2' };
    const test = _.merge({}, a, b);
  `,
    },
    // TODO
    {
      code: `
    import { merge } from 'lodash';

    const foo = { a: '1' };
    const bar = { a: '3', b: '2' };
    const test = merge({}, a, b);
  `,
    },
  ],
  invalid: [
    {
      code: `
        import * as _ from 'lodash';

        const foo = { a: '1' };
        const bar = { a: '3', b: '2' };
        const test = _.merge(a, b);
      `,
      errors: [{ messageId: 'preferImmutableAssignments' }],
    },
    // TODO
    {
      code: `
    import { merge } from 'lodash';

    const foo = { a: '1' };
    const bar = { a: '3', b: '2' };
    const test = merge({}, a, b);
  `,
      errors: [{ messageId: 'preferImmutableAssignments' }],
    },
  ],
});
