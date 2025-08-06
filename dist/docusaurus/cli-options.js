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
// ----------------------------------------------------------------------------
/**
 * Options, as seen by the application. Most are mandatory.
 *
 * @remarks
 * If the user does not provide them, the defaults are used.
 *
 * @public
 */
export class CliOptions {
    /**
     * Relative to the current website folder, like `../api-extractor`,
     * no final slash.
     */
    apiJsonInputFolderPath = '../api-extractor';
    /**
     * Relative to the current website folder, like `../api-extractor/markdown`,
     * no final slash.
     */
    apiMarkdownInputFolderPath = '../api-extractor/markdown';
    /**
     * Relative to the current website folder, like `docs`, no initial/final
     * slashes.
     */
    docsFolderPath = 'docs';
    /** Relative to the docs folder, like `api`, no initial/final slashes. */
    apiFolderPath;
    /** Site base URL, like / or /xxx/. */
    baseUrl = '/';
    /** Relative to the web home, like `docs`, without initial/final slashes. */
    docsBaseUrl = 'docs';
    /** Relative to the docs home, like `api`, without initial/final slashes. */
    apiBaseUrl;
    /**
     * Relative to the current website folder, default
     * `sidebar-category-doxygen.json`.
     */
    sidebarCategoryFilePath = 'sidebar-category-tsdoc.json';
    /** Short text to be displayed in the sidebar. */
    sidebarCategoryLabel = 'API Reference (TSDoc)';
    /**
     * Relative to the current website folder, default
     * `docusaurus-config-tsdoc-menu.json`.
     */
    navbarFilePath;
    /** Short text to be displayed in the menu. */
    navbarLabel = 'Reference';
    /** Where the menu is to be displayed, left or right. */
    navbarPosition = 'left';
    /**
     * Relative to the current website folder, default
     * `src/css/custom-doxygen.css`.
     */
    customCssFilePath = 'src/css/custom-tsdoc2docusaurus.css';
    /** Boolean to control verbosity. */
    verbose = false;
    /** Boolean to control debug verbosity. */
    debug = false;
    /** String identifier in case of multiple instances. */
    id;
    constructor(commandOptions) {
        this.id = commandOptions.id;
        if (commandOptions.verbose !== undefined) {
            this.verbose = true;
        }
        if (commandOptions.debug !== undefined) {
            this.debug = true;
        }
        if (this.id !== 'default') {
            this.apiFolderPath = this.id;
            this.apiBaseUrl = this.id;
            this.sidebarCategoryFilePath = `sidebar-category-tsdoc-${this.id}.json`;
            this.navbarFilePath = `docusaurus-config-navbar-tsdoc-${this.id}.json`;
        }
        else {
            this.apiFolderPath = 'api';
            this.apiBaseUrl = 'api';
            this.sidebarCategoryFilePath = `sidebar-category-tsdoc.json`;
            this.navbarFilePath = 'docusaurus-config-navbar-tsdoc.json';
        }
    }
    async parse() {
        let configurationOptions = undefined;
        try {
            const userPackageJsonPath = path.resolve(process.cwd(), 'config', 'tsdoc2docusaurus.json');
            const pkgJsonRaw = await fs.readFile(userPackageJsonPath, 'utf8');
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const multiConfigurations = JSON.parse(pkgJsonRaw);
            configurationOptions = this.selectMultiConfiguration(multiConfigurations);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        }
        catch (err) {
            /* Cannot read/parse JSON */
        }
        if (configurationOptions === undefined) {
            try {
                const userPackageJsonPath = path.resolve(process.cwd(), 'tsdoc2docusaurus.json');
                const pkgJsonRaw = await fs.readFile(userPackageJsonPath, 'utf8');
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const multiConfigurations = JSON.parse(pkgJsonRaw);
                configurationOptions =
                    this.selectMultiConfiguration(multiConfigurations);
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            }
            catch (err) {
                /* Cannot read/parse JSON */
            }
        }
        if (configurationOptions === undefined) {
            try {
                // Try to get the configuration from
                // package.json/[config/]doxygen2docusaurus.
                const userPackageJsonPath = path.resolve(process.cwd(), 'package.json');
                const pkgJsonRaw = await fs.readFile(userPackageJsonPath, 'utf8');
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const pkgJson = JSON.parse(pkgJsonRaw);
                const multiConfigurations = pkgJson.config?.tsdoc2docusaurus ?? pkgJson.tsdoc2docusaurus;
                if (multiConfigurations !== undefined) {
                    configurationOptions =
                        this.selectMultiConfiguration(multiConfigurations);
                }
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            }
            catch (err) {
                /* Cannot read/parse JSON */
            }
        }
        if (configurationOptions !== undefined) {
            if (this.debug) {
                console.log(configurationOptions);
            }
            // Override only properties that exist in CliOptions
            const thisProperties = Object.getOwnPropertyNames(this);
            for (const key of thisProperties) {
                const value = configurationOptions[key];
                // console.log(key, value)
                if (value !== undefined) {
                    const thisProperty = this[key];
                    const thisType = typeof thisProperty;
                    const valueType = typeof value;
                    // Only override if types match
                    if (thisType === valueType) {
                        ;
                        this[key] = value;
                    }
                }
            }
        }
        if (this.debug) {
            this.verbose = true;
        }
        if (this.verbose) {
            console.log();
            console.log(this);
        }
        assert(this.apiJsonInputFolderPath.length > 0, 'apiJsonInputFolderPath is required');
        assert(this.docsFolderPath.length > 0, 'docsFolderPath is required');
        assert(this.apiFolderPath.length > 0, 'apiFolderPath is required');
        assert(this.docsBaseUrl.length > 0, 'docsBaseUrl is required');
        // assert(this.apiBaseUrl.length > 0, 'apiBaseUrl is required')
        assert(this.sidebarCategoryFilePath.length > 0, 'sidebarCategoryFilePath is required');
    }
    selectMultiConfiguration(multiConfigurations) {
        let configurationOptions = undefined;
        if (this.id !== 'default') {
            configurationOptions = multiConfigurations[this.id];
            if (configurationOptions !== undefined) {
                configurationOptions.id = this.id;
            }
        }
        else {
            const multiConfig = multiConfigurations;
            configurationOptions =
                'default' in multiConfig
                    ? multiConfig.default
                    : multiConfigurations;
        }
        return configurationOptions;
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=cli-options.js.map