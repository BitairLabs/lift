Lift eliminates the need to build TypeScript in the development environment for both backend and frontend apps.

### Features

- [x] Resolving TypeScript modules for Node.js apps
- [x] Resolving TypeScript, TSX, JSX, and CSS modules for React apps
- [x] Sharing libraries in a monorepo using [NPM workspaces](https://docs.npmjs.com/cli/v10/using-npm/workspaces) and [scoped packages](https://docs.npmjs.com/cli/v10/using-npm/scope)
- [x] Supporting Node.js's [subpath patterns](https://nodejs.org/docs/latest-v20.x/api/packages.html#subpath-patterns)
- [x] Doesn't compile external packages
- [x] Change and re-evaluate a frontend app without restarting it (refreshing the browser should be done manually)
- [ ] Change and re-evaluate a backend app without restarting it
- [x] Integration with any Node.js binary command that supports ES modules (through the --import flag)
- [x] Easy debugging an app with VSCode

### Technical facts

- Has been built with the ES module system.
- Starts an app faster and uses less energy due to on-demand compilation instead of a build process.
- Uses TypeScript API instead of third-party libraries for compilation.
- Has no runtime dependencies other than TypeScript

### Usage:

```bash
npm i -S @bitair/lift
```

#### Hello, World!

```bash
git clone https://github.com/bitair-org/lift
cd lift/sample
npm i
npm run start:client # Open the DevTools and refresh the page.
```

### On-demand Compilation

On-demand compilation works for both frontend and backend.

To enable it, you should use the import flag:

```bash
node --import @bitair/lift/register src/index.ts
node --test --import @bitair/lift/register test/*.ts
```

For a frontend app:

1. Create a static file server:

   `server.ts`

   ```ts
   import { resolve as compileAndResolve } from '@bitair/lift/compiler-server'
   import express from 'express'
   import path from 'node:path'

   const app = express()
   const wwwDir = path.join(import.meta.dirname, './www')

   // Register the on-demand compiler server
   app.use(compileAndResolve(wwwDir))
   // Let Express take care of non-script files
   app.use(express.static(wwwDir))

   const port = process.env['PORT']

   app.listen(port, () => {
     console.log(`${process.env['APP_NAME']} is running on port ${port}`)
   })
   ```

2. Move the app's code to the `www` folder
3. Create an `index.html` entry for the app and define import maps for its external packages:

   `index.html`

   ```html
   <!doctype html>
   <html lang="en">
     <head>
       <title>Lift - Hello, World!</title>
       <script type="importmap">
         {
           "imports": {
             "react-dom": "https://unpkg.com/@esm-bundle/react-dom/esm/react-dom.development.js",
             "react": "https://unpkg.com/@esm-bundle/react/esm/react.development.js"
           }
         }
       </script>
       <script type="module" src="./pages/main.js"></script>
     </head>
     <body>
       <div id="root"></div>
     </body>
   </html>
   ```

Run the server with:

```bash
PORT=8000 APP_NAME=Client node --import @bitair/lift/register server.ts
```

Please refer to the [sample client](./sample/apps/client/) app for the complete code:

### Debugging

To debug a backend app or its test suites using VScode, first create an NPM script:

```js
  "scripts": {
    "start": "node --import @bitair/lift/register src/index.ts",
    "test": "node --test --import @bitair/lift/register test/*.ts"
  }
```

Then create a new configuration in the `.vscode/launch.json` file and run it:

```json
{
  "command": "npm run start",
  "name": "Debug Server",
  "request": "launch",
  "type": "node-terminal",
  "internalConsoleOptions": "neverOpen"
},
{
  "command": "npm test",
  "name": "Debug Server Tests",
  "request": "launch",
  "type": "node-terminal",
  "internalConsoleOptions": "neverOpen"
}
```

Debugging a frontend app takes place in the browser DevTools, so you don't need to do anything in your IDE. However, you must use the `debugger` keyword in your code. When debugging a frontend app, you don't need to restart the app either; simply make changes to the code and press CTRL+F5.
