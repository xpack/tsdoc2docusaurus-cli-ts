import assert from 'node:assert';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
export class CliOptions {
    apiJsonInputFolderPath = '../api-extractor';
    apiMarkdownInputFolderPath = '../api-extractor/markdown';
    docsFolderPath = 'docs';
    apiFolderPath;
    baseUrl = '/';
    docsBaseUrl = 'docs';
    apiBaseUrl;
    sidebarCategoryFilePath = 'sidebar-category-tsdoc.json';
    sidebarCategoryLabel = 'API Reference (TSDoc)';
    navbarFilePath;
    navbarLabel = 'Reference';
    navbarPosition = 'left';
    customCssFilePath = 'src/css/custom-tsdoc2docusaurus.css';
    verbose = false;
    debug = false;
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
            const multiConfigurations = JSON.parse(pkgJsonRaw);
            configurationOptions = this.selectMultiConfiguration(multiConfigurations);
        }
        catch (err) {
        }
        if (configurationOptions === undefined) {
            try {
                const userPackageJsonPath = path.resolve(process.cwd(), 'tsdoc2docusaurus.json');
                const pkgJsonRaw = await fs.readFile(userPackageJsonPath, 'utf8');
                const multiConfigurations = JSON.parse(pkgJsonRaw);
                configurationOptions =
                    this.selectMultiConfiguration(multiConfigurations);
            }
            catch (err) {
            }
        }
        if (configurationOptions === undefined) {
            try {
                const userPackageJsonPath = path.resolve(process.cwd(), 'package.json');
                const pkgJsonRaw = await fs.readFile(userPackageJsonPath, 'utf8');
                const pkgJson = JSON.parse(pkgJsonRaw);
                const multiConfigurations = pkgJson.config?.tsdoc2docusaurus ?? pkgJson.tsdoc2docusaurus;
                if (multiConfigurations !== undefined) {
                    configurationOptions =
                        this.selectMultiConfiguration(multiConfigurations);
                }
            }
            catch (err) {
            }
        }
        if (configurationOptions !== undefined) {
            if (this.debug) {
                console.log(configurationOptions);
            }
            const thisProperties = Object.getOwnPropertyNames(this);
            for (const key of thisProperties) {
                const value = configurationOptions[key];
                if (value !== undefined) {
                    const thisProperty = this[key];
                    const thisType = typeof thisProperty;
                    const valueType = typeof value;
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
//# sourceMappingURL=cli-options.js.map