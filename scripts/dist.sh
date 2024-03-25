#!/bin/bash

rm -rf dist/src

tsc --project ./tsconfig.dist.json

cd dist
npm link
