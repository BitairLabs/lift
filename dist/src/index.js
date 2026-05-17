// lib/src/index.ts
import { existsSync } from "node:fs";
import { mkdir, readFile as readFile2, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { register } from "node:module";
import { dirname as dirname2, resolve as resolvePath2 } from "node:path";
import { cwd } from "node:process";
import { fileURLToPath } from "node:url";
import ts from "typescript";

// lib/src/common/util.ts
import fs, { access, readFile } from "node:fs/promises";
import { dirname, resolve as resolvePath } from "node:path";
async function readFileInNearestParent(parent, basename) {
  try {
    const path = resolvePath(parent, basename);
    const content = await readFile(path, { encoding: "utf8" });
    return content;
  } catch {
  }
  const oldParent = parent;
  parent = dirname(parent);
  if (parent !== oldParent) return await readFileInNearestParent(parent, basename);
  return void 0;
}
async function findFileInNearestParent(parent, basename) {
  const path = resolvePath(parent, basename);
  if (await fileExists(path)) return path;
  const oldParent = parent;
  parent = dirname(parent);
  if (parent !== oldParent) return await findFileInNearestParent(parent, basename);
  return void 0;
}
async function readJsonFile(src) {
  try {
    const content = await readFile(src, "utf8");
    return JSON.parse(content);
  } catch {
    return {};
  }
}
async function readTextFileIfExists(src) {
  try {
    const content = await readFile(src, { encoding: "utf8" });
    return content;
  } catch {
    return void 0;
  }
}
async function fileExists(src) {
  try {
    await access(src, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

// lib/src/index.ts
var { cacheDir } = await getLiftConfig();
register("./index.js", import.meta.url);
async function resolve(specifier, context, nextResolve) {
  if (specifier.match(/\.(c|m|)js$/)) {
    return nextResolve(specifier, context).catch((error) => {
      const { code = "", url = "" } = error;
      if (code === "ERR_MODULE_NOT_FOUND" && url.match(/js$/)) {
        const src = fileURLToPath(url).replace(/js$/, "ts");
        if (existsSync(src))
          return {
            format: "typescript",
            shortCircuit: true,
            url: url.replace(/js$/, "ts")
          };
      }
      throw error;
    });
  }
  if (specifier.match(/\.(c|m|)ts$/)) {
    return nextResolve(specifier, context).then((res) => ({
      ...res,
      format: "typescript"
    }));
  }
  return nextResolve(specifier, context);
}
async function load(url, context, nextLoad) {
  if (context.format === "typescript") {
    const tsPath = fileURLToPath(url);
    const format = tsPath.match(/\.cts$/) ? "commonjs" : url.match(/\.mts$/) ? "module" : JSON.parse(await readFileInNearestParent(dirname2(tsPath), "package.json") ?? "{}").type || "commonjs";
    const sourceCode = await readFile2(tsPath, { encoding: "utf8" });
    const sourceCoreHash = createHash("sha256").update(sourceCode).digest("hex");
    const cacheKey = createHash("sha256").update(`${tsPath}::${format}`).digest("hex");
    const jsPath = resolvePath2(cacheDir, `${cacheKey}.js`);
    const metaPath = resolvePath2(cacheDir, `${cacheKey}.meta.json`);
    const metaFile = await readTextFileIfExists(metaPath);
    if (metaFile) {
      try {
        const meta = JSON.parse(metaFile);
        if (meta.hash === sourceCoreHash) {
          const cachedJs = await readTextFileIfExists(jsPath);
          if (cachedJs != void 0) {
            return {
              format,
              shortCircuit: true,
              source: cachedJs
            };
          }
        }
      } catch {
      }
    }
    const transformedSource = ts.transpileModule(sourceCode, {
      fileName: tsPath,
      compilerOptions: {
        target: ts.ScriptTarget.ESNext,
        module: format === "commonjs" ? ts.ModuleKind.CommonJS : ts.ModuleKind.ESNext,
        inlineSourceMap: true,
        esModuleInterop: format === "commonjs"
      }
    }).outputText;
    const metaContent = JSON.stringify({ hash: sourceCoreHash }, null, 0);
    await writeFile(jsPath, transformedSource);
    await writeFile(metaPath, metaContent);
    return {
      format,
      shortCircuit: true,
      source: transformedSource
    };
  }
  return nextLoad(url);
}
async function getLiftConfig() {
  const configBasename = ".lift.json";
  const configPath = await findFileInNearestParent(cwd(), configBasename) ?? resolvePath2(cwd(), configBasename);
  const config = await readJsonFile(configPath);
  if (!config.cacheDir) config.cacheDir = "./.lift/cache";
  config.cacheDir = resolvePath2(dirname2(configPath), config.cacheDir);
  await mkdir(config.cacheDir, { recursive: true });
  return config;
}
export {
  load,
  resolve
};
