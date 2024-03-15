#!/usr/bin/env node
import { writeFile } from 'node:fs/promises'
import { Exception } from '../common/constants.js'
import { LiftError } from '../common/lift_error.js'
import { spawn } from 'node:child_process'
import { findFileInNearestParent } from '../common/util.js'

const subcommand = process.argv[2]

try {
  if (!subcommand) throw new LiftError(Exception.CLISubcommandRequired, subcommand)

  if (!['init', 'format', 'lint', 'run', 'test'].includes(subcommand))
    throw new LiftError(Exception.InvalidCLISubcommand, subcommand)

  const args = process.argv.slice(3)

  const rootDir = process.cwd()
  if (subcommand === 'init') {
    await writeFile(
      `${rootDir}/.eslintrc.cjs`,
      `module.exports = {
    env: {
        es2024: true,
        node: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:prettier/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: true,
        ecmaVersion: 'latest',
        sourceType: 'module',
        tsconfigRootDir: '.',
    },
    plugins: ['@typescript-eslint'],
}`
    )
    await writeFile(
      `${rootDir}/tsconfig.json`,
      JSON.stringify(
        {
          extends: '@bitair/lift/tsconfig.json',
          compilerOptions: {
            module: 'NodeNext'
          },
          include: ['**/*.ts']
        },
        null,
        4
      )
    )
    await writeFile(`${rootDir}/.eslintignore`, '')
    await writeFile(
      `${rootDir}/.prettierrc.json`,
      JSON.stringify(
        {
          trailingComma: 'es5',
          tabWidth: 4,
          semi: false,
          singleQuote: true
        },
        null,
        4
      )
    )
    await writeFile(`${rootDir}/.prettierignore`, '')
  } else if (subcommand === 'format' || subcommand === 'lint') {
    if (!(args.includes('-c') || args.includes('--config'))) {
      const eslintConfigPath = await findFileInNearestParent(rootDir, '.eslintrc.cjs')
      if (!eslintConfigPath) throw new LiftError(Exception.ESLintConfigNotFound)
      args.push('-c', eslintConfigPath)
    }
    if (subcommand === 'format') {
      if (!args.includes('--fix')) args.push('--fix')
      exec('eslint', args)
    } else if (subcommand === 'lint') {
      const projectArgIndex = args.indexOf('--project')
      const tsconfigPath = projectArgIndex !== -1 ? args[projectArgIndex + 1] : undefined
      exec('tsc', tsconfigPath ? ['--project', tsconfigPath] : ['--noEmit'])
      if (projectArgIndex !== -1) {
        args.splice(projectArgIndex, 1)
        args.splice(projectArgIndex, 1)
      }
      exec('eslint', args)
    }
  } else if (subcommand === 'run') {
    exec('node', ['--import', '@bitair/lift/register', ...args])
  } else if (subcommand === 'test') {
    exec('node', ['--import', '@bitair/lift/register', '--test', ...args])
  }
} catch (error) {
  console.error(error)
  process.exit(1)
}

function exec(cmd: string, args: string[]) {
  spawn(cmd, args, { stdio: 'inherit' })
}
