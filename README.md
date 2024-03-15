Integrating TypeScript with Node.js, especially in a Monorepo project, can be challenging. Lift aims to address this challenge by offering a CLI tool. While a successful proof of concept for this project has been completed, it is important to note that Lift is still in the **experimental** phase.

### Features

- [x] TypeScript importer (both CommonJS and ES module systems)
- [x] Test runner (with the built-in Node.js test runner)
- [x] Linter (type, syntax and style linting)
- [ ] Formatter
- [ ] TypeScript monorepo manager

## Hello World!

Save and run the [hello world](./scripts/hello_world.sh) script to see Lift in action:

### Usage:

```bash
npm i -D @bitair/lift
```

#### Subcommands

|        | Description                                                  | Example                  | Status          |
| ------ | ------------------------------------------------------------ | ------------------------ | --------------- |
| init   | Creates the required config files                            | npx lift format          | Implemented     |
| format | Formats TypeScript files                                     | npx lift format          | Not implemented |
| lint   | Performs type, syntax, and style linting on TypeScript files | npx lift lint            | Implemented     |
| test   | Runs the Node.js built-in test runner on TypeScript modules  | npx lift test test/\*.ts | Implemented     |
| run    | Runs a TypeScript program                                    | npx lift run index.ts    | Implemented     |

#### Notes
- When importing a TypeScript module, it is important to explicitly prefix the path with either '.ts', '.mts', or '.cts':

  ```typescript
  import { func } from './sample_module.ts'
  ```

- The `lint` subcommand uses the `eslint` command with the `--config` and `--ext` arguments. To override these, simply set the `--config` and `--ext` arguments again. Other options from the `eslint` command can also be included.

- The `lint` subcommand also uses the `tsc` command with the `--noEmit` argument. To override this, use the `--project` argument instead. Other options from the `tsc` command will not be utilized.

- The `test` subcommand makes use of the `node` command with the `--test` argument. Additional options from the `node` command can also be specified.
- Remember to place arguments after the `lint`, `run`, and `test` subcommands.

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

