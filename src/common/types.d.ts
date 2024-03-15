export declare type LoadHooksContext = {
  conditions: string[]
  format: string | null | undefined
  importAttributes: object
}

export declare type LoadHooksResult = {
  format: 'builtin' | 'commonjs' | 'json' | 'module' | 'wasm'
  shortCircuit: boolean | undefined
  source: string
}

export declare type PackageConfig = {
  type?: 'module' | 'commonjs'
}

export declare type LiftConfig = {
  tsconfig: Dict<unknown>
}

export declare type Dict<T> = {
  [key: string]: T
}
