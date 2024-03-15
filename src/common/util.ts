/* eslint-disable @typescript-eslint/no-explicit-any */
import { readFile } from 'node:fs/promises'
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

export function format(str: string, args: unknown[]) {
  for (let i = 0; i < args.length; i++) {
    str = str.replace(`%{${i}}`, args[i] as string)
  }
  return str
}
