export declare type ResolveHookContext = {
  conditions: string[]
  importAttributes: object
  parentURL?: string | undefined
}

export declare type ResolveHookResult = {
  format?: string | null | undefined
  importAttributes?: object | undefined
  shortCircuit?: undefined | boolean
  url: string
}

export declare type LoadHookContext = {
  conditions: string[]
  format?: string | null | undefined
  importAttributes: object
}

export declare type LoadHookResult = {
  format: 'builtin' | 'commonjs' | 'json' | 'module' | 'wasm'
  shortCircuit?: boolean | undefined
  source: string
}

export declare type PackageConfig = {
  type?: 'module' | 'commonjs'
  name: string
  workspaces: string[]
  scripts: Dict<string>
  dependencies: Dict<string>
}

export declare type LiftConfig = {
  tsconfig: Dict<unknown>
}

export declare type Dict<T> = {
  [key: string]: T
}
