/// <reference types="node" resolution-mode="require"/>
export declare function readFileInNearestParent(parent: string, basename: string): Promise<string | undefined>;
export declare function findFileInNearestParent(parent: string, basename: string): Promise<string | undefined>;
export declare function tryRun<T>(func: () => T): Partial<{
    error: unknown;
    result: T | undefined;
}>;
export declare function formatString(str: string, ...args: unknown[]): string;
export declare function createDirIfNotExists(path: string): Promise<string | void>;
export declare function writeJsonFile(src: string, content: object): Promise<void>;
export declare function writeJsonFileIfNotExists(src: string, content: object): Promise<void>;
export declare function writeFileIfNotExists(src: string, content: string | NodeJS.ArrayBufferView): Promise<void>;
export declare function readJsonFile(src: string): Promise<unknown>;
export declare function readTextFile(src: string): Promise<string>;
export declare function fileExists(src: string): Promise<boolean>;
