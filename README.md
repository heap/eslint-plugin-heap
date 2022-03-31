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
- Commit and push all files (including changes in `dist/`) to a topic branch
- Open a Pull Request to merge into `main`; Squash and merge once approved
- Once merged, use the latest commit hash in `main` for the `eslint-plugin-heap` entry in Heap's `package.json` file
