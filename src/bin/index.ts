#!/usr/bin/env node
import { resolve as resolvePath } from 'node:path'
import { Exception } from '../common/constants.js'
import { LiftError } from '../common/lift_error.js'
import { spawn } from 'node:child_process'

const subcommand = process.argv[2]

try {
  if (!subcommand) throw new LiftError(Exception.CLISubcommandRequired, subcommand)

  if (!['lint', 'run', 'test'].includes(subcommand)) throw new LiftError(Exception.CLIInvalidSubcommand, subcommand)

  const args = process.argv.slice(3)

  if (subcommand === 'lint') {
    const rootDir = resolvePath(import.meta.dirname, '../..')
    if (!(args.includes('-c') || args.includes('--config'))) args.push('-c', `${rootDir}/.eslintrc.cjs`)
    if (!args.includes('--ext')) args.push('--ext', '.ts')
    args.push('.')
    exec('eslint', args)
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
