import { readFile } from 'fs/promises';
import path from 'node:path';
import ts from 'typescript';
import { fileExists, tryRun } from './common/util.js';
export function resolve(rootDir) {
    return async function (req, res, next) {
        try {
            const url = req.url;
            if (url.match(/\/module\.(j|t)sx?$/)) {
                // Resolving the module's original code for debugging
                const src = url.replace(/\/module.+$/, '');
                if (await fileExists(src)) {
                    const content = (await readFile(src)).toString();
                    res.setHeader('CONTENT-TYPE', 'text/plain');
                    res.send(content);
                    return;
                }
            }
            else if (url.match(/\.(t|j)s$/)) {
                let src;
                const isScopedModuleUrl = url.match(/^\/SCOPED_MODULE:/);
                const isSubpathModuleUrl = url.match(/^\/SUBPATH_MODULE:/);
                if (isScopedModuleUrl || isSubpathModuleUrl) {
                    src = url.replace(/^\/SCOPED_MODULE:/, '@').replace(/^\/SUBPATH_MODULE:/, '#');
                    src = resolveModuleName(src, isScopedModuleUrl ? process.cwd() : '') ?? '';
                }
                else {
                    src = resolveModuleName(path.join(rootDir, url), '');
                }
                if (src) {
                    const content = (await readFile(src)).toString();
                    const compilerOptions = {
                        sourceRoot: src,
                        target: ts.ScriptTarget.ESNext,
                        module: ts.ModuleKind.ESNext,
                        inlineSourceMap: true,
                        jsx: ts.JsxEmit.React
                    };
                    const module = ts.transpileModule(content, {
                        compilerOptions,
                        transformers: {
                            before: [importTransformer]
                        }
                    }).outputText;
                    res.setHeader('CONTENT-TYPE', 'application/javascript');
                    res.send(module);
                    return;
                }
            }
            else if (url.match(/\.css$/)) {
                const src = path.join(rootDir, url);
                const content = await tryRun(async () => (await readFile(src)).toString()).result;
                if (content !== undefined) {
                    const module = [
                        'const style = document.createElement("style");',
                        'style.textContent=`' + content + '`;',
                        'document.head.appendChild(style);'
                    ].join('\n');
                    res.setHeader('CONTENT-TYPE', 'application/javascript');
                    res.send(module);
                    return;
                }
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
}
function importTransformer(context) {
    return (sourceFile) => {
        function visit(node) {
            if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
                node.moduleSpecifier &&
                ts.isStringLiteral(node.moduleSpecifier)) {
                const modulePath = node.moduleSpecifier.text;
                if (modulePath.match(/@|#/)) {
                    const moduleSpecifier = ts.factory.createStringLiteral(modulePath.replace(/^@/, '/SCOPED_MODULE:').replace(/^#/, '/SUBPATH_MODULE:'));
                    if (ts.isImportDeclaration(node))
                        return ts.factory.updateImportDeclaration(node, node.modifiers, node.importClause, moduleSpecifier, node.attributes);
                    else
                        return ts.factory.updateExportDeclaration(node, node.modifiers, node.isTypeOnly, node.exportClause, moduleSpecifier, node.attributes);
                }
            }
            return ts.visitEachChild(node, visit, context);
        }
        return ts.visitNode(sourceFile, visit);
    };
}
function resolveModuleName(moduleName, containingFile) {
    return ts.resolveModuleName(moduleName, containingFile, {
        baseUrl: '.',
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ESNext,
        moduleResolution: ts.ModuleResolutionKind.NodeNext
    }, {
        // eslint-disable-next-line @typescript-eslint/unbound-method
        fileExists: ts.sys.fileExists,
        // eslint-disable-next-line @typescript-eslint/unbound-method
        readFile: ts.sys.readFile,
        // eslint-disable-next-line @typescript-eslint/unbound-method
        realpath: ts.sys.realpath
    }).resolvedModule?.resolvedFileName;
}
