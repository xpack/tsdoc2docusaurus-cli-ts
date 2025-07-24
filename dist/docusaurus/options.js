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
import assert from 'node:assert';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as util from 'node:util';
// https://www.npmjs.com/package/commander
import { Command } from 'commander';
const defaultOptions = {
    apiJsonInputFilePath: '../api-extractor/update-me.api.json',
    apiMarkdownInputFolderPath: '../api-extractor/markdown',
    docsFolderPath: 'docs',
    apiFolderPath: 'api',
    baseUrl: '/',
    docsBaseUrl: 'docs',
    apiBaseUrl: 'api',
    sidebarCategoryFilePath: 'sidebar-category-tsdoc.json',
    sidebarCategoryLabel: 'API Reference (TSDoc)',
    menuDropdownLabel: 'Reference',
    customCssFilePath: 'src/css/custom-tsdoc2docusaurus.css',
    verbose: false,
    debug: false,
    id: 'default',
};
// ----------------------------------------------------------------------------
export async function parseOptions(argv) {
    const program = new Command();
    program.option('--id <name>', 'id, for multi-configurations');
    program.parse(argv);
    const programOptions = program.opts();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const id = programOptions.id;
    let configurationOptions = undefined;
    try {
        // Try to get the configuration from package.json/config/doxygen2docusaurus.
        const userPackageJsonPath = path.resolve(process.cwd(), 'package.json');
        const pkgJsonRaw = await fs.readFile(userPackageJsonPath, 'utf8');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const pkgJson = JSON.parse(pkgJsonRaw);
        const multiConfigurations = pkgJson.config?.tsdoc2docusaurus ?? pkgJson.tsdoc2docusaurus;
        configurationOptions = selectMultiConfiguration(multiConfigurations, id);
    }
    catch (err) {
        // try to get the configuration from doxygen2docusaurus.json.
        const userPackageJsonPath = path.resolve(process.cwd(), 'tsdoc2docusaurus.json');
        const pkgJsonRaw = await fs.readFile(userPackageJsonPath, 'utf8');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const multiConfigurations = JSON.parse(pkgJsonRaw);
        configurationOptions = selectMultiConfiguration(multiConfigurations, id);
    }
    // console.log(configurationOptions)
    let options = defaultOptions;
    if (configurationOptions !== undefined) {
        options = {
            ...getInstanceDefaultOptions(configurationOptions.id),
            ...configurationOptions,
        };
    }
    if (options.verbose) {
        console.log();
        console.log('configuration:', util.inspect(options));
    }
    assert(options.apiJsonInputFilePath.length > 0, 'doxygenXmlInputFolderPath is required');
    assert(options.docsFolderPath.length > 0, 'docsFolderPath is required');
    assert(options.apiFolderPath.length > 0, 'apiFolderPath is required');
    assert(options.docsBaseUrl.length > 0, 'docsBaseUrl is required');
    // assert(options.apiBaseUrl.length > 0, 'apiBaseUrl is required')
    assert(options.sidebarCategoryFilePath.length > 0, 'sidebarCategoryFilePath is required');
    return options;
}
// ----------------------------------------------------------------------------
function getInstanceDefaultOptions(id) {
    const options = { ...defaultOptions };
    if (id !== undefined && id.length > 0) {
        options.apiFolderPath = id;
        options.apiBaseUrl = id;
        options.sidebarCategoryFilePath = `sidebar-category-tsdoc-${id}.json`;
    }
    return options;
}
function selectMultiConfiguration(multiConfigurations, id) {
    let configurationOptions = undefined;
    if (id !== undefined) {
        // eslint-disable-next-line @typescript-eslint/prefer-destructuring
        configurationOptions =
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            multiConfigurations[id];
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (configurationOptions !== undefined) {
            configurationOptions.id = id;
        }
    }
    else {
        configurationOptions = multiConfigurations;
    }
    return configurationOptions;
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=options.js.map