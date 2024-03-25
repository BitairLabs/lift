import assert from 'node:assert'
import { describe, it } from 'node:test'

import { helloWorld } from '#src/index.js'

await describe('Testing Lift', async () => {
  await it('should resolve TypeScript modules through subpath imports and NPM workspaces', () => {
    assert.strictEqual(helloWorld(), 'Hello, World!')
  })
})
