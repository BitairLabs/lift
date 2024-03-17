#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import chalk from 'chalk';
import { Command } from 'commander';
import figlet from 'figlet';
import inquirer from 'inquirer';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve as resolvePath } from 'node:path';
import isValidatePackageName from 'validate-npm-package-name';
import { Exception } from '../common/constants.js';
import { LiftError } from '../common/lift_error.js';
import { createDirIfNotExists, findFileInNearestParent, format as formatString, readJsonFile, readTextFile, writeFileIfNotExists, writeJsonFile } from '../common/util.js';
const program = new Command();
const rootDir = process.cwd();
const templatesDir = resolvePath(import.meta.dirname, 'templates');
try {
    program
        .name('Lift')
        .description('A CLI tool to setup a TypeScript Monorepo')
        .version('0.2.0')
        .configureOutput({
        outputError: (str, write) => {
            str = str.replace(/^error: /, '').replace(/\n$/, '.');
            str = str.replace(/^./, str[0].toUpperCase());
            write(chalk.red(`[Lift Error]: ${str}\n`));
        }
    });
    program
        .command('init')
        .description('Generate a monorepo')
        .action(async () => await init());
    program
        .command('add <type> <name>')
        .description('Add a new app or lib to the monorepo')
        .action(async (type, name) => await add(type, name));
    program
        .command('link <lib> <app>')
        .description('Link a lib to an app')
        .action(async (target, source) => await link(target, source));
    program
        .command('format <src>')
        .description('Format the code')
        .allowUnknownOption()
        .action(async () => await format());
    program
        .command('lint <src>')
        .description('Lint the code')
        .allowUnknownOption()
        .action(async () => await lint());
    program
        .command('test <src>')
        .description('Run TypeScript test suits')
        .allowUnknownOption()
        .action(async () => await test());
    program
        .command('run <src>')
        .description('Run a TypeScript program')
        .allowUnknownOption()
        .action(async () => await run());
    console.log('\n');
    const banner = figlet.textSync('  Lift', {
        font: 'ANSI Shadow',
        horizontalLayout: 'full',
        verticalLayout: 'full',
        whitespaceBreak: true
    });
    console.log(banner);
    await program.parseAsync(process.argv);
}
catch (error) {
    if (error instanceof LiftError) {
        console.log(chalk.red(error.message));
    }
    else {
        console.log(chalk.red(error));
    }
}
async function init() {
    const [eslintrc, tsconfig, prettierrc, defaultPackageConfig, packageConfig] = await Promise.all([
        readTextFile(resolvePath(templatesDir, 'repo', 'eslintrc.cjs.txt')),
        readTextFile(resolvePath(templatesDir, 'repo', 'tsconfig.json.txt')),
        readTextFile(resolvePath(templatesDir, 'repo', 'prettierrc.json.txt')),
        readJsonFile(resolvePath(templatesDir, 'repo', 'package.json.txt')),
        readJsonFile(resolvePath(rootDir, 'package.json'))
    ]);
    await Promise.all([
        writeFileIfNotExists(resolvePath(rootDir, '.eslintrc.cjs'), eslintrc),
        writeFileIfNotExists(resolvePath(rootDir, 'tsconfig.json'), tsconfig),
        writeFileIfNotExists(resolvePath(rootDir, '.prettierrc.json'), prettierrc),
        writeFileIfNotExists(resolvePath(rootDir, '.prettierrc.json'), prettierrc),
        writeFileIfNotExists(resolvePath(rootDir, '.eslintignore'), '\n'),
        writeFileIfNotExists(resolvePath(rootDir, '.prettierignore'), '\n')
    ]);
    await Promise.all([
        createDirIfNotExists(resolvePath(rootDir, 'apps')),
        createDirIfNotExists(resolvePath(rootDir, 'libs'))
    ]);
    packageConfig.type ??= 'module';
    packageConfig.workspaces ??= [];
    for (const workspace of defaultPackageConfig.workspaces) {
        !packageConfig.workspaces.includes(workspace) && packageConfig.workspaces.push(workspace);
    }
    packageConfig.scripts = Object.assign(defaultPackageConfig.scripts, packageConfig.scripts ?? {});
    await writeJsonFile(resolvePath(rootDir, 'package.json'), packageConfig);
    console.log(chalk.bold(chalk.green('  🎉 Your Monorepo is ready! What next?')));
    let done = false;
    do {
        const { projectType } = await inquirer.prompt([
            {
                type: 'list',
                name: 'projectType',
                message: 'Select the type of project you want to create:',
                choices: ['App', 'Lib', 'Exit']
            }
        ]);
        if (!['App', 'Lib'].includes(projectType)) {
            console.log(chalk.blue('\n  👋 Happy coding!\n'));
            done = true;
        }
        else {
            const { projectName } = await inquirer.prompt([
                {
                    type: 'string',
                    name: 'projectName',
                    message: 'Enter the name of the project',
                    validate(projectName) {
                        if (isValidatePackageName(projectName).validForNewPackages)
                            return true;
                        return formatString(Exception.InvalidPackageName.text, projectName);
                    }
                }
            ]);
            await add(projectType.toLowerCase(), projectName);
        }
    } while (!done);
}
async function add(type, name) {
    if (!['app', 'lib'].includes(type))
        throw new LiftError(Exception.InvalidProjectType, type);
    if (!isValidatePackageName(name).validForNewPackages)
        throw new LiftError(Exception.InvalidPackageName, name);
    const dirName = name.startsWith('@') ? name.split('/')[1] : name;
    const packageName = name.startsWith('@') ? name : `@${type}s/${name}`;
    const dirPath = resolvePath(rootDir, `${type}s`, dirName);
    const packageConfigPath = resolvePath(dirPath, 'package.json');
    await Promise.all([
        createDirIfNotExists(dirPath),
        createDirIfNotExists(resolvePath(dirPath, 'src')),
        createDirIfNotExists(resolvePath(dirPath, 'test'))
    ]);
    if (type === 'app') {
        const [appIndex, appUtil, appTest, appPackage] = await Promise.all([
            readTextFile(resolvePath(templatesDir, 'package', 'app_index.ts.txt')),
            readTextFile(resolvePath(templatesDir, 'package', 'app_util.ts.txt')),
            readTextFile(resolvePath(templatesDir, 'package', 'app_test.ts.txt')),
            readTextFile(resolvePath(templatesDir, 'package', 'app_package.json.txt')),
            createDirIfNotExists(resolvePath(dirPath, 'src', 'common'))
        ]);
        await Promise.all([
            writeFileIfNotExists(resolvePath(dirPath, 'src', 'index.ts'), appIndex),
            writeFileIfNotExists(resolvePath(dirPath, 'src', 'common', 'util.ts'), appUtil),
            writeFileIfNotExists(resolvePath(dirPath, 'test', 'index.ts'), appTest),
            writeFileIfNotExists(packageConfigPath, formatString(appPackage, packageName))
        ]);
    }
    else {
        const [libUtil, libTest, libPackage] = await Promise.all([
            readTextFile(resolvePath(templatesDir, 'package', 'app_util.ts.txt')),
            readTextFile(resolvePath(templatesDir, 'package', 'lib_test.ts.txt')),
            readTextFile(resolvePath(templatesDir, 'package', 'lib_package.json.txt'))
        ]);
        await Promise.all([
            writeFileIfNotExists(resolvePath(dirPath, 'src', 'util.ts'), libUtil),
            writeFileIfNotExists(resolvePath(dirPath, 'test', 'index.ts'), libTest),
            writeFileIfNotExists(packageConfigPath, formatString(libPackage, packageName))
        ]);
    }
    type === 'app' &&
        console.log(chalk.magenta(`\n  npm test --workspace=${packageName}\n  npm run start --workspace=${packageName}\n`));
    type === 'lib' && console.log(chalk.magenta(`\n  npm test --workspace=${packageName}\n`));
}
async function link(source, target) {
    const sourcePackageConfigPath = resolvePath(rootDir, 'libs', source, 'package.json');
    if (!existsSync(sourcePackageConfigPath))
        throw new LiftError(Exception.ProjectNotFound, resolvePath(rootDir, 'libs', source));
    const sourcePackageConfig = (await readJsonFile(sourcePackageConfigPath));
    if (!sourcePackageConfig.name)
        throw new LiftError(Exception.PackageConfigNameMissing, sourcePackageConfigPath);
    const targetPackageConfigPath = resolvePath(rootDir, 'apps', target, 'package.json');
    if (!existsSync(targetPackageConfigPath))
        throw new LiftError(Exception.ProjectNotFound, resolvePath(rootDir, 'apps', target));
    const targetPackageConfig = JSON.parse(await readTextFile(targetPackageConfigPath));
    targetPackageConfig.dependencies ??= {};
    const dep = sourcePackageConfig.name;
    !Object.keys(targetPackageConfig.dependencies).includes(dep) && (targetPackageConfig.dependencies[dep] = '');
    await writeJsonFile(targetPackageConfigPath, targetPackageConfig);
    await exec('npm', ['i']);
    console.log(chalk.bold(chalk.green('\n  🔗 Your link is ready!')));
    console.log(chalk.blue(`  You can import the lib in your app from`), chalk.magenta(sourcePackageConfig.name));
}
async function format() {
    const args = program.args.slice(1);
    if (!args.includes('--write'))
        args.push('--write');
    await exec('npx', ['prettier', ...args]);
}
async function lint() {
    const args = program.args.slice(1);
    if (!(args.includes('-c') || args.includes('--config'))) {
        const eslintConfigPath = await findFileInNearestParent(rootDir, '.eslintrc.cjs');
        if (!eslintConfigPath)
            throw new LiftError(Exception.ESLintConfigNotFound);
        args.push('-c', eslintConfigPath);
    }
    const tsconfigArgIndex = args.indexOf('--tsconfig');
    const tsconfigPath = tsconfigArgIndex !== -1 ? args[tsconfigArgIndex + 1] : undefined;
    await exec('tsc', tsconfigPath ? ['--project', tsconfigPath] : ['--noEmit']);
    if (tsconfigArgIndex !== -1) {
        args.splice(tsconfigArgIndex, 1);
        args.splice(tsconfigArgIndex, 1);
    }
    await exec('npx', ['eslint', ...args]);
}
async function test() {
    const args = program.args.slice(1);
    await exec('node', ['--import', '@bitair/lift/register', '--test', ...args]);
}
async function run() {
    const args = program.args.slice(1);
    await exec('node', ['--import', '@bitair/lift/register', ...args]);
}
function exec(cmd, args) {
    return new Promise((resolve, reject) => {
        spawn(cmd, args, { stdio: 'inherit' })
            .on('exit', code => {
            code === 0 ? resolve(true) : reject(`Failed to run the command '${cmd}' with args ${JSON.stringify(args)}.`);
        })
            .on('error', error => {
            reject(`${error.message.replace(/^Error:/, '')}`);
        });
    });
}
