import fs, { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname as getDirname, resolve as resolvePath } from 'node:path'

export async function readFileInNearestParent(parent: string, basename: string): Promise<string | undefined> {
  try {
    const src = resolvePath(parent, basename)
    const content = await readFile(src, { encoding: 'utf8' })
    return content
  } catch (error) {
    //
  }

  parent = getDirname(parent)
  if (parent.length) return await readFileInNearestParent(parent, basename)

  return undefined
}

export async function findFileInNearestParent(parent: string, basename: string): Promise<string | undefined> {
  try {
    const src = resolvePath(parent, basename)
    await readFile(src, { encoding: 'utf8' })
    return src
  } catch (error) {
    //
  }

  parent = getDirname(parent)
  if (parent.length) return await findFileInNearestParent(parent, basename)

  return undefined
}

export function tryRun<T>(func: () => T): Partial<{ error: unknown; result: T | undefined }> {
  try {
    return { result: func() }
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

export async function createDirIfNotExists(path: string) {
  if (!(await fileExists(path))) {
    return mkdir(path, { recursive: true })
  }

  return Promise.resolve()
}

export function writeJsonFile(src: string, content: object) {
  return writeFile(src, JSON.stringify(content, null, 4))
}

export async function writeJsonFileIfNotExists(src: string, content: object) {
  if (!(await fileExists(src))) {
    return writeFile(src, JSON.stringify(content, null, 4))
  }

  return Promise.resolve()
}

export async function writeFileIfNotExists(src: string, content: string | NodeJS.ArrayBufferView) {
  if (!(await fileExists(src))) {
    return writeFile(src, content)
  }

  return Promise.resolve()
}

export function readJsonFile(src: string) {
  return readFile(src, 'utf8')
    .then(content => JSON.parse(content) as unknown)
    .catch(() => ({}))
}

export function readTextFile(src: string) {
  return readFile(src, 'utf8')
}

export async function fileExists(src: string) {
  try {
    await access(src, fs.constants.F_OK)
    return true
  } catch (error) {
    return false
  }
}
