#!/bin/bash

mkdir lift
cd lift

touch package.json
cat >./package.json <<EOF
{
  "type": "module",
  "main": "./index.ts"
}
EOF

npm i @bitair/lift@latest

touch index.ts
cat >./index.ts <<EOF
console.log("Hello, World!")
EOF

npx lift run .
