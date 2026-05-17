**Lift** is a drop-in TypeScript module importer for Node.js designed for rapid prototyping. It resolves, compiles, and caches `.ts` modules on-demand, enabling seamless development without a build step.

### Key Features

- **Lazy and Incremental Compilation:** Compiles TypeScript modules only when they are referenced or modified.
- **Native Format Support:** Resolves both CommonJS and ES Modules (ESM) transparently.
- **Advanced NPM Support:** Fully supports:
  - [NPM Workspaces](https://docs.npmjs.com/cli/v11/using-npm/workspaces)
  - [Scoped Packages](https://docs.npmjs.com/cli/v11/using-npm/scope)
  - [Subpath Patterns](https://nodejs.org/api/packages.html#subpath-patterns)
- **Debugging‑Ready:** Fully compatible with standard debuggers.

Lift can use either the official TypeScript's [compiler](https://www.typescriptlang.org/docs/handbook/compiler-options.html) and [esbuild](https://esbuild.github.io) for compilation.

### Benchmark

**TypeScript "Hello, World!" – Execution Times:**

| Runtime     | Cache | Time      |
| ----------- | ----- | --------- |
| **bun**     | –     | `0.046 s` |
| **deno**    | –     | `0.125 s` |
| **lift**    | hit   | `0.249 s` |
| **lift**    | miss  | `0.380 s` |
| **tsx**     | –     | `1.444 s` |
| **ts-node** | –     | `1.682 s` |

### Installation

Install the package as a development dependency:

```bash
npm i -D @bitair/lift
```

One of the `typescript` or `esbuild` packages must be installed as well.

```bash
npm i -D typescript
```

or

```bash
npm i -D esbuild
```

### Usage

Run a TypeScript modules directly using the `--import` flag:

```bash
node --enable-source-maps --import @bitair/lift src/index.ts
```

To change the default Lift configuration, add a `.lift.json` file to the project root with the following content:

```json
{
  "enableCaching": true, // default is true
  "cacheDir": ".lift/cache", // default is [cwd]/.lift/cache
  "compiler": "esbuild" // or tsc, default is esbuild
}
```

**Hot Reloading**

You can use Nodemon with the following config to enable hot reloading in your project:

`nodemon.json`

```json
{
  "watch": ["src"],
  "ext": "ts",
  "exec": "node --enable-source-maps --import @bitair/lift src/index.ts"
}
```

**Debugging**

A breakpoint set in the source will only be hit when you compile with `tsc`. If you’re using the `esbuild` compiler, insert a `debugger` statement instead.

See the [sample](./sample) and [test](./lib/test/) projects for examples.
