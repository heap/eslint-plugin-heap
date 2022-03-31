# eslint-plugin-heap

Heap's custom eslint rules. These rules are under development and are not recommended for use outside of Heap. We are not accepting contributors at this time.

## Table of Contents

- [Development](#development)
- [Testing](#testing)
- [Publishing](#publishing)

## Development
- Add rules to `src/rules`. Filenames should be the same name as the rule.
- Export created rules in `src/index.ts`

## Testing
- See `src/rules/no-wildcard-imports.spec.ts` for an example of a test with a fixable rule
- `npm test` will run all tests

## Publishing
- Run `npm run build` to build js files in `dist/`
- Commit and push all files, including `dist/`
- Use the latest git hash for the `eslint-plugin-heap` entry in Heap's `package.json` file
