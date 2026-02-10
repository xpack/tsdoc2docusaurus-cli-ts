import { DataModelMember } from '../../tsdoc/data-model.js';
import { CliOptions } from '../cli-options.js';
import { Workspace } from '../workspace.js';
import { Component, EntryPointsSet, NodeWithComponents, TopIndex } from './types.js';
export declare class ViewModel {
    options: CliOptions;
    workspace: Workspace;
    topIndex: TopIndex;
    entryPointsSet: EntryPointsSet;
    permalinksMapByPath: Map<string, string>;
    outputBaseUrl: string;
    constructor(workspace: Workspace);
    createComponentRecursively({ componentDataModel, entryPointId, parentComponentIds, parentNode, depth, }: {
        componentDataModel: DataModelMember;
        entryPointId: string;
        parentComponentIds?: string[];
        parentNode: NodeWithComponents;
        depth?: number;
    }): void;
    createMamber({ memberDataModel, entryPointId, parentComponentIds, componentLabel, componentCategoryId, component, depth, }: {
        memberDataModel: DataModelMember;
        entryPointId: string;
        parentComponentIds: string[];
        componentLabel: string;
        componentCategoryId: string;
        component: Component;
        depth: number;
    }): void;
}
//# sourceMappingURL=view-model.d.ts.map