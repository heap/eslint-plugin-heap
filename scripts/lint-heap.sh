#!/usr/bin/env bash
set -e

## test out lint rules on heap
##
## usage:
##
##   ./scripts/lint-heap.sh front/src/js/app/some-file.ts
##

npm run build
cp -rp dist ../heap/node_modules/eslint-plugin-heap
pushd ../heap
npx eslint $@
popd
