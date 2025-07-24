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
import fs from 'node:fs/promises';
import path from 'path';
import { inputFolderPath, outputFolderPath, sidebarFilePath, } from './view-model/tsdoc2docusaurus.js';
// ----------------------------------------------------------------------------
async function readInputFileLines(filePath) {
    const inputData = await fs.readFile(filePath, 'utf8');
    return inputData.split('\n').map((line) => line.trimEnd());
}
async function writeOutputFile(filePath, frontMatter, lines) {
    const header = [
        '---',
        // '',
        // '# DO NOT EDIT!',
        // '# Automatically generated via tsdoc2docusaurus by API Documenter.',
        // '',
        `slug: ${frontMatter.slug}`,
        `title: ${frontMatter.title}`,
        'custom_edit_url: null',
        '---',
        '',
        '<div class="tsdocPage">',
        '',
    ];
    const footer = ['</div>'];
    const outputContent = header.concat(lines).concat(footer).join('\n');
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, outputContent, 'utf8');
    console.log(`Writing ${filePath}...`);
}
function patchLines(lines, permalinksMapByPath) {
    const outLines = [];
    let firstH2 = false;
    for (const line of lines) {
        if (/^\[Home\]\(\.\/index\.md\)/.exec(line)) {
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
            outLines.push(patchPermalinks(line, permalinksMapByPath));
        }
    }
    return outLines;
}
function patchPermalinks(line, permalinksMapByPath) {
    let patchedLine = line;
    const matches = [...line.matchAll(/\]\([^\(<>\)]*\)/g)];
    if (matches.length > 0) {
        // console.log(matches)
        for (const match of matches) {
            const link = match[0];
            const linkPath = link.slice(2, -1); // Remove the leading `](` and trailing `)`
            if (linkPath.startsWith('./')) {
                // Relative link, patch it
                const relativePath = linkPath.slice(2);
                if (permalinksMapByPath.has(relativePath)) {
                    const permalink = permalinksMapByPath.get(relativePath);
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
export async function generateMdFiles(apiViewModel) {
    const { entryPointsSet } = apiViewModel;
    {
        const { topIndex } = apiViewModel;
        const lines = await readInputFileLines(`${inputFolderPath}/${topIndex.inputFilePath}`);
        const patchLinesLines = patchLines(lines, apiViewModel.permalinksMapByPath);
        const frontMatter = {
            slug: topIndex.frontMatterSlug,
            title: topIndex.frontMatterTitle,
        };
        await writeOutputFile(`${outputFolderPath}/${topIndex.outputFilePath}`, frontMatter, patchLinesLines);
    }
    // --------------------------------------------------------------------------
    for (const entryPoint of entryPointsSet) {
        // console.log(entryPoint)
        const lines = await readInputFileLines(`${inputFolderPath}/${entryPoint.inputFilePath}`);
        const patchLinesLines = patchLines(lines, apiViewModel.permalinksMapByPath);
        const frontMatter = {
            slug: entryPoint.frontMatterSlug,
            title: entryPoint.frontMatterTitle,
        };
        await writeOutputFile(`${outputFolderPath}/${entryPoint.outputFilePath}`, frontMatter, patchLinesLines);
        // ------------------------------------------------------------------------
        for (const [compoundKind, compoundsArray] of entryPoint.compoundsMap) {
            const compoundCategoryLabel = pluralise(compoundKind);
            // console.log(`  ${compoundCategoryLabel}`)
            for (const compound of compoundsArray) {
                // console.log(`    ${compound.label}`)
                const lines = await readInputFileLines(`${inputFolderPath}/${compound.inputFilePath}`);
                const patchLinesLines = patchLines(lines, apiViewModel.permalinksMapByPath);
                const frontMatter = {
                    slug: compound.frontMatterSlug,
                    title: compound.frontMatterTitle,
                };
                // TODO: Insert members into compound (future improvement).
                await writeOutputFile(`${outputFolderPath}/${compound.outputFilePath}`, frontMatter, patchLinesLines);
                // --------------------------------------------------------------------
                if (compound.membersMap.size > 0) {
                    for (const [memberKind, membersArray] of compound.membersMap) {
                        for (const member of membersArray) {
                            if (member.isHidden) {
                                continue;
                            }
                            // console.log(`      ${member.label} ${member.name} ${member.id}`)
                            const lines = await readInputFileLines(`${inputFolderPath}/${member.inputFilePath}`);
                            const patchLinesLines = patchLines(lines, apiViewModel.permalinksMapByPath);
                            const frontMatter = {
                                slug: member.frontMatterSlug,
                                title: member.frontMatterTitle,
                            };
                            await writeOutputFile(`${outputFolderPath}/${member.outputFilePath}`, frontMatter, patchLinesLines);
                        }
                    }
                }
            }
        }
    }
    return 0;
}
// ----------------------------------------------------------------------------
function generateSidebarCategory(apiViewModel) {
    const { entryPointsSet } = apiViewModel;
    const { topIndex } = apiViewModel;
    const sidebarTopCategory = {
        type: 'category',
        label: topIndex.sidebarLabel,
        link: {
            type: 'doc',
            id: topIndex.sidebarId,
        },
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
            collapsed: false,
            items: [],
        };
        sidebarTopCategory.items.push(entryPointCategory);
        for (const [kind, compoundsArray] of entryPoint.compoundsMap) {
            const compoundCategoryLabel = pluralise(kind);
            const kindCategory = {
                type: 'category',
                label: compoundCategoryLabel,
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
                    collapsed: true,
                    items: [],
                };
                kindCategory.items.push(compoundCategory);
                if (compound.membersMap.size > 0) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    for (const [memberKind, membersArray] of compound.membersMap) {
                        for (const member of membersArray) {
                            // Explicitly handle nullable boolean for isHidden
                            if (member.isHidden === true) {
                                // console.warn(
                                //   `Skipping member without name in ${compoundLabel}: ` +
                                //   `${member.data.canonicalReference}`
                                // );
                                continue;
                            }
                            const memberDoc = {
                                type: 'doc',
                                id: member.sidebarId,
                                label: member.sidebarLabel,
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
// ----------------------------------------------------------------------------
export function pluralise(name) {
    const plurals = {
        Class: 'Classes',
        Interface: 'Interfaces',
        Function: 'Functions',
        Variable: 'Variables',
        'Type alias': 'Type aliases',
        Namespace: 'Namespaces',
        Enum: 'Enums',
        Method: 'Methods',
        Property: 'Properties',
    };
    if (Object.prototype.hasOwnProperty.call(plurals, name)) {
        return plurals[name];
    }
    console.warn(`No plural for ${name}, using default.`);
    return name + 's?';
}
// ----------------------------------------------------------------------------
export async function generateSidebar(apiViewModel) {
    const sidebar = generateSidebarCategory(apiViewModel);
    // console.log(util.inspect(sidebar, { compact: false, depth: 999 }));
    // Write the sidebar to file.
    try {
        console.log(`Writing sidebar file ${sidebarFilePath}`);
        const sidebarJson = JSON.stringify(sidebar, null, 2);
        await fs.writeFile(sidebarFilePath, sidebarJson);
    }
    catch (err) {
        if (err instanceof Error) {
            console.error(`Could not write sidebar file ${sidebarFilePath}: ${err.message}`);
        }
        else {
            console.error(`Could not write sidebar file ${sidebarFilePath}: Unknown error`);
        }
        return 1;
    }
    return 0;
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=pluralise.js.map