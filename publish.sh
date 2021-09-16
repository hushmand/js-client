#!/bin/bash
tsc
npx typedoc index.ts
git add .
git commit
git push --a --tags