#!/bin/bash

rm -rf dist/src

npx esbuild lib/src/index.ts --bundle --format=esm --platform=node --outfile=dist/src/index.js --external:typescript

cd dist
npm link
