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
export async function readJsonFile(src) {
    try {
        const content = await readFile(src, 'utf8');
        return JSON.parse(content);
    }
    catch {
        return {};
    }
}
export async function readTextFileIfExists(src) {
    try {
        const content = await readFile(src, { encoding: 'utf8' });
        return content;
    }
    catch {
        return undefined;
    }
}
export async function fileExists(src) {
    try {
        await access(src, fs.constants.F_OK);
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
export function formatString(str, ...args) {
    for (let i = 0; i < args.length; i++) {
        str = str.replace(`%{${i}}`, args[i]);
    }
    return str;
}
