Setting up a TypeScript monorepo with Node.js can be a challenging and time-consuming process. Lift aims to provide a more native and lightweight solution by leveraging [NPM workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces/) and Node.js's [subpath patterns](https://nodejs.org/docs/latest-v20.x/api/packages.html#subpath-patterns). Additionally, Lift seeks to eliminate the need for building TypeScript for development and production environments.

### Features

- [x] Running and testing TypeScript (both CommonJS and ES module systems)
- [x] Integration with the built-in Node.js test runner
- [x] Integration with ESLint and Prettier for linting and formatting
- [x] Monorepo setup
- [ ] TypeScript debugging

## Hello World!

Save and run the [hello world](./scripts/hello_world.sh) script to see Lift in action:

### Usage:

```bash
npm i -D @bitair/lift
npx lift init
```

#### Subcommands

|        | Description                                | Example                                            | Status          |
| ------ | ------------------------------------------ | -------------------------------------------------- | --------------- |
| help   | Lists the subcommands                      | npx lift help                                      | Implemented     |
| init   | Generates a monorepo                       | npx lift init                                      | Implemented     |
| add    | Adds a new app or lib to the monorepo      | npx lift add app server<br>npx lift add lib common | Implemented     |
| link   | Links a lib to an app                      | npx lift link common server                        | Implemented     |
| format | Formats the code                           | npx lift format \*\*/\*.ts                         | Implemented     |
| lint   | Lints the code                             | npx lift lint \*\*/\*.ts                           | Implemented     |
| test   | Runs TypeScript test suits                 | npx lift test test/\*.ts                           | Implemented     |
| run    | Runs a TypeScript program                  | npx lift run index.ts                              | Implemented     |
| debug  | Generates a debug configuration for VSCode |                                                    | Not Implemented |

#### Notes

- Lift can resolve both '.ts' and '.js' importations.

- The `lint` subcommand uses the `eslint` command with the `--config` argument pointing to the `.eslintrc.cjs` file at the root of the repo. To set a specific configuration file, reset the `--config` argument. Other available options of the eslint command can also be included.

- The `lint` subcommand also utilizes the `tsc` command with a predefined set of configurations. To specify a custom set of configurations, set the `--tsconfig` argument to point to a `tsconfig.json` file. No options from the `tsc` command will be processed and should not be passed.

- The `format` subcommand uses the `prettier` command with the `--write` argument. Other options of the prettier command can also be included.

- The `test` subcommand uses the `node` command with the `--test` argument. Additional options of the node command can also be specified.
