import { readFile } from 'node:fs/promises';
import { dirname as getDirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { readFileInNearestParent } from '../common/util.js';
import { existsSync } from 'node:fs';
export async function resolve(specifier, context, nextResolve) {
    if (specifier.match(/\.(c|m|)js$/)) {
        // TODO: Improve
        // The specifiers that use subpath patterns must be translated for resolving a URL.
        // For now, we are using this workaround to obtain the URL.
        return nextResolve(specifier, context).catch(error => {
            const { code = '', url = '' } = error;
            if (code === 'ERR_MODULE_NOT_FOUND' && url.match(/js$/)) {
                const src = fileURLToPath(url).replace(/js$/, 'ts');
                if (existsSync(src))
                    return {
                        format: 'typescript',
                        shortCircuit: true,
                        url: url.replace(/js$/, 'ts')
                    };
            }
            throw error;
        });
    }
    if (specifier.match(/\.(c|m|)ts$/)) {
        return nextResolve(specifier, context).then(res => ({
            ...res,
            format: 'typescript'
        }));
    }
    return nextResolve(specifier, context);
}
export async function load(url, context, nextLoad) {
    if (context.format === 'typescript') {
        const src = fileURLToPath(url);
        const format = src.match(/\.cts$/)
            ? 'commonjs'
            : url.match(/\.mts$/)
                ? 'module'
                : JSON.parse((await readFileInNearestParent(getDirname(src), 'package.json')) ?? '{}')
                    .type || 'commonjs';
        const source = await readFile(src, { encoding: 'utf8' });
        const transformedSource = ts.transpileModule(source, {
            fileName: src,
            compilerOptions: {
                target: ts.ScriptTarget.ESNext,
                module: format === 'commonjs' ? ts.ModuleKind.CommonJS : ts.ModuleKind.ESNext,
                inlineSourceMap: process.env['NODE_ENV'] !== 'production',
                esModuleInterop: format === 'commonjs'
            }
        }).outputText;
        return {
            format,
            shortCircuit: true,
            source: transformedSource
        };
    }
    return nextLoad(url);
}
