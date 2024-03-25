import { resolve as compileAndResolve } from '@bitair/lift/compiler-server'
import express from 'express'
import path from 'node:path'

const app = express()
const wwwDir = path.join(import.meta.dirname, './www')

// Register the on-demand compiler server
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
app.use(compileAndResolve(wwwDir))
// Let Express take care of non-script files
app.use(express.static(wwwDir))

const port = process.env['PORT']

app.listen(port, () => {
  console.log(`${process.env['APP_NAME']} is running on http://127.0.0.1:${port}`)
})
