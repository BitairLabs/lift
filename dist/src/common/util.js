import fs, { access, readFile } from 'node:fs/promises';
import { dirname, resolve as resolvePath } from 'node:path';
export async function findFileInNearestParent(parent, basename) {
    const path = resolvePath(parent, basename);
    if (await fileExists(path))
        return path;
    const oldParent = parent;
    parent = dirname(parent);
    if (parent !== oldParent)
        return await findFileInNearestParent(parent, basename);
    return undefined;
}
export async function readTextFileIfExists(path) {
    const { result: content } = await tryRunAsync(async () => await readFile(path, { encoding: 'utf8' }));
    return content;
}
export async function readTextFile(path) {
    return readFile(path, { encoding: 'utf8' });
}
export async function readJsonFileIfExists(path) {
    const { result: content } = await tryRunAsync(async () => await readFile(path, { encoding: 'utf8' }));
    return content ? JSON.parse(content) : undefined;
}
export async function fileExists(path) {
    try {
        await access(path, fs.constants.F_OK);
        return true;
    }
    catch {
        return false;
    }
}
export function tryRun(func) {
    try {
        return { result: func() };
    }
    catch (error) {
        return { error };
    }
}
export async function tryRunAsync(func) {
    try {
        return { result: await func() };
    }
    catch (error) {
        return { error };
    }
}
export function formatString(str, ...args) {
    for (let i = 0; i < args.length; i++) {
        str = str.replace(`%{${i}}`, args[i]);
    }
    return str;
}
