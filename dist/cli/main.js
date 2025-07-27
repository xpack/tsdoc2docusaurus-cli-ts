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
// import * as util from 'node:util'
import { formatDuration } from '../docusaurus/utils.js';
import { CliOptions } from '../docusaurus/cli-options.js';
import { Workspace } from '../docusaurus/workspace.js';
import { DocusaurusGenerator } from '../docusaurus/generator.js';
import { DataModel } from '../tsdoc/data-model.js';
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
    let commandLine = path.basename(argv[1] ?? 'tsdoc2docusaurus');
    if (argv.length > 2) {
        commandLine += ` ${argv.slice(2).join(' ')}`;
    }
    console.log(`Running '${commandLine}'...`);
    const options = new CliOptions(argv);
    await options.parse();
    let exitCode = 0;
    console.log();
    const dataModel = new DataModel();
    await dataModel.parse(options);
    const workspace = new Workspace({ dataModel, options });
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