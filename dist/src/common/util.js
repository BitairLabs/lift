import fs, { access, mkdir, readFile, writeFile } from 'node:fs/promises';
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
export function formatString(str, ...args) {
    for (let i = 0; i < args.length; i++) {
        str = str.replace(`%{${i}}`, args[i]);
    }
    return str;
}
export async function createDirIfNotExists(path) {
    if (!(await fileExists(path))) {
        return mkdir(path, { recursive: true });
    }
    return Promise.resolve();
}
export function writeJsonFile(src, content) {
    return writeFile(src, JSON.stringify(content, null, 4));
}
export async function writeJsonFileIfNotExists(src, content) {
    if (!(await fileExists(src))) {
        return writeFile(src, JSON.stringify(content, null, 4));
    }
    return Promise.resolve();
}
export async function writeFileIfNotExists(src, content) {
    if (!(await fileExists(src))) {
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
export async function fileExists(src) {
    try {
        await access(src, fs.constants.F_OK);
        return true;
    }
    catch (error) {
        return false;
    }
}
