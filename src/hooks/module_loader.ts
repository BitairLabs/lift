import { readFile } from 'node:fs/promises'
import { dirname as getDirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

import { readFileInNearestParent, tryRun } from '../common/util.js'

import type { LoadHooksContext, LoadHooksResult, PackageConfig } from '../common/types.d.js'

export async function load(
  url: string,
  _context: LoadHooksContext,
  nextLoad: (specifier: string, context?: LoadHooksContext) => LoadHooksResult
): Promise<LoadHooksResult> {
  if (!url.match(/\.(c|m|)ts$/)) return nextLoad(url)

  const src = fileURLToPath(url)

  const format = url.endsWith('.cts')
    ? 'commonjs'
    : url.endsWith('.mts')
      ? 'module'
      : (
          JSON.parse(
            (await tryRun<Promise<string | undefined>>(
              async () => await readFileInNearestParent(getDirname(src), 'package.json')
            ).result) ?? '{}'
          ) as PackageConfig
        ).type || 'commonjs'

  const source = await readFile(src, { encoding: 'utf8' })

  const transformedSource = ts.transpileModule(source, {
    fileName: src,
    compilerOptions: {
      target: ts.ScriptTarget.ESNext,
      module: format === 'commonjs' ? ts.ModuleKind.CommonJS : ts.ModuleKind.ESNext,
      sourceMap: true,
      esModuleInterop: format === 'commonjs'
    }
  }).outputText

  return {
    format,
    shortCircuit: true,
    source: transformedSource
  }
}
