import { DataModelMember } from '../../index.js';
export interface Base {
    kind: string;
    inputFilePath: string;
    permalink: string;
    frontMatterSlug: string;
    frontMatterTitle: string;
    sidebarLabel: string;
    sidebarId: string;
    outputFilePath: string;
    summary?: string;
}
export interface NodeWithComponents extends Base {
    componentsMap: Map<string, Component[]>;
    dataModel: DataModelMember;
}
export interface EntryPoint extends NodeWithComponents {
    toolVersion: string;
    id: string;
}
export interface Component extends NodeWithComponents {
    parent: NodeWithComponents;
    membersMap: Map<string, Member[]>;
}
export interface Member extends Base {
    parent: Component;
    dataModel: DataModelMember;
}
export interface TopIndex extends Base {
}
export type EntryPointsSet = Set<EntryPoint>;
export interface FrontMatter {
    slug: string;
    title: string;
}
//# sourceMappingURL=types.d.ts.map