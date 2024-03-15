import { readFile } from 'node:fs/promises';
import { dirname as getDirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { readFileInNearestParent, tryRun } from '../common/util.js';
export async function load(url, _context, nextLoad) {
    if (!url.match(/\.(c|m|)ts$/))
        return nextLoad(url);
    const src = fileURLToPath(url);
    const format = url.endsWith('.cts')
        ? 'commonjs'
        : url.endsWith('.mts')
            ? 'module'
            : JSON.parse((await tryRun(async () => await readFileInNearestParent(getDirname(src), 'package.json')).result) ?? '{}').type || 'commonjs';
    const source = await readFile(src, { encoding: 'utf8' });
    const transformedSource = ts.transpileModule(source, {
        fileName: src,
        compilerOptions: {
            target: ts.ScriptTarget.ESNext,
            module: format === 'commonjs' ? ts.ModuleKind.CommonJS : ts.ModuleKind.ESNext,
            sourceMap: true,
            esModuleInterop: format === 'commonjs'
        }
    }).outputText;
    return {
        format,
        shortCircuit: true,
        source: transformedSource
    };
}
