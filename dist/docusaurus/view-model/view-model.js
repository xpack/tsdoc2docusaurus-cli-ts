import assert from 'node:assert';
import { filterFileName as filterFileName, pluralise } from '../utils.js';
export class ViewModel {
    options;
    workspace;
    topIndex;
    entryPointsSet;
    permalinksMapByPath;
    outputBaseUrl;
    constructor(workspace) {
        this.workspace = workspace;
        this.options = workspace.options;
        const options = workspace.options;
        const dataModel = workspace.dataModel;
        const permalinksMapByPath = new Map();
        this.permalinksMapByPath = permalinksMapByPath;
        const outputBaseUrl = `${options.baseUrl}${options.docsBaseUrl}/${options.apiBaseUrl}`;
        this.outputBaseUrl = outputBaseUrl;
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
        const entryPointsSet = new Set();
        for (const json of dataModel.jsons) {
            const toolVersion = json.metadata.toolVersion;
            if (json.members !== undefined) {
                for (const entryPointDataModel of json.members) {
                    if (options.debug) {
                        console.log(entryPointDataModel.kind, entryPointDataModel.canonicalReference);
                    }
                    const entryPointKind = entryPointDataModel.kind;
                    const entryPointLabel = entryPointDataModel.canonicalReference.replace(/[!]$/, '');
                    const entryPointId = entryPointLabel
                        .replace(/^.*\//, '')
                        .toLowerCase();
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
                        id: entryPointId,
                        inputFilePath,
                        permalink,
                        frontMatterSlug,
                        frontMatterTitle,
                        sidebarLabel,
                        sidebarId,
                        outputFilePath,
                        componentsMap: new Map(),
                        toolVersion,
                        dataModel: entryPointDataModel,
                    };
                    entryPointsSet.add(entryPoint);
                    if (entryPointDataModel.members) {
                        for (const componentDataModel of entryPointDataModel.members) {
                            this.createComponentRecursively({
                                componentDataModel,
                                entryPointId: entryPointId,
                                parentNode: entryPoint,
                            });
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
    createComponentRecursively({ componentDataModel, entryPointId, parentComponentIds = [], parentNode, depth = 1, }) {
        const workspace = this.workspace;
        const options = workspace.options;
        const outputBaseUrl = this.outputBaseUrl;
        const permalinksMapByPath = this.permalinksMapByPath;
        if (options.debug) {
            console.log(' '.repeat(depth * 2 - 1), componentDataModel.kind, componentDataModel.name, componentDataModel.canonicalReference);
        }
        const componentKind = componentDataModel.kind;
        const componentLabel = componentDataModel.name ?? '???';
        const componentId = (componentDataModel.name ?? '???').toLowerCase();
        const componentCategoryId = pluralise(componentKind)
            .toLowerCase()
            .replaceAll(/ /g, '');
        const componentIds = [...parentComponentIds, componentId];
        const inputFilePath = `${entryPointId}.${componentIds.join('.')}.md`;
        const permalink = `${outputBaseUrl}/${entryPointId}/` +
            `${componentCategoryId}/${componentIds.join('/')}`;
        permalinksMapByPath.set(inputFilePath, permalink);
        const frontMatterSlug = `/${options.apiBaseUrl}/${entryPointId}/` +
            `${componentCategoryId}/${componentIds.join('/')}`;
        let componentTitle = componentDataModel.name ?? '???';
        if (componentKind === 'Function') {
            componentTitle += '()';
        }
        const docCommentLines = componentDataModel.docComment.split('\n');
        let componentSummary = '';
        for (const line of docCommentLines) {
            const trimmedLine = line
                .replace(/^\s*\/\*\*/, '')
                .replace(/^\s*\*/g, '')
                .trim();
            if (trimmedLine.length > 0) {
                componentSummary = trimmedLine;
                break;
            }
        }
        const frontMatterTitle = componentTitle + ' ' + componentKind.toLowerCase();
        const sidebarLabel = componentTitle;
        const filteredComponentId = filterFileName(componentId);
        const sidebarId = `${options.apiFolderPath}/${entryPointId}/${componentCategoryId}/` +
            [...componentIds, filteredComponentId].join('/');
        const outputFilePath = `${entryPointId}/${componentCategoryId}/` +
            [...componentIds, filteredComponentId].join('/') +
            '.md';
        const component = {
            kind: componentKind,
            inputFilePath,
            permalink,
            frontMatterSlug,
            frontMatterTitle,
            sidebarLabel,
            sidebarId,
            outputFilePath,
            componentsMap: new Map(),
            membersMap: new Map(),
            summary: componentSummary,
            dataModel: componentDataModel,
            parent: parentNode,
        };
        let componentsArray = parentNode.componentsMap.get(componentDataModel.kind);
        if (componentsArray === undefined) {
            componentsArray = [];
            parentNode.componentsMap.set(component.kind, componentsArray);
        }
        componentsArray.push(component);
        if (componentDataModel.members !== undefined) {
            for (const memberDataModel of componentDataModel.members) {
                if (memberDataModel.members !== undefined &&
                    memberDataModel.members.length > 0) {
                    this.createComponentRecursively({
                        componentDataModel: memberDataModel,
                        entryPointId,
                        parentComponentIds: componentIds,
                        parentNode: component,
                        depth: depth + 1,
                    });
                }
                else {
                    this.createMamber({
                        memberDataModel,
                        entryPointId,
                        parentComponentIds: componentIds,
                        componentLabel,
                        componentCategoryId,
                        component,
                        depth: depth + 1,
                    });
                }
            }
        }
        for (const [kind, _componentArray] of component.componentsMap) {
            if (!parentNode.componentsMap.has(kind)) {
                parentNode.componentsMap.set(kind, []);
            }
        }
    }
    createMamber({ memberDataModel, entryPointId, parentComponentIds, componentLabel, componentCategoryId, component, depth, }) {
        assert(parentComponentIds.length > 0, 'Member must have a parent component');
        const workspace = this.workspace;
        const options = workspace.options;
        const outputBaseUrl = this.outputBaseUrl;
        const permalinksMapByPath = this.permalinksMapByPath;
        if (options.debug) {
            console.log(' '.repeat(depth * 2 - 1), memberDataModel.kind, memberDataModel.name ?? '-', memberDataModel.canonicalReference);
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
                return;
            }
            originalMemberId = memberDataModel.name
                .replaceAll(/[^a-zA-Z0-9]/g, '_')
                .toLowerCase();
            memberId = originalMemberId;
        }
        const inputFilePath = `${entryPointId}.${parentComponentIds.join('.')}.${originalMemberId}.md`;
        const permalink = `${outputBaseUrl}/${entryPointId}/` +
            `${componentCategoryId}/${parentComponentIds.join('/')}/${memberId}`;
        if (memberKind !== 'CallSignature') {
            permalinksMapByPath.set(inputFilePath, permalink);
        }
        const frontMatterSlug = `/${options.apiBaseUrl}/${entryPointId}/` +
            `${componentCategoryId}/${parentComponentIds.join('/')}/${memberId}`;
        if (memberKind === 'Method') {
            memberTitle += '()';
        }
        let titleKind = memberKind;
        if (titleKind === 'PropertySignature') {
            titleKind = 'Property';
        }
        const filteredMemberId = filterFileName(originalMemberId);
        const frontMatterTitle = memberKind !== 'Constructor'
            ? `${componentLabel}.${memberTitle} ` + titleKind.toLowerCase()
            : `${componentLabel}.${memberTitle}`;
        const sidebarLabel = memberTitle;
        const sidebarId = `${options.apiFolderPath}/${entryPointId}/${componentCategoryId}/` +
            [...parentComponentIds, filteredMemberId].join('/');
        const outputFilePath = `${entryPointId}/${componentCategoryId}/` +
            [...parentComponentIds, filteredMemberId].join('/') +
            '.md';
        const member = {
            kind: memberKind,
            inputFilePath,
            permalink,
            frontMatterSlug,
            frontMatterTitle,
            sidebarLabel,
            sidebarId,
            outputFilePath,
            dataModel: memberDataModel,
            parent: component,
        };
        let membersArray = component.membersMap.get(member.kind);
        if (membersArray === undefined) {
            membersArray = [];
            component.membersMap.set(member.kind, membersArray);
        }
        membersArray.push(member);
    }
}
//# sourceMappingURL=view-model.js.map