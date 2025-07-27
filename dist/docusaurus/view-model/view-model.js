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
        // for (const apiPackage of dataModel.apiModel.packages) {
        //   console.log(apiPackage.kind, apiPackage.displayName,
        //     apiPackage.name, apiPackage.canonicalReference.toString())
        //   for (const apiEntryPoint of apiPackage.entryPoints) {
        //     console.log('  ', apiEntryPoint.kind, apiEntryPoint.displayName,
        //       apiEntryPoint.name, apiEntryPoint.canonicalReference.toString())
        //     for (const apiComponent of apiEntryPoint.members) {
        //       console.log('    ', apiComponent.kind, apiComponent.displayName,
        //         apiComponent.canonicalReference.toString())
        //       // const x = apiComponent.canonicalReference
        //       for (const apiMember of apiComponent.members) {
        //         console.log('      ', apiMember.kind, apiMember.displayName,
        //           apiMember.canonicalReference.toString())
        //         // const y = apiMember.canonicalReference
        //         // console.log(y.toString())
        //       }
        //     }
        //   }
        // }
        // console.log('---')
        // if (0 === 1) {
        //   process.exit(0)
        // }
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
        if (dataModel.json?.members !== undefined) {
            for (const entryPointDataModel of dataModel.json.members) {
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
                    // Map of array of components, by kind (Class, Interface, ...)
                    componentsMap: new Map(),
                    data: entryPointDataModel,
                };
                entryPointsSet.add(entryPoint);
                if (entryPointDataModel.members !== undefined) {
                    for (const componentDataModel of entryPointDataModel.members) {
                        if (options.debug) {
                            console.log(componentDataModel.kind, componentDataModel.name, componentDataModel.canonicalReference);
                        }
                        const componentKind = componentDataModel.kind;
                        const componentLabel = componentDataModel.name ?? '???';
                        const componentId = (componentDataModel.name ?? '???').toLowerCase();
                        const componentCategoryId = pluralise(componentKind).toLowerCase();
                        const inputFilePath = `${entryPointId}.${componentId}.md`;
                        const permalink = `${outputBaseUrl}/${entryPointId}/` +
                            `${componentCategoryId}/${componentId}`;
                        permalinksMapByPath.set(inputFilePath, permalink);
                        // eslint-disable-next-line max-len
                        const frontMatterSlug = `/${options.apiBaseUrl}/${entryPointId}/${componentCategoryId}/${componentId}`;
                        let componentTitle = componentDataModel.name ?? '???';
                        if (componentKind === 'Function') {
                            componentTitle += '()';
                        }
                        const frontMatterTitle = componentTitle + ' ' + componentKind.toLowerCase();
                        const sidebarLabel = componentTitle;
                        const sidebarId = `${options.apiFolderPath}/${entryPointId}/` +
                            `${componentCategoryId}/${componentId}`;
                        // eslint-disable-next-line max-len
                        const outputFilePath = `${entryPointId}/${componentCategoryId}/${componentId}.md`;
                        const component = {
                            kind: componentKind,
                            inputFilePath,
                            permalink,
                            frontMatterSlug,
                            frontMatterTitle,
                            sidebarLabel,
                            sidebarId,
                            outputFilePath,
                            // Map of array of members, by kind (Constructor, Property, ...)
                            membersMap: new Map(),
                            data: componentDataModel,
                        };
                        let componentsArray = entryPoint.componentsMap.get(componentDataModel.kind);
                        if (componentsArray === undefined) {
                            componentsArray = [];
                            entryPoint.componentsMap.set(component.kind, componentsArray);
                        }
                        componentsArray.push(component);
                        if (componentDataModel.members !== undefined) {
                            for (const memberDataModel of componentDataModel.members) {
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
                                const inputFilePath = `${entryPointId}.${componentId}.${originalMemberId}.md`;
                                const permalink = `${outputBaseUrl}/${entryPointId}/` +
                                    `${componentCategoryId}/${componentId}/${memberId}`;
                                if (memberKind !== 'CallSignature') {
                                    // if(originalMemberId === undefined) {
                                    //   console.log(memberDataModel)
                                    // }
                                    permalinksMapByPath.set(inputFilePath, permalink);
                                }
                                const frontMatterSlug = `/${options.apiBaseUrl}/${entryPointId}/` +
                                    `${componentCategoryId}/${componentId}/${memberId}`;
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
                                    ? `${componentLabel}.${memberTitle} ` +
                                        titleKind.toLowerCase()
                                    : `${componentLabel}.${memberTitle}`;
                                const sidebarLabel = memberTitle;
                                const sidebarId = `${options.apiFolderPath}/${entryPointId}/` +
                                    `${componentCategoryId}/${componentId}/${escapedMemberId}`;
                                const outputFilePath = `${entryPointId}/${componentCategoryId}/${componentId}/` +
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
                                let membersArray = component.membersMap.get(member.kind);
                                if (membersArray === undefined) {
                                    membersArray = [];
                                    component.membersMap.set(member.kind, membersArray);
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