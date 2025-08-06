/*
 * This file is part of the xPack project (http://xpack.github.io).
 * Copyright (c) 2025 Liviu Ionescu. All rights reserved.
 *
 * Permission to use, copy, modify, and/or distribute this software
 * for any purpose is hereby granted, under the terms of the MIT license.
 *
 * If a copy of the license was not distributed with this file, it can
 * be obtained from https://opensource.org/licenses/MIT.
 */
// ----------------------------------------------------------------------------
// import assert from 'node:assert'
import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
// import * as util from 'node:util'
import { formatDuration } from '../docusaurus/utils.js';
import { CliOptions } from '../docusaurus/cli-options.js';
import { Workspace } from '../docusaurus/workspace.js';
import { DocusaurusGenerator } from '../docusaurus/generator.js';
import { DataModel } from '../tsdoc/data-model.js';
// https://www.npmjs.com/package/commander
import { Command } from 'commander';
// ----------------------------------------------------------------------------
/**
 * Main entry point for the tsdoc2docusaurus CLI tool.
 *
 * @param argv - Command line arguments array
 * @returns Promise that resolves to the exit code (0 for success, 1 for error)
 *
 * @public
 */
export async function main(argv) {
    const startTime = Date.now();
    // Like .../doxygen2docusaurus/dist/cli
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const packageJsonPath = path.join(path.dirname(path.dirname(__dirname)), 'package.json');
    const packageJsonContent = await fs.readFile(packageJsonPath);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const packageJson = JSON.parse(packageJsonContent.toString());
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const packageVersion = packageJson.version;
    const program = new Command();
    program.option('--id <name>', 'configuration id, for multi-configurations');
    program.option('--verbose', 'display more details during the conversion');
    program.option('--debug', 'display debug lines during the conversion');
    program.option('-C <path>', 'change the current folder');
    program.option('-v, --version', 'display version');
    program.parse(argv);
    const programOptions = program.opts();
    if (programOptions.version) {
        console.log(packageVersion);
        return 0;
    }
    if (programOptions.C) {
        process.chdir(programOptions.C);
    }
    let commandLine = path.basename(argv[1] ?? 'tsdoc2docusaurus');
    if (argv.length > 2) {
        commandLine += ` ${argv.slice(2).join(' ')}`;
    }
    console.log(`Running '${commandLine}' (v${packageVersion})...`);
    const id = programOptions.id ?? 'default';
    const verbose = programOptions.verbose;
    const debug = programOptions.debug;
    const commandOptions = { id, verbose, debug };
    const options = new CliOptions(commandOptions);
    await options.parse();
    let exitCode = 0;
    console.log();
    const dataModel = new DataModel(options);
    await dataModel.parse();
    const workspace = new Workspace(dataModel);
    const generator = new DocusaurusGenerator(workspace);
    exitCode = await generator.run();
    const durationString = formatDuration(Date.now() - startTime);
    if (exitCode === 0) {
        console.log();
        console.log(`Running '${commandLine}' has completed successfully ` +
            `in ${durationString}.`);
    }
    return exitCode;
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=main.js.map