import fs, { access, readFile } from 'node:fs/promises'
import { dirname, resolve as resolvePath } from 'node:path'

export async function findFileInNearestParent(parent: string, basename: string) {
  const path = resolvePath(parent, basename)
  if (await fileExists(path)) return path

  const oldParent = parent
  parent = dirname(parent)
  if (parent !== oldParent) return await findFileInNearestParent(parent, basename)

  return undefined
}

export async function readTextFileIfExists(path: string) {
  const { result: content } = await tryRunAsync(async () => await readFile(path, { encoding: 'utf8' }))
  return content
}

export async function readTextFile(path: string) {
  return readFile(path, { encoding: 'utf8' })
}

export async function readJsonFileIfExists(path: string) {
  const { result: content } = await tryRunAsync(async () => await readFile(path, { encoding: 'utf8' }))
  return content ? JSON.parse(content) : undefined
}

export async function fileExists(path: string) {
  try {
    await access(path, fs.constants.F_OK)
    return true
  } catch {
    return false
  }
}

export function tryRun<T>(func: () => T) {
  try {
    return { result: func() }
  } catch (error) {
    return { error }
  }
}

export async function tryRunAsync<T>(func: () => T) {
  try {
    return { result: await func() }
  } catch (error) {
    return { error }
  }
}

export function formatString(str: string, ...args: unknown[]) {
  for (let i = 0; i < args.length; i++) {
    str = str.replace(`%{${i}}`, args[i] as string)
  }
  return str
}
