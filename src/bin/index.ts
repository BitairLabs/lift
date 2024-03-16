#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve as resolvePath } from 'node:path'

import { Exception } from '../common/constants.js'
import { LiftError } from '../common/lift_error.js'
import {
  createDirIfNotExists,
  findFileInNearestParent,
  format as formatString,
  readJsonFile,
  readTextFile,
  writeFileIfNotExists,
  writeJsonFile,
} from '../common/util.js'

import type { PackageConfig } from '../common/types.js'

const subcommand = process.argv[2]
const rootDir = process.cwd()
const templatesDir = resolvePath(import.meta.dirname, 'templates')

try {
  if (!subcommand) throw new LiftError(Exception.CLISubcommandRequired, subcommand)

  const args = process.argv.slice(3)

  switch (subcommand) {
    case 'init':
      await init()
      break
    case 'add':
      await add(args)
      break
    case 'link':
      await link(args)
      break
    case 'format':
      await format(args)
      break
    case 'lint':
      await lint(args)
      break
    case 'test':
      await test(args)
      break
    case 'run':
      await run(args)
      break
    default:
      throw new LiftError(Exception.InvalidCLISubcommand, subcommand)
  }
} catch (error) {
  console.error(error)
  process.exit(1)
}

async function init() {
  const [eslintrc, tsconfig, prettierrc, defaultPackageConfig, packageConfig] = await Promise.all([
    readTextFile(resolvePath(templatesDir, 'repo', 'eslintrc.cjs.txt')),
    readTextFile(resolvePath(templatesDir, 'repo', 'tsconfig.json.txt')),
    readTextFile(resolvePath(templatesDir, 'repo', 'prettierrc.json.txt')),
    readJsonFile(resolvePath(templatesDir, 'repo', 'package.json.txt')) as Promise<PackageConfig>,
    readJsonFile(resolvePath(rootDir, 'package.json')) as Promise<PackageConfig>
  ])
  await Promise.all([
    writeFileIfNotExists(resolvePath(rootDir, '.eslintrc.cjs'), eslintrc),
    writeFileIfNotExists(resolvePath(rootDir, 'tsconfig.json'), tsconfig),
    writeFileIfNotExists(resolvePath(rootDir, '.prettierrc.json'), prettierrc),
    writeFileIfNotExists(resolvePath(rootDir, '.prettierrc.json'), prettierrc),
    writeFileIfNotExists(resolvePath(rootDir, '.eslintignore'), '\n'),
    writeFileIfNotExists(resolvePath(rootDir, '.prettierignore'), '\n')
  ])

  await Promise.all([
    createDirIfNotExists(resolvePath(rootDir, 'apps')),
    createDirIfNotExists(resolvePath(rootDir, 'libs'))
  ])

  packageConfig.type ??= 'module'
  packageConfig.workspaces ??= []
  packageConfig.workspaces.push(...defaultPackageConfig.workspaces)
  packageConfig.scripts = Object.assign(defaultPackageConfig.scripts, packageConfig.scripts ?? {})

  await writeJsonFile(resolvePath(rootDir, 'package.json'), packageConfig)

  console.log('\nnpx lift add app server')
  console.log('npx lift add lib common')
  console.log('npx lift link server common')
  console.log('\nnpm run format')
  console.log('npm run lint')
}

async function add(args: string[]) {
  const [type, name] = args
  const dirName = name!.startsWith('@') ? name!.split('/')[1]! : name!
  const packageName = name!.startsWith('@') ? name! : `@${type}s/${name}`
  const dirPath = resolvePath(rootDir, `${type}s`, dirName)
  const packageConfigPath = resolvePath(dirPath, 'package.json')

  await Promise.all([
    createDirIfNotExists(dirPath),
    createDirIfNotExists(resolvePath(dirPath, 'src')),
    createDirIfNotExists(resolvePath(dirPath, 'test'))
  ])
  if (type === 'app') {
    const [appIndex, appUtil, appTest, appPackage] = await Promise.all([
      readTextFile(resolvePath(templatesDir, 'package', 'app_index.ts.txt')),
      readTextFile(resolvePath(templatesDir, 'package', 'app_util.ts.txt')),
      readTextFile(resolvePath(templatesDir, 'package', 'app_test.ts.txt')),
      readTextFile(resolvePath(templatesDir, 'package', 'app_package.json.txt')),
      createDirIfNotExists(resolvePath(dirPath, 'src', 'common'))
    ])
    await Promise.all([
      writeFileIfNotExists(resolvePath(dirPath, 'src', 'index.ts'), appIndex),
      writeFileIfNotExists(resolvePath(dirPath, 'src', 'common', 'util.ts'), appUtil),
      writeFileIfNotExists(resolvePath(dirPath, 'test', 'index.ts'), appTest),
      writeFileIfNotExists(packageConfigPath, formatString(appPackage, packageName))
    ])
  } else {
    const [libUtil, libTest, libPackage] = await Promise.all([
      readTextFile(resolvePath(templatesDir, 'package', 'app_util.ts.txt')),
      readTextFile(resolvePath(templatesDir, 'package', 'lib_test.ts.txt')),
      readTextFile(resolvePath(templatesDir, 'package', 'lib_package.json.txt'))
    ])
    await Promise.all([
      writeFileIfNotExists(resolvePath(dirPath, 'src', 'util.ts'), libUtil),
      writeFileIfNotExists(resolvePath(dirPath, 'test', 'index.ts'), libTest),
      writeFileIfNotExists(packageConfigPath, formatString(libPackage, packageName))
    ])
  }

  type === 'app' && console.log(`\nnpm test --workspace=${packageName}\nnpm run start --workspace=${packageName}`)
  type === 'lib' && console.log(`\nnpm test --workspace=${packageName}`)
}

async function link(args: string[]) {
  const [target, source] = args
  const sourcePackageConfigPath = resolvePath(rootDir, 'libs', source!, 'package.json')
  if (!existsSync(sourcePackageConfigPath))
    throw new LiftError(Exception.PackageConfigMissing, resolvePath(rootDir, 'libs', source!))
  const sourcePackageConfig = (await readJsonFile(sourcePackageConfigPath)) as PackageConfig
  if (!sourcePackageConfig.name) throw new LiftError(Exception.PackageConfigNameMissing, sourcePackageConfigPath)

  const targetPackageConfigPath = resolvePath(rootDir, 'apps', target!, 'package.json')
  if (!existsSync(targetPackageConfigPath))
    throw new LiftError(Exception.PackageConfigMissing, resolvePath(rootDir, 'apps', target!))
  const targetPackageConfig = JSON.parse(await readTextFile(targetPackageConfigPath)) as PackageConfig
  targetPackageConfig.dependencies ??= {}
  const dep = sourcePackageConfig.name
  !Object.keys(targetPackageConfig.dependencies).includes(dep) && (targetPackageConfig.dependencies[dep] = '')
  await writeJsonFile(targetPackageConfigPath, targetPackageConfig)

  await exec('npm', ['i'])

  console.log(`\nHere is an import example:`)
  console.log(`import { helloWorld } from '${dep}/util.ts'`)
}

async function format(args: string[]) {
  if (!args.includes('--write')) args.push('--write')
  await exec('prettier', args)
}

async function lint(args: string[]) {
  if (!(args.includes('-c') || args.includes('--config'))) {
    const eslintConfigPath = await findFileInNearestParent(rootDir, '.eslintrc.cjs')
    if (!eslintConfigPath) throw new LiftError(Exception.ESLintConfigNotFound)
    args.push('-c', eslintConfigPath)
  }
  const tsconfigArgIndex = args.indexOf('--tsconfig')
  const tsconfigPath = tsconfigArgIndex !== -1 ? args[tsconfigArgIndex + 1] : undefined
  await exec('tsc', tsconfigPath ? ['--project', tsconfigPath] : ['--noEmit'])
  if (tsconfigArgIndex !== -1) {
    args.splice(tsconfigArgIndex, 1)
    args.splice(tsconfigArgIndex, 1)
  }
  await exec('eslint', args)
}

async function test(args: string[]) {
  await exec('node', ['--import', '@bitair/lift/register', '--test', ...args])
}

async function run(args: string[]) {
  await exec('node', ['--import', '@bitair/lift/register', ...args])
}

function exec(cmd: string, args: string[]) {
  return new Promise(resolve => {
    spawn(cmd, args, { stdio: 'inherit' }).on('close', () => {
      resolve(true)
    })
  })
}
