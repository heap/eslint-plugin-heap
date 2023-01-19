import { RuleTester } from '@typescript-eslint/experimental-utils/dist/ts-eslint';
import noEmotionCssInstanceClassname from './no-emotion-css-instance-classname';

const ruleTester: RuleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
});

ruleTester.run('noEmotionCssInstanceClassname', noEmotionCssInstanceClassname, {
  valid: [
    {
      filename: 'TestComponent.tsx',
      code: `
        <div className={headerStyle}/>
      `,
    },
    // camel case classnames
    {
      filename: 'TestComponent.tsx',
      code: `
        <div className={classNames(headerStyle, 'notes-editor-notes')}/>
      `,
    },
    // lower case classnames
    {
      filename: 'TestComponent.tsx',
      code: `
        <div className={classnames(headerStyle, 'notes-editor-notes')}/>
      `,
    },
  ],
  invalid: [
    {
      filename: 'TestComponent.tsx',
      code: `
        <div className={css({ gridColumn: '2' })}/>
      `,
      errors: [{ messageId: 'noEmotionCSSInstanceClassname' }],
    },
    // emotion CSS in classnames
    {
      filename: 'TestComponent.tsx',
      code: `
        <div className={classnames('notes-editor-notes', css({ gridColumn: '2' }))}/>
      `,
      errors: [{ messageId: 'noEmotionCSSInstanceClassname' }],
    },
    // emotion css in classname with different order
    {
      filename: 'TestComponent.tsx',
      code: `
        <div className={classnames('notes-editor-notes', css({ gridColumn: '2' }))}/>
      `,
      errors: [{ messageId: 'noEmotionCSSInstanceClassname' }],
    },
    // lower case classnames
    {
      filename: 'TestComponent.tsx',
      code: `
        <div className={classnames(css({ gridColumn: '2' }), 'notes-editor-notes')}/>
      `,
      errors: [{ messageId: 'noEmotionCSSInstanceClassname' }],
    },
    // camel case classnames
    {
      filename: 'TestComponent.tsx',
      code: `
        <div className={classNames(css({ gridColumn: '2' }), 'notes-editor-notes')}/>
      `,
      errors: [{ messageId: 'noEmotionCSSInstanceClassname' }],
    },
  ],
});
