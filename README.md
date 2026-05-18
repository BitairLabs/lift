**Lift** is a drop-in TypeScript module importer for Node.js designed for rapid prototyping. It resolves, compiles, and caches `.ts` modules on-demand, enabling seamless development without a build step.

### Key Features

- **Lazy and Incremental Compilation:** Compiles TypeScript modules only when they are referenced or modified.
- **Native Format Support:** Resolves both CommonJS and ES Modules (ESM) transparently.
- **Advanced NPM Support:** Fully supports:
  - [NPM Workspaces](https://docs.npmjs.com/cli/v11/using-npm/workspaces)
  - [Scoped Packages](https://docs.npmjs.com/cli/v11/using-npm/scope)
  - [Subpath Patterns](https://nodejs.org/api/packages.html#subpath-patterns)
- **Debugging‑Ready:** Fully compatible with standard debuggers.

Lift can use either the [official](https://www.typescriptlang.org/docs/handbook/compiler-options.html) TypeScript's compiler, [esbuild](https://esbuild.github.io), or the Node.js' [native](https://nodejs.org/api/module.html#modulestriptypescripttypescode-options) TypeScript transformer for compilation.

### Benchmark

**TypeScript "Hello, World!" – Execution Times:**

| Runtime                    | Cache | Time      |
| -------------------------- | ----- | --------- |
| **Bun**                    | –     | `0.046 s` |
| **Deno**                   | –     | `0.125 s` |
| **Node.js (lift)**         | hit   | `0.249 s` |
| **Node.js (lift esbuild)** | miss  | `0.380 s` |
| **Node.js (lift native)**  | miss  | `0.387 s` |
| **Node.js (tsx)**          | –     | `1.444 s` |
| **Node.js (lift tsc)**     | miss  | `1.578 s` |
| **Node.js (ts-node)**      | –     | `1.682 s` |

### Installation

Install the package as a development dependency:

```bash
npm i -D @bitair/lift
```

You must also install **`typescript`** or **`esbuild`** if you are not using the native transformer.

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
  "enableCaching": true, // Nullable<boolean> (default: true)
  "cacheDir": ".lift/cache", // Nullable<string> (default: [cwd]/.lift/cache)
  "compiler": "esbuild" // Nullable<"esbuild" | "tsc" | "native"> (default: esbuild)
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

A breakpoint set in the source will only be hit when you compile with `tsc`. If you’re using the `esbuild` or `native` compiler option, insert a `debugger` statement instead.

See the [sample](./sample) and [test](./lib/test/) projects for examples.
