import assert from 'node:assert';
import path from 'node:path';
import * as fs from 'node:fs/promises';
import { pluralise } from './utils.js';
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
    async prepareOutputFolder() {
        const outputFolderPath = this.workspace.outputFolderPath;
        try {
            await fs.access(outputFolderPath);
            console.log(`Removing existing folder ${outputFolderPath}...`);
            await fs.rm(outputFolderPath, { recursive: true, force: true });
        }
        catch (err) {
        }
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
        const title = frontMatter.title.replace(/ typealias$/, ' type alias');
        header.push(`title: ${title}`);
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
        text += '<p class="tsdocGeneratedBy">Generated via ';
        text += '<a href="https://xpack.github.io/tsdoc2docusaurus">';
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
                continue;
            }
            else if (!firstH2 && line.startsWith('## ')) {
                firstH2 = true;
                continue;
            }
            else if (line.startsWith('**Signature:**')) {
                outLines.push('## Signature');
            }
            else if (line.startsWith('**Returns:**')) {
                outLines.push('## Returns');
            }
            else {
                outLines.push(this.patchPermalinks(line, permalinksMapByPath));
            }
        }
        return outLines;
    }
    patchPermalinks(line, permalinksMapByPath) {
        let patchedLine = line;
        const matches = [...line.matchAll(/\]\([^(<>)]*\)/g)];
        if (matches.length > 0) {
            for (const match of matches) {
                const link = match[0];
                const linkPath = link.slice(2, -1);
                if (linkPath.startsWith('./')) {
                    const relativePath = linkPath.slice(2);
                    if (permalinksMapByPath.has(relativePath)) {
                        const permalink = permalinksMapByPath.get(relativePath);
                        assert(permalink !== undefined);
                        patchedLine = patchedLine.replace(link, `](${permalink})`);
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
            const topIndex = viewModel.topIndex;
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
        const entryPointsSet = viewModel.entryPointsSet;
        for (const entryPoint of entryPointsSet) {
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
            for (const [kind, compoundsArray] of entryPoint.componentsMap) {
                const title = pluralise(kind);
                const compoundCategoryLabel = title.toLowerCase().replace(/ /g, '');
                const slug = entryPoint.frontMatterSlug + '/' + compoundCategoryLabel;
                if (options.debug) {
                    console.log(compoundCategoryLabel);
                }
                const frontMatter = {
                    slug,
                    title,
                };
                const lines = [];
                lines.push('<!-- Do not edit this file. It is automatically generated ' +
                    'by tsdoc2docusaurus. -->');
                lines.push('');
                lines.push(`The following ${title.toLowerCase()} are defined:`);
                lines.push('');
                lines.push('<table>');
                lines.push('<thead><tr><th>Class</th><th>Description</th></tr></thead>');
                lines.push('<tbody>');
                for (const compound of compoundsArray) {
                    if (options.debug) {
                        console.log('  ' + compound.sidebarLabel, compound.summary, compound.frontMatterSlug, compound.outputFilePath);
                    }
                    lines.push('<tr><td>');
                    lines.push('');
                    lines.push(`[${compound.sidebarLabel}]` + `(/docs${compound.frontMatterSlug})`);
                    lines.push('');
                    lines.push(`</td><td>`);
                    if (compound.summary) {
                        lines.push('');
                        lines.push(compound.summary);
                        lines.push('');
                    }
                    lines.push(`</td></tr>`);
                }
                lines.push('</tbody></table>');
                const filePath = path.join(outputFolderPath, entryPoint.id, compoundCategoryLabel, 'index.md');
                await this.writeOutputMdFile({
                    filePath,
                    frontMatter,
                    lines,
                    toolVersion,
                });
            }
            for (const [compoundKind, compoundsArray] of entryPoint.componentsMap) {
                for (const compound of compoundsArray) {
                    await this.generateComponentMdFilesRecursively({
                        compound,
                        toolVersion,
                    });
                }
            }
        }
        console.log(this.writtenFilesCount, 'files written');
    }
    async generateComponentMdFilesRecursively({ compound, toolVersion, }) {
        const viewModel = this.workspace.viewModel;
        const options = this.options;
        const inputFolderPath = options.apiMarkdownInputFolderPath;
        const outputFolderPath = options.docsFolderPath + '/' + options.apiFolderPath;
        const lines = await this.readInputFileLines(`${inputFolderPath}/${compound.inputFilePath}`);
        const patchLinesLines = this.patchLines(lines, viewModel.permalinksMapByPath);
        const frontMatter = {
            slug: compound.frontMatterSlug,
            title: compound.frontMatterTitle,
        };
        await this.writeOutputMdFile({
            filePath: `${outputFolderPath}/${compound.outputFilePath}`,
            frontMatter,
            lines: patchLinesLines,
            toolVersion,
        });
        if (compound.componentsMap.size > 0) {
            for (const [componentKind, componentsArray] of compound.componentsMap) {
                for (const component of componentsArray) {
                    await this.generateComponentMdFilesRecursively({
                        compound: component,
                        toolVersion,
                    });
                }
            }
        }
        if (compound.membersMap.size > 0) {
            for (const [memberKind, membersArray] of compound.membersMap) {
                for (const member of membersArray) {
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
    generateSidebarCategory() {
        const viewModel = this.workspace.viewModel;
        const entryPointsSet = this.workspace.viewModel.entryPointsSet;
        const topIndex = viewModel.topIndex;
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
                const compoundCategorySidebarId = entryPoint.sidebarId +
                    '/' +
                    compoundCategoryLabel.toLowerCase().replace(/ /g, '') +
                    '/index';
                const kindCategory = {
                    type: 'category',
                    label: compoundCategoryLabel,
                    link: {
                        type: 'doc',
                        id: compoundCategorySidebarId,
                    },
                    className: 'tsdocEllipsis',
                    collapsed: true,
                    items: [],
                };
                entryPointCategory.items.push(kindCategory);
                for (const compound of compoundsArray) {
                    kindCategory.items.push(this.generateSidebarCategoryRecursively({
                        kind,
                        compound,
                    }));
                }
                for (const [cousinKind, cousinCompoundsArray,] of entryPoint.componentsMap) {
                    if (cousinKind !== kind) {
                        for (const cousinCompound of cousinCompoundsArray) {
                            if (cousinCompound.componentsMap.has(kind)) {
                                const compoundCategory2 = {
                                    type: 'category',
                                    label: cousinCompound.sidebarLabel,
                                    link: {
                                        type: 'doc',
                                        id: cousinCompound.sidebarId,
                                    },
                                    className: 'tsdocEllipsis',
                                    collapsed: true,
                                    items: [],
                                };
                                if (cousinCompound.componentsMap.has(kind)) {
                                    for (const child of cousinCompound.componentsMap.get(kind) ??
                                        []) {
                                        compoundCategory2.items.push(this.generateSidebarCategoryRecursively({
                                            kind,
                                            compound: child,
                                        }));
                                    }
                                }
                                kindCategory.items.push(compoundCategory2);
                            }
                        }
                    }
                }
            }
        }
        return sidebarTopCategory;
    }
    generateSidebarCategoryRecursively({ kind, compound, }) {
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
        if (compound.componentsMap.has(kind)) {
            for (const child of compound.componentsMap.get(kind) ?? []) {
                compoundCategory.items.push(this.generateSidebarCategoryRecursively({
                    kind,
                    compound: child,
                }));
            }
        }
        if (compound.membersMap.size > 0) {
            for (const [memberKind, membersArray] of compound.membersMap) {
                for (const member of membersArray) {
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
        return compoundCategory;
    }
    generateNavbarItem() {
        const viewModel = this.workspace.viewModel;
        const options = this.options;
        const items = [];
        const entryPointsSet = viewModel.entryPointsSet;
        if (entryPointsSet.size > 1) {
            for (const entryPoint of entryPointsSet) {
                const url = `/${options.docsBaseUrl}${entryPoint.frontMatterSlug}`;
                const navbarItem = {
                    label: entryPoint.sidebarLabel,
                    to: url,
                };
                items.push(navbarItem);
            }
        }
        else {
            const entryPoint = [...entryPointsSet][0];
            for (const [kind, compoundsArray] of entryPoint.componentsMap) {
                const compoundCategoryLabel = pluralise(kind);
                const url = `/${options.docsBaseUrl}/${options.apiBaseUrl}/${entryPoint.id}/` +
                    compoundCategoryLabel.toLowerCase().replace(/ /g, '');
                const navbarItem = {
                    label: compoundCategoryLabel,
                    to: url,
                };
                items.push(navbarItem);
            }
        }
        const navbarItem = {
            label: options.navbarLabel,
            position: options.navbarPosition,
            to: `/${options.docsBaseUrl}/${options.apiBaseUrl}`,
            items,
        };
        return navbarItem;
    }
    async writeSidebarFile(sidebarCategory) {
        const sidebarFilePath = this.options.sidebarCategoryFilePath;
        console.log(`Writing sidebar file ${sidebarFilePath}...`);
        const sidebarJson = JSON.stringify(sidebarCategory, null, 2);
        await fs.writeFile(sidebarFilePath, sidebarJson);
    }
    async writeNavbarFile(navbarItem) {
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
//# sourceMappingURL=generator.js.map