#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o pipefail

echo "`npm install`"
npm install
echo ""
echo "`npm run build`"
npm run build


if [ $(git diff --name-only dist/ | wc -l) -gt 0 ]; then
  git --no-pager diff dist/
  echo ""
  echo "You might not have committed changes to the dist/ folder. After running `npm run build` there are changes that weren't committed."
  echo ""
  exit 1
else
  echo ""
  echo "Successfully ran `npm run build`"
  echo ""
fi
