/* eslint-disable @typescript-eslint/no-explicit-any */
import { readFile } from 'node:fs/promises';
import { dirname as getDirname, resolve as resolvePath } from 'node:path';
export async function readFileInNearestParent(parent, basename) {
    try {
        const src = resolvePath(parent, basename);
        const content = await readFile(src, { encoding: 'utf8' });
        return content;
    }
    catch (error) {
        //
    }
    parent = getDirname(parent);
    if (parent.length)
        return await readFileInNearestParent(parent, basename);
    return undefined;
}
export async function findFileInNearestParent(parent, basename) {
    try {
        const src = resolvePath(parent, basename);
        await readFile(src, { encoding: 'utf8' });
        return src;
    }
    catch (error) {
        //
    }
    parent = getDirname(parent);
    if (parent.length)
        return await findFileInNearestParent(parent, basename);
    return undefined;
}
export function tryRun(func) {
    try {
        return { result: func() };
    }
    catch (error) {
        return { error };
    }
}
export function format(str, args) {
    for (let i = 0; i < args.length; i++) {
        str = str.replace(`%{${i}}`, args[i]);
    }
    return str;
}
