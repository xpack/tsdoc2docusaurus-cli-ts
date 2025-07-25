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
import { pluralise } from '../utils.js';
// ----------------------------------------------------------------------------
export class ViewModel {
    topIndex;
    entryPointsSet;
    permalinksMapByPath;
    constructor({ dataModel, options, }) {
        const entryPointsSet = new Set();
        // Key paths do not start with '/', permalinks are absolute
        // (start with baseUrl).
        const permalinksMapByPath = new Map();
        // eslint-disable-next-line max-len
        const outputBaseUrl = `${options.baseUrl}${options.docsBaseUrl}/${options.apiBaseUrl}`;
        const topIndex = {
            kind: 'TopIndex',
            inputFilePath: 'index.md',
            permalink: outputBaseUrl,
            frontMatterSlug: `/${options.apiBaseUrl}`,
            frontMatterTitle: 'API Reference',
            sidebarLabel: options.sidebarCategoryLabel,
            sidebarId: `${options.apiFolderPath}/index`,
            outputFilePath: 'index.md',
        };
        permalinksMapByPath.set(topIndex.inputFilePath, topIndex.permalink);
        if (dataModel.members !== undefined) {
            for (const entryPointDataModel of dataModel.members) {
                if (options.debug) {
                    console.log(entryPointDataModel.kind, entryPointDataModel.canonicalReference);
                }
                const entryPointKind = entryPointDataModel.kind;
                const entryPointLabel = entryPointDataModel.canonicalReference.replace(/[!]$/, '');
                const entryPointId = entryPointLabel.replace(/^.*\//, '').toLowerCase();
                const inputFilePath = `${entryPointId}.md`;
                const permalink = `${outputBaseUrl}/${entryPointId}`;
                permalinksMapByPath.set(inputFilePath, permalink);
                const frontMatterSlug = `/${options.apiBaseUrl}/${entryPointId}`;
                const frontMatterTitle = `${entryPointId} package`;
                const sidebarLabel = entryPointLabel;
                const sidebarId = `${options.apiFolderPath}/${entryPointId}`;
                const outputFilePath = `${entryPointId}.md`;
                const entryPoint = {
                    kind: entryPointKind,
                    inputFilePath,
                    permalink,
                    frontMatterSlug,
                    frontMatterTitle,
                    sidebarLabel,
                    sidebarId,
                    outputFilePath,
                    // Map of array of compounds, by kind (Class, Interface, ...)
                    compoundsMap: new Map(),
                    data: entryPointDataModel,
                };
                entryPointsSet.add(entryPoint);
                if (entryPointDataModel.members !== undefined) {
                    for (const compoundDataModel of entryPointDataModel.members) {
                        if (options.debug) {
                            console.log(compoundDataModel.kind, compoundDataModel.name, compoundDataModel.canonicalReference);
                        }
                        const compoundKind = compoundDataModel.kind;
                        const compoundLabel = compoundDataModel.name ?? '???';
                        const compoundId = (compoundDataModel.name ?? '???').toLowerCase();
                        const compoundCategoryId = pluralise(compoundKind).toLowerCase();
                        const inputFilePath = `${entryPointId}.${compoundId}.md`;
                        const permalink = `${outputBaseUrl}/${entryPointId}/` +
                            `${compoundCategoryId}/${compoundId}`;
                        permalinksMapByPath.set(inputFilePath, permalink);
                        // eslint-disable-next-line max-len
                        const frontMatterSlug = `/${options.apiBaseUrl}/${entryPointId}/${compoundCategoryId}/${compoundId}`;
                        let compoundTitle = compoundDataModel.name ?? '???';
                        if (compoundKind === 'Function') {
                            compoundTitle += '()';
                        }
                        const frontMatterTitle = compoundTitle + ' ' + compoundKind.toLowerCase();
                        const sidebarLabel = compoundTitle;
                        const sidebarId = `${options.apiFolderPath}/${entryPointId}/` +
                            `${compoundCategoryId}/${compoundId}`;
                        // eslint-disable-next-line max-len
                        const outputFilePath = `${entryPointId}/${compoundCategoryId}/${compoundId}.md`;
                        const compound = {
                            kind: compoundKind,
                            inputFilePath,
                            permalink,
                            frontMatterSlug,
                            frontMatterTitle,
                            sidebarLabel,
                            sidebarId,
                            outputFilePath,
                            // Map of array of members, by kind (Constructor, Property, ...)
                            membersMap: new Map(),
                            data: compoundDataModel,
                        };
                        let compoundsArray = entryPoint.compoundsMap.get(compoundDataModel.kind);
                        if (compoundsArray === undefined) {
                            compoundsArray = [];
                            entryPoint.compoundsMap.set(compound.kind, compoundsArray);
                        }
                        compoundsArray.push(compound);
                        if (compoundDataModel.members !== undefined) {
                            for (const memberDataModel of compoundDataModel.members) {
                                if (options.debug) {
                                    console.log('  ', memberDataModel.kind, memberDataModel.name, memberDataModel.canonicalReference);
                                }
                                const memberKind = memberDataModel.kind;
                                let memberTitle = memberDataModel.name ?? '???';
                                let originalMemberId = memberDataModel.name ?? '???';
                                let memberId = memberDataModel.name;
                                if (memberKind === 'Constructor') {
                                    memberId = 'constructor';
                                    memberTitle = '(constructor)';
                                    originalMemberId = '_constructor_';
                                }
                                else {
                                    if (memberDataModel.name === undefined ||
                                        memberDataModel.name.length === 0) {
                                        continue;
                                    }
                                    originalMemberId = memberDataModel.name
                                        .replaceAll(/[^a-zA-Z0-9]/g, '_')
                                        .toLowerCase();
                                    memberId = originalMemberId;
                                }
                                // eslint-disable-next-line max-len
                                const inputFilePath = `${entryPointId}.${compoundId}.${originalMemberId}.md`;
                                const permalink = `${outputBaseUrl}/${entryPointId}/` +
                                    `${compoundCategoryId}/${compoundId}/${memberId}`;
                                if (memberKind !== 'CallSignature') {
                                    // if(originalMemberId === undefined) {
                                    //   console.log(memberDataModel)
                                    // }
                                    permalinksMapByPath.set(inputFilePath, permalink);
                                }
                                const frontMatterSlug = `/${options.apiBaseUrl}/${entryPointId}/` +
                                    `${compoundCategoryId}/${compoundId}/${memberId}`;
                                if (memberKind === 'Method') {
                                    memberTitle += '()';
                                }
                                let titleKind = memberKind;
                                if (titleKind === 'PropertySignature') {
                                    titleKind = 'Property';
                                }
                                let escapedMemberId = memberId;
                                // Docusaurus ignores files that start with an underscore.
                                // Surround with $ if the original name contains
                                // non-alphanumeric characters
                                if (originalMemberId.startsWith('_')) {
                                    escapedMemberId = `$${escapedMemberId}$`;
                                }
                                const frontMatterTitle = memberKind !== 'Constructor'
                                    ? `${compoundLabel}.${memberTitle} ` +
                                        titleKind.toLowerCase()
                                    : `${compoundLabel}.${memberTitle}`;
                                const sidebarLabel = memberTitle;
                                const sidebarId = `${options.apiFolderPath}/${entryPointId}/` +
                                    `${compoundCategoryId}/${compoundId}/${escapedMemberId}`;
                                const outputFilePath = `${entryPointId}/${compoundCategoryId}/${compoundId}/` +
                                    `${escapedMemberId}.md`;
                                const member = {
                                    kind: memberKind,
                                    inputFilePath,
                                    permalink,
                                    frontMatterSlug,
                                    frontMatterTitle,
                                    sidebarLabel,
                                    sidebarId,
                                    outputFilePath,
                                    data: memberDataModel,
                                };
                                // if (memberId === undefined) {
                                //   member.isHidden = true
                                // }
                                let membersArray = compound.membersMap.get(member.kind);
                                if (membersArray === undefined) {
                                    membersArray = [];
                                    compound.membersMap.set(member.kind, membersArray);
                                }
                                membersArray.push(member);
                            }
                        }
                    }
                }
            }
        }
        if (options.debug) {
            for (const [keyPath, permalink] of permalinksMapByPath) {
                console.log(keyPath, '=>', permalink);
            }
        }
        this.topIndex = topIndex;
        this.entryPointsSet = entryPointsSet;
        this.permalinksMapByPath = permalinksMapByPath;
    }
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=view-model.js.map