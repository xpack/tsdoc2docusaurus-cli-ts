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
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ViewModel } from './view-model/view-model.js';
// ----------------------------------------------------------------------------
export class Workspace {
    // The tsdoc2docusaurus project path.
    projectPath;
    dataModel;
    viewModel;
    // From the project docusaurus.config.ts or defaults.
    options;
    // Like `/micro-os-plus/docs/api/`.
    absoluteBaseUrl;
    // Like `/micro-os-plus/docs/api/`.
    pageBaseUrl;
    // Like `/api/`.
    slugBaseUrl;
    // Like `/docs/api/`.
    menuBaseUrl;
    // Like `docs/api/`.
    outputFolderPath;
    // like `api/`.
    sidebarBaseId;
    constructor({ dataModel, options, }) {
        // Like .../tsdoc2docusaurus/dist/src/docusaurus/generator
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        // tsdoc2docusaurus
        this.projectPath = path.dirname(path.dirname(__dirname));
        // console.log(__dirname, this.projectPath)
        this.options = options;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.dataModel = dataModel;
        const docsFolderPath = this.options.docsFolderPath
            .replace(/^[/]/, '')
            .replace(/[/]$/, '');
        const apiFolderPath = this.options.apiFolderPath
            .replace(/^[/]/, '')
            .replace(/[/]$/, '');
        this.outputFolderPath = `${docsFolderPath}/${apiFolderPath}/`;
        this.sidebarBaseId = `${apiFolderPath}/`;
        const docsBaseUrl = this.options.docsBaseUrl
            .replace(/^[/]/, '')
            .replace(/[/]$/, '');
        let apiBaseUrl = this.options.apiBaseUrl
            .replace(/^[/]/, '')
            .replace(/[/]$/, '');
        if (apiBaseUrl.length > 0) {
            apiBaseUrl += '/';
        }
        this.absoluteBaseUrl = `${this.options.baseUrl}${docsBaseUrl}/${apiBaseUrl}`;
        this.pageBaseUrl = `${this.options.baseUrl}${docsBaseUrl}/${apiBaseUrl}`;
        this.slugBaseUrl = `/${apiBaseUrl}`;
        this.menuBaseUrl = `/${docsBaseUrl}/${apiBaseUrl}`;
        this.viewModel = new ViewModel({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            dataModel: this.dataModel,
            options: this.options,
        });
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=workspace.js.map