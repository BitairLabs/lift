import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { register } from 'node:module';
import { dirname, resolve as resolvePath } from 'node:path';
import { cwd } from 'node:process';
import { fileURLToPath } from 'node:url';
import { fileExists, findFileInNearestParent, readJsonFile, readTextFileIfExists } from './common/util.js';
const { enableCaching, cacheDir, compiler } = await getLiftConfig();
register('./index.js', import.meta.url);
export async function resolve(specifier, context, nextResolve) {
    if (specifier.match(/\.(c|m|)js$/)) {
        return nextResolve(specifier, context).catch(async (error) => {
            const { code = '', url = '' } = error;
            if (code === 'ERR_MODULE_NOT_FOUND' && url.match(/js$/)) {
                const src = fileURLToPath(url).replace(/js$/, 'ts');
                // If the corresponding .ts exists, redirect .js -> .ts
                if (await fileExists(src))
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
        const tsPath = fileURLToPath(url);
        const packageConfigPath = (await findFileInNearestParent(dirname(tsPath), 'package.json')) ?? 'package.json';
        const packageConfig = (await readJsonFile(packageConfigPath));
        const format = tsPath.match(/\.cts$/)
            ? 'commonjs'
            : url.match(/\.mts$/)
                ? 'module'
                : packageConfig.type || 'commonjs';
        let sourceCoreHash;
        let cacheKey;
        let jsPath;
        let metaPath;
        if (enableCaching) {
            const sourceCode = await readFile(tsPath, { encoding: 'utf8' });
            sourceCoreHash = createHash('sha256').update(sourceCode).digest('hex');
            cacheKey = createHash('sha256').update(`${tsPath}::${format}`).digest('hex');
            jsPath = resolvePath(cacheDir, `${cacheKey}.js`);
            metaPath = resolvePath(cacheDir, `${cacheKey}.meta.json`);
            const metaFile = await readTextFileIfExists(metaPath);
            if (metaFile) {
                try {
                    const meta = JSON.parse(metaFile);
                    if (meta.hash === sourceCoreHash) {
                        const cachedJs = await readTextFileIfExists(jsPath);
                        if (cachedJs != undefined) {
                            return {
                                format,
                                shortCircuit: true,
                                source: cachedJs
                            };
                        }
                    }
                }
                catch {
                    //
                }
            }
        }
        const transformedSource = await compile(tsPath, format);
        if (enableCaching) {
            const metaContent = JSON.stringify({ hash: sourceCoreHash }, null, 0);
            await writeFile(jsPath, transformedSource);
            await writeFile(metaPath, metaContent);
        }
        return {
            format,
            shortCircuit: true,
            source: transformedSource
        };
    }
    return nextLoad(url);
}
async function compile(path, format) {
    switch (compiler) {
        case 'esbuild': {
            const esbuild = await import('esbuild');
            return (await esbuild.build({
                entryPoints: [path],
                write: false,
                bundle: false,
                platform: 'node',
                format: format === 'commonjs' ? 'cjs' : 'esm',
                target: 'es2022',
                sourcemap: 'inline'
            })).outputFiles[0].text;
        }
        case 'tsc': {
            const ts = await import('typescript');
            return ts.transpileModule(await readFile(path, { encoding: 'utf8' }), {
                fileName: path,
                compilerOptions: {
                    target: ts.ScriptTarget.ESNext,
                    module: format === 'commonjs' ? ts.ModuleKind.CommonJS : ts.ModuleKind.ESNext,
                    inlineSourceMap: true,
                    esModuleInterop: format === 'commonjs'
                }
            }).outputText;
        }
        default:
            throw new Error(`Lift Error: Unsupported compiler "${compiler}"`);
    }
}
async function getLiftConfig() {
    const configBasename = '.lift.json';
    const configPath = (await findFileInNearestParent(cwd(), configBasename)) ?? resolvePath(cwd(), configBasename);
    const config = (await readJsonFile(configPath));
    if (!config.cacheDir)
        config.cacheDir = './.lift/cache';
    if (!config.compiler)
        config.compiler = 'esbuild';
    if (config.enableCaching === undefined)
        config.enableCaching = true;
    if (config.enableCaching) {
        config.cacheDir = resolvePath(dirname(configPath), config.cacheDir);
        await mkdir(config.cacheDir, { recursive: true });
    }
    return config;
}
