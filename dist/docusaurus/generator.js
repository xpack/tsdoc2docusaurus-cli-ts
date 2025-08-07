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
import path from 'node:path';
import * as fs from 'node:fs/promises';
import { pluralise } from './utils.js';
// ----------------------------------------------------------------------------
export class DocusaurusGenerator {
    workspace;
    options;
    writtenFilesCount = 0;
    constructor(workspace) {
        this.workspace = workspace;
        this.options = workspace.options;
    }
    async run() {
        console.log();
        await this.prepareOutputFolder();
        await this.generateMdFiles();
        const sidebarCategory = this.generateSidebarCategory();
        await this.writeSidebarFile(sidebarCategory);
        if (this.options.navbarFilePath.trim().length > 0) {
            const navbarItem = this.generateNavbarItem();
            await this.writeNavbarFile(navbarItem);
        }
        await this.copyCssFile();
        return 0;
    }
    // https://nodejs.org/en/learn/manipulating-files/working-with-folders-in-nodejs
    async prepareOutputFolder() {
        const { outputFolderPath } = this.workspace;
        try {
            await fs.access(outputFolderPath);
            // Remove the folder if it exist.
            console.log(`Removing existing folder ${outputFolderPath}...`);
            await fs.rm(outputFolderPath, { recursive: true, force: true });
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        }
        catch (err) {
            // The folder does not exist, nothing to remove.
        }
        // Create the folder as empty.
        await fs.mkdir(outputFolderPath, { recursive: true });
    }
    async readInputFileLines(filePath) {
        const inputData = await fs.readFile(filePath, 'utf8');
        return inputData.split('\n').map((line) => line.trimEnd());
    }
    async writeOutputMdFile({ filePath, frontMatter, lines, toolVersion, }) {
        const header = [];
        header.push('---');
        header.push('');
        header.push('# DO NOT EDIT!');
        header.push('# Automatically generated via tsdoc2docusaurus by API Documenter.');
        header.push('');
        header.push(`slug: ${frontMatter.slug}`);
        header.push(`title: ${frontMatter.title}`);
        header.push('custom_edit_url: null');
        header.push('---');
        header.push('');
        header.push('<div class="tsdocPage">');
        header.push('');
        header.push('');
        const footer = [];
        footer.push('<hr/>');
        footer.push('');
        let text = '';
        text += '<p class="doxyGeneratedBy">Generated via ';
        text += '<a href="https://xpack.github.io/doxygen2docusaurus">';
        text += 'tsdoc2docusaurus</a> ';
        assert(this.workspace.dataModel.projectVersion !== undefined);
        text += this.workspace.dataModel.projectVersion;
        text += ' by ';
        text += '<a href="https://api-extractor.com">API Extractor/Documenter</a>';
        if (toolVersion !== undefined && toolVersion.length > 0) {
            text += ' ';
            text += toolVersion;
        }
        text += '.';
        text += '</p>';
        footer.push(text);
        footer.push('');
        footer.push('</div>');
        footer.push('');
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        if (this.options.verbose) {
            console.log(`Writing ${filePath}...`);
        }
        const fileHandle = await fs.open(filePath, 'ax');
        await fileHandle.write(header.join('\n'));
        await fileHandle.write(lines.join('\n'));
        await fileHandle.write(footer.join('\n'));
        await fileHandle.close();
        this.writtenFilesCount += 1;
    }
    patchLines(lines, permalinksMapByPath) {
        const outLines = [];
        let firstH2 = false;
        for (const line of lines) {
            if (line.startsWith('[Home](./index.md)')) {
                continue; // Skip the home link
            }
            else if (!firstH2 && line.startsWith('## ')) {
                firstH2 = true;
                continue;
            }
            else if (line.startsWith('**Signature:**')) {
                // Convert the signature line to a H2
                outLines.push('## Signature');
            }
            else if (line.startsWith('**Returns:**')) {
                // Convert the returns line to a H2
                outLines.push('## Returns');
            }
            else {
                // Patch links and other formatting
                outLines.push(this.patchPermalinks(line, permalinksMapByPath));
            }
        }
        return outLines;
    }
    patchPermalinks(line, permalinksMapByPath) {
        let patchedLine = line;
        const matches = [...line.matchAll(/\]\([^(<>)]*\)/g)];
        if (matches.length > 0) {
            // console.log(matches)
            for (const match of matches) {
                const link = match[0];
                // Remove the leading `](` and trailing `)`
                const linkPath = link.slice(2, -1);
                if (linkPath.startsWith('./')) {
                    // Relative link, patch it
                    const relativePath = linkPath.slice(2);
                    if (permalinksMapByPath.has(relativePath)) {
                        const permalink = permalinksMapByPath.get(relativePath);
                        assert(permalink !== undefined);
                        // console.log(relativePath, '->', permalink)
                        patchedLine = patchedLine.replace(link, `](${permalink})`);
                        // console.log(patchedLine)
                    }
                    else {
                        console.warn(`No permalink for ${relativePath}, skipping patch.`);
                    }
                }
            }
        }
        return patchedLine;
    }
    async generateMdFiles() {
        const viewModel = this.workspace.viewModel;
        const options = this.options;
        if (!options.verbose) {
            console.log('Writing .md files...');
        }
        const inputFolderPath = options.apiMarkdownInputFolderPath;
        const outputFolderPath = options.docsFolderPath + '/' + options.apiFolderPath;
        {
            const { topIndex } = viewModel;
            const lines = await this.readInputFileLines(`${inputFolderPath}/${topIndex.inputFilePath}`);
            const patchLinesLines = this.patchLines(lines, viewModel.permalinksMapByPath);
            const frontMatter = {
                slug: topIndex.frontMatterSlug,
                title: topIndex.frontMatterTitle,
            };
            await this.writeOutputMdFile({
                filePath: `${outputFolderPath}/${topIndex.outputFilePath}`,
                frontMatter,
                lines: patchLinesLines,
            });
        }
        // ------------------------------------------------------------------------
        const { entryPointsSet } = viewModel;
        for (const entryPoint of entryPointsSet) {
            // console.log(entryPoint)
            const lines = await this.readInputFileLines(`${inputFolderPath}/${entryPoint.inputFilePath}`);
            const patchLinesLines = this.patchLines(lines, viewModel.permalinksMapByPath);
            const frontMatter = {
                slug: entryPoint.frontMatterSlug,
                title: entryPoint.frontMatterTitle,
            };
            const toolVersion = entryPoint.toolVersion;
            await this.writeOutputMdFile({
                filePath: `${outputFolderPath}/${entryPoint.outputFilePath}`,
                frontMatter,
                lines: patchLinesLines,
                toolVersion,
            });
            // ----------------------------------------------------------------------
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            for (const [compoundKind, compoundsArray] of entryPoint.componentsMap) {
                // console.log(`  ${compoundCategoryLabel}`)
                for (const compound of compoundsArray) {
                    // console.log(`    ${compound.label}`)
                    const lines = await this.readInputFileLines(`${inputFolderPath}/${compound.inputFilePath}`);
                    const patchLinesLines = this.patchLines(lines, viewModel.permalinksMapByPath);
                    const frontMatter = {
                        slug: compound.frontMatterSlug,
                        title: compound.frontMatterTitle,
                    };
                    // TODO: Insert members into compound (future improvement).
                    await this.writeOutputMdFile({
                        filePath: `${outputFolderPath}/${compound.outputFilePath}`,
                        frontMatter,
                        lines: patchLinesLines,
                        toolVersion,
                    });
                    // ------------------------------------------------------------------
                    if (compound.membersMap.size > 0) {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        for (const [memberKind, membersArray] of compound.membersMap) {
                            for (const member of membersArray) {
                                // if (member.isHidden === true) {
                                //   continue
                                // }
                                // console.log(
                                //   `      ${member.label} ${member.name} ${member.id}`
                                // )
                                const lines = await this.readInputFileLines(`${inputFolderPath}/${member.inputFilePath}`);
                                const patchLinesLines = this.patchLines(lines, viewModel.permalinksMapByPath);
                                const frontMatter = {
                                    slug: member.frontMatterSlug,
                                    title: member.frontMatterTitle,
                                };
                                await this.writeOutputMdFile({
                                    filePath: `${outputFolderPath}/${member.outputFilePath}`,
                                    frontMatter,
                                    lines: patchLinesLines,
                                    toolVersion,
                                });
                            }
                        }
                    }
                }
            }
        }
        console.log(this.writtenFilesCount, 'files written');
    }
    // --------------------------------------------------------------------------
    generateSidebarCategory() {
        const viewModel = this.workspace.viewModel;
        // const options = this.options
        const { entryPointsSet } = this.workspace.viewModel;
        const { topIndex } = viewModel;
        const sidebarTopCategory = {
            type: 'category',
            label: topIndex.sidebarLabel,
            link: {
                type: 'doc',
                id: topIndex.sidebarId,
            },
            className: 'tsdocEllipsis',
            collapsed: false,
            items: [],
        };
        for (const entryPoint of entryPointsSet) {
            const entryPointCategory = {
                type: 'category',
                label: entryPoint.sidebarLabel,
                link: {
                    type: 'doc',
                    id: entryPoint.sidebarId,
                },
                className: 'tsdocEllipsis',
                collapsed: false,
                items: [],
            };
            sidebarTopCategory.items.push(entryPointCategory);
            for (const [kind, compoundsArray] of entryPoint.componentsMap) {
                const compoundCategoryLabel = pluralise(kind);
                const kindCategory = {
                    type: 'category',
                    label: compoundCategoryLabel,
                    className: 'tsdocEllipsis',
                    collapsed: true,
                    items: [],
                };
                entryPointCategory.items.push(kindCategory);
                for (const compound of compoundsArray) {
                    const compoundCategory = {
                        type: 'category',
                        label: compound.sidebarLabel,
                        link: {
                            type: 'doc',
                            id: compound.sidebarId,
                        },
                        className: 'tsdocEllipsis',
                        collapsed: true,
                        items: [],
                    };
                    kindCategory.items.push(compoundCategory);
                    if (compound.membersMap.size > 0) {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        for (const [memberKind, membersArray] of compound.membersMap) {
                            for (const member of membersArray) {
                                // Explicitly handle nullable boolean for isHidden
                                // if (member.isHidden === true) {
                                // console.warn(
                                //   `Skipping member without name in ${compoundLabel}: ` +
                                //   `${member.data.canonicalReference}`
                                // );
                                //  continue
                                // }
                                const memberDoc = {
                                    type: 'doc',
                                    label: member.sidebarLabel,
                                    className: 'tsdocEllipsis',
                                    id: member.sidebarId,
                                };
                                compoundCategory.items.push(memberDoc);
                            }
                        }
                    }
                }
            }
        }
        return sidebarTopCategory;
    }
    generateNavbarItem() {
        const options = this.options;
        const navbarItem = {
            label: options.navbarLabel,
            position: options.navbarPosition,
            to: `/${options.docsBaseUrl}/${options.apiBaseUrl}`,
        };
        return navbarItem;
    }
    // --------------------------------------------------------------------------
    async writeSidebarFile(sidebarCategory) {
        // console.log(util.inspect(sidebar, { compact: false, depth: 999 }));
        // Write the sidebar to file.
        const sidebarFilePath = this.options.sidebarCategoryFilePath;
        console.log(`Writing sidebar file ${sidebarFilePath}...`);
        const sidebarJson = JSON.stringify(sidebarCategory, null, 2);
        await fs.writeFile(sidebarFilePath, sidebarJson);
    }
    async writeNavbarFile(navbarItem) {
        // console.log(util.inspect(navbarItem, { compact: false, depth: 999 }));
        // Write the sidebar to file.
        const navbarFilePath = this.options.navbarFilePath;
        console.log(`Writing navbar file ${navbarFilePath}...`);
        const navbarJson = JSON.stringify(navbarItem, null, 2);
        await fs.writeFile(navbarFilePath, navbarJson);
    }
    async copyCssFile() {
        const fromFilePath = path.join(this.workspace.projectPath, 'template', 'css', 'custom.css');
        const toFilePath = this.options.customCssFilePath;
        await fs.mkdir(path.dirname(toFilePath), { recursive: true });
        console.log(`Copying css file ${toFilePath}...`);
        await fs.copyFile(fromFilePath, toFilePath);
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=generator.js.map