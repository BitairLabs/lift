#!/usr/bin/env bash

start_ns=$(date +%s%N)
node --enable-source-maps --import @bitair/lift scripts/hello_world.ts
end_ns=$(date +%s%N)
lift_duration=$(awk "BEGIN {printf \"%.3f\", ($end_ns - $start_ns)/1000000000}")

start_ns=$(date +%s%N)
npx ts-node scripts/hello_world.ts
end_ns=$(date +%s%N)
ts_node_duration=$(awk "BEGIN {printf \"%.3f\", ($end_ns - $start_ns)/1000000000}")

start_ns=$(date +%s%N)
npx tsx scripts/hello_world.ts
end_ns=$(date +%s%N)
tsx_duration=$(awk "BEGIN {printf \"%.3f\", ($end_ns - $start_ns)/1000000000}")

start_ns=$(date +%s%N)
bun scripts/hello_world.ts
end_ns=$(date +%s%N)
bun_duration=$(awk "BEGIN {printf \"%.3f\", ($end_ns - $start_ns)/1000000000}")

start_ns=$(date +%s%N)
deno scripts/hello_world.ts
end_ns=$(date +%s%N)
deno_duration=$(awk "BEGIN {printf \"%.3f\", ($end_ns - $start_ns)/1000000000}")

echo lift: "$lift_duration"s
echo ts-node "$ts_node_duration"s
echo tsx "$tsx_duration"s
echo bun "$bun_duration"s
echo deno "$deno_duration"s
