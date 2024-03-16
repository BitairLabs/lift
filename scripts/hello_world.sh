#!/bin/bash

mkdir lift
cd lift

npm i -D @bitair/lift

npx lift init
npx lift add app server
npx lift add lib common
npx lift link server common

npm run start --workspace=@apps/server
