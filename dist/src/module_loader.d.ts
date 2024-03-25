import type { LoadHookContext, LoadHookResult, ResolveHookContext, ResolveHookResult } from './common/types.js';
export declare function resolve(specifier: string, context: ResolveHookContext, nextResolve: (specifier: string, context?: object) => Promise<ResolveHookResult>): Promise<ResolveHookResult>;
export declare function load(url: string, context: LoadHookContext, nextLoad: (specifier: string, context?: LoadHookContext) => Promise<LoadHookResult>): Promise<LoadHookResult>;
