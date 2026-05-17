import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { register } from 'node:module'
import { dirname, resolve as resolvePath } from 'node:path'
import { cwd } from 'node:process'
import { fileURLToPath } from 'node:url'

import ts from 'typescript'

import { findFileInNearestParent, readFileInNearestParent, readJsonFile, readTextFileIfExists } from './common/util.js'

import type {
  LoadHookContext,
  LoadHookResult,
  PackageConfig,
  ResolveHookContext,
  ResolveHookResult
} from './common/types.js'

type Meta = {
  hash: string
}
type LiftConfig = {
  cacheDir: string
}

const { cacheDir } = await getLiftConfig()

register('./index.js', import.meta.url)

export async function resolve(
  specifier: string,
  context: ResolveHookContext,
  nextResolve: (specifier: string, context?: object) => Promise<ResolveHookResult>
): Promise<ResolveHookResult> {
  if (specifier.match(/\.(c|m|)js$/)) {
    return nextResolve(specifier, context).catch(error => {
      const { code = '', url = '' } = error as { code: string; url: string }
      if (code === 'ERR_MODULE_NOT_FOUND' && url.match(/js$/)) {
        const src = fileURLToPath(url).replace(/js$/, 'ts')
        // If the corresponding .ts exists, redirect .js -> .ts
        if (existsSync(src))
          return {
            format: 'typescript',
            shortCircuit: true,
            url: url.replace(/js$/, 'ts')
          }
      }
      throw error
    })
  }

  if (specifier.match(/\.(c|m|)ts$/)) {
    return nextResolve(specifier, context).then(res => ({
      ...res,
      format: 'typescript'
    }))
  }

  return nextResolve(specifier, context)
}

export async function load(
  url: string,
  context: LoadHookContext,
  nextLoad: (specifier: string, context?: LoadHookContext) => Promise<LoadHookResult>
): Promise<LoadHookResult> {
  if (context.format === 'typescript') {
    const tsPath = fileURLToPath(url)

    const format = tsPath.match(/\.cts$/)
      ? 'commonjs'
      : url.match(/\.mts$/)
        ? 'module'
        : (JSON.parse((await readFileInNearestParent(dirname(tsPath), 'package.json')) ?? '{}') as PackageConfig)
            .type || 'commonjs'

    const sourceCode = await readFile(tsPath, { encoding: 'utf8' })
    const sourceCoreHash = createHash('sha256').update(sourceCode).digest('hex')

    const cacheKey = createHash('sha256').update(`${tsPath}::${format}`).digest('hex')

    const jsPath = resolvePath(cacheDir, `${cacheKey}.js`)
    const metaPath = resolvePath(cacheDir, `${cacheKey}.meta.json`)

    const metaFile = await readTextFileIfExists(metaPath)
    if (metaFile) {
      try {
        const meta = JSON.parse(metaFile) as Meta
        if (meta.hash === sourceCoreHash) {
          const cachedJs = await readTextFileIfExists(jsPath)
          if (cachedJs != undefined) {
            return {
              format,
              shortCircuit: true,
              source: cachedJs
            }
          }
        }
      } catch {
        //
      }
    }

    const transformedSource = ts.transpileModule(sourceCode, {
      fileName: tsPath,
      compilerOptions: {
        target: ts.ScriptTarget.ESNext,
        module: format === 'commonjs' ? ts.ModuleKind.CommonJS : ts.ModuleKind.ESNext,
        inlineSourceMap: true,
        esModuleInterop: format === 'commonjs'
      }
    }).outputText

    const metaContent = JSON.stringify({ hash: sourceCoreHash }, null, 0)

    await writeFile(jsPath, transformedSource)
    await writeFile(metaPath, metaContent)

    return {
      format,
      shortCircuit: true,
      source: transformedSource
    }
  }

  return nextLoad(url)
}

async function getLiftConfig() {
  const configBasename = '.lift.json'
  const configPath = (await findFileInNearestParent(cwd(), configBasename)) ?? resolvePath(cwd(), configBasename)
  const config = (await readJsonFile(configPath)) as LiftConfig

  if (!config.cacheDir) config.cacheDir = './.lift/cache'

  config.cacheDir = resolvePath(dirname(configPath), config.cacheDir)

  await mkdir(config.cacheDir, { recursive: true })

  return config
}
