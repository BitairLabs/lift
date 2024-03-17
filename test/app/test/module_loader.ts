import assert from 'node:assert'
import { describe, it } from 'node:test'

import { pow } from '#src/index.js'

await describe('Testing module loader', async () => {
    await it('should load TypeScript', () => {
        assert.strictEqual(pow(2, 3), 8)
        assert.throws(() => assert.strictEqual(pow(2, 3), 7))
    })
})
