import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { findPackageJSON, register } from 'node:module';
import { dirname, resolve as resolvePath } from 'node:path';
import { cwd } from 'node:process';
import { fileURLToPath } from 'node:url';
import { fileExists, findFileInNearestParent, readJsonFileIfExists, readTextFile, readTextFileIfExists } from './common/util.js';
var Format;
(function (Format) {
    Format["CommonJS"] = "commonjs";
    Format["Module"] = "module";
})(Format || (Format = {}));
var Compiler;
(function (Compiler) {
    Compiler["Native"] = "native";
    Compiler["ESBuild"] = "esbuild";
    Compiler["TSC"] = "tsc";
})(Compiler || (Compiler = {}));
register('./index.js', import.meta.url);
export async function resolve(specifier, context, nextResolve) {
    if (specifier.match(/\.(c|m|)js$/)) {
        return nextResolve(specifier, context).catch(async (error) => {
            const { code = '', url = '' } = error;
            if (code === 'ERR_MODULE_NOT_FOUND' && url.match(/js$/)) {
                const filePath = fileURLToPath(url).replace(/js$/, 'ts');
                if (await fileExists(filePath))
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
        const { enableCaching, cacheDir, compiler } = await getLiftConfig();
        let cacheKey;
        let jsPath;
        let metaPath;
        let tsCode;
        let tsCodeHash;
        if (enableCaching) {
            cacheKey = createHash('md5').update(`${tsPath}`).digest('base64url');
            metaPath = resolvePath(cacheDir, `${cacheKey}.meta.json`);
            const metaRaw = await readTextFileIfExists(metaPath);
            if (metaRaw) {
                tsCode = await readTextFile(tsPath);
                tsCodeHash = createHash('md5').update(tsCode).digest('base64');
                const meta = JSON.parse(metaRaw);
                if (meta.hash === tsCodeHash) {
                    jsPath = resolvePath(cacheDir, `${cacheKey}.js`);
                    const jsCode = await readTextFileIfExists(jsPath);
                    if (jsCode) {
                        return {
                            format: meta.format,
                            shortCircuit: true,
                            source: jsCode
                        };
                    }
                }
            }
        }
        const packageConfigPath = findPackageJSON(url) ?? 'package.json';
        const packageConfig = ((await readJsonFileIfExists(packageConfigPath)) ?? {});
        const format = tsPath.match(/\.cts$/)
            ? Format.CommonJS
            : url.match(/\.mts$/)
                ? Format.Module
                : packageConfig.type || Format.CommonJS;
        const jsCode = await compile(tsPath, tsCode, format, compiler);
        if (enableCaching) {
            jsPath = jsPath ?? resolvePath(cacheDir, `${cacheKey}.js`);
            await writeFile(jsPath, jsCode);
            tsCode = tsCode ?? (await readTextFile(tsPath));
            tsCodeHash = tsCodeHash ?? createHash('md5').update(tsCode).digest('base64');
            const metaContent = JSON.stringify({ hash: tsCodeHash, format }, null, 0);
            await writeFile(metaPath, metaContent);
        }
        return {
            format,
            shortCircuit: true,
            source: jsCode
        };
    }
    return nextLoad(url);
}
async function compile(path, code, format, compiler) {
    switch (compiler) {
        case Compiler.Native: {
            const { stripTypeScriptTypes } = await import('node:module');
            code = code ?? (await readTextFile(path));
            return stripTypeScriptTypes(code, {
                mode: 'transform',
                sourceUrl: path
            });
        }
        case Compiler.ESBuild: {
            const esbuild = await import('esbuild');
            return (await esbuild.build({
                entryPoints: [path],
                write: false,
                bundle: false,
                platform: 'node',
                format: format === Format.CommonJS ? 'cjs' : 'esm',
                target: 'es2022',
                sourcemap: 'inline'
            })).outputFiles[0].text;
        }
        case Compiler.TSC: {
            const ts = await import('typescript');
            code = code ?? (await readTextFile(path));
            return ts.transpileModule(code, {
                fileName: path,
                compilerOptions: {
                    target: ts.ScriptTarget.ESNext,
                    module: format === Format.CommonJS ? ts.ModuleKind.CommonJS : ts.ModuleKind.ESNext,
                    inlineSourceMap: true,
                    esModuleInterop: format === Format.CommonJS
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
    const config = ((await readJsonFileIfExists(configPath)) ?? {});
    if (!config.cacheDir)
        config.cacheDir = './.lift/cache';
    if (!config.compiler)
        config.compiler = Compiler.ESBuild;
    if (config.enableCaching === undefined)
        config.enableCaching = true;
    if (config.enableCaching) {
        config.cacheDir = resolvePath(dirname(configPath), config.cacheDir);
        await mkdir(config.cacheDir, { recursive: true });
    }
    return config;
}
