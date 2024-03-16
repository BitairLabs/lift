/* eslint-disable @typescript-eslint/no-explicit-any */
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
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
export function format(str, ...args) {
    for (let i = 0; i < args.length; i++) {
        str = str.replace(`%{${i}}`, args[i]);
    }
    return str;
}
export function createDirIfNotExists(path) {
    if (!existsSync(path)) {
        return mkdir(path, { recursive: true });
    }
    return Promise.resolve();
}
export function writeJsonFile(src, content) {
    return writeFile(src, JSON.stringify(content, null, 4));
}
export function writeJsonFileIfNotExists(src, content) {
    if (!existsSync(src)) {
        return writeFile(src, JSON.stringify(content, null, 4));
    }
    return Promise.resolve();
}
export function writeFileIfNotExists(src, content) {
    if (!existsSync(src)) {
        return writeFile(src, content);
    }
    return Promise.resolve();
}
export function readJsonFile(src) {
    return readFile(src, 'utf8')
        .then(content => JSON.parse(content))
        .catch(() => ({}));
}
export function readTextFile(src) {
    return readFile(src, 'utf8');
}
