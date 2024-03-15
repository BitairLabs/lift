Power up Node.js for building reliable applications with TypeScript.

### Features

- [x] TypeScript importer (both CommonJS and ES module systems)
- [x] Test runner (with the built-in Node.js test runner)
- [ ] Linter (type, syntax and style linting)
- [ ] Formatter
- [ ] TypeScript monorepo manager

## Hello World!

Save and run the [hello world](./scripts/hello_world.sh) script to see Lift in action:

### Usage:

```bash
npm i -D @bitair/lift
```

#### Subcommands

|        | Description                                                  | Example                  | Status                |
| ------ | ------------------------------------------------------------ | ------------------------ | --------------------- |
| format | Formats TypeScript files                                           | npx lift format          | Not implemented       |
| lint   | Performs type, syntax, and style linting on TypeScript files | npx lift lint            | Partially implemented |
| test   | Runs the Node.js built-in test runner on TypeScript modules  | npx lift test test/\*.ts | Implemented           |
| run    | Runs a TypeScript program                                    | npx lift run index.ts    | Implemented           |

#### Notes

- The `lint` subcommand utilizes the `eslint` command with the `--config` and `--ext` arguments. To override these, simply set the `--config` and `--ext` arguments again. Other options from the `eslint` command can also be passed.
- The `test` subcommand utilizes the `node` command with the `--test` argument. Additional options from the `node` command can be passed as well.
- Arguments must be placed after the `lint`, `run`, and `test` subcommands.

- To properly set up linting, you should create a `tsconfig.json` file at the root of your repository with the following configuration:

```js
{
  "extends": "@bitair/lift/tsconfig",
  "include": [
    /*Filenames or patterns to be included. Cannot be empty*/
  ],
  "exclude": [
    /*Filenames or patterns to be excluded. Can be empty*/
  ]
}
```

- When using the `run` subcommand, the main entry in the `package.json` can also be utilized:

`package.json`

```json
{
  "main": "src/index.ts"
}
```

```bash
npx lift run .
```

- When importing a TypeScript module, it is important to explicitly prefix the path with either '.ts', '.mts', or '.cts':

```typescript
import { func } from './sample_module.ts'
```
