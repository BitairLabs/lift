**Lift** is a drop-in TypeScript module importer for Node.js designed for rapid prototyping. It resolves, compiles, and caches `.ts` modules on-demand, enabling seamless development without a build step.

### Key Features

- **Lightning-Fast Startup:** Compiles TypeScript modules only when required, eliminating the build step and cold-start latency.
- **Native Format Support:** Resolves both CommonJS and ES Modules (ESM) transparently.
- **Advanced NPM Support:** Fully supports:
  - [NPM Workspaces](https://docs.npmjs.com/cli/v11/using-npm/workspaces)
  - [Scoped Packages](https://docs.npmjs.com/cli/v11/using-npm/scope)
  - [Subpath Patterns](https://nodejs.org/api/packages.html#subpath-patterns)
- **Debugging Ready:** Fully compatible with standard debuggers.

### Installation

Install the package as a development dependency:

```bash
npm i -D typescript @bitair/lift
```

### Usage

Then run your TypeScript modules directly using the `--import` flag:

```bash
node --enable-source-maps --import @bitair/lift src/index.ts
```

To change the default cache dir, add a `.lift.json` file to your project's root with the following content:

```json
{
  "cacheDir": ".lift/cache"
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

See the [sample](./sample) and [test](./lib/test/) projects for examples.
