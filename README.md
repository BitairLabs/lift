Integrating TypeScript with Node.js, especially in a Monorepo project, can be challenging. Lift aims to address this challenge by offering a CLI tool.

### Features

- [x] Importing TypeScript (both CommonJS and ES module systems)
- [x] Integration with the built-in Node.js test runner
- [x] Integration with ESLint and Prettier for linting and formatting
- [ ] TypeScript monorepo manager

## Hello World!

Save and run the [hello world](./scripts/hello_world.sh) script to see Lift in action:

### Usage:

```bash
npm i -D @bitair/lift
```

#### Subcommands

|        | Description                                                 | Example                    | Status      |
| ------ | ----------------------------------------------------------- | -------------------------- | ----------- |
| init   | Creates the required config files                           | npx lift init              | Implemented |
| format | Formats files and fixes problems                            | npx lift format \*\*/\*.ts | Implemented |
| lint   | Performs type, syntax, and style linting                    | npx lift lint \*\*/\*.ts  | Implemented |
| test   | Runs the Node.js built-in test runner on TypeScript modules | npx lift test test/\*.ts   | Implemented |
| run    | Runs a TypeScript program                                   | npx lift run index.ts      | Implemented |

#### Notes

- When importing a TypeScript module, it is important to explicitly prefix the path with either '.ts', '.mts', or '.cts':

  ```typescript
  import { func } from './sample_module.ts'
  ```

- The `format` and `lint` subcommands use the `eslint` command with the `--config` argument pointing to the nearest `.eslintrc.cjs` file. To set a specific configuration file, reset the `--config` argument. You can also include other available options in the `eslint` command.

- The `lint` subcommand also utilizes the `tsc` command with the `--noEmit` argument. To override this, use the `--project` argument instead. Other options from the `tsc` command will not be processed.

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
