import { CliOptions } from '../docusaurus/cli-options.js';
export interface DataModelJson {
    metadata: any;
    kind: string;
    canonicalReference: string;
    name: string;
    preserveMemberOrder: boolean;
    members?: DataModelMember[];
}
export interface DataModelMember {
    kind: string;
    canonicalReference: string;
    docComment: string;
    excerptTokens?: DataModelExcerpt[];
    fileUrlPath?: string;
    releaseTag?: string;
    isAbstract?: boolean;
    name?: string;
    preserveMemberOrder: boolean;
    isProtected?: boolean;
    isReadonly?: boolean;
    isOptional?: boolean;
    isStatic?: boolean;
    overloadIndex?: number;
    propertyTypeTokenRange?: DataModelTypeTokenRange;
    parameters?: DataModelParameter[];
    members?: DataModelMember[];
    extendsTokenRange?: DataModelTypeTokenRange;
    implementsTokenRanges: any[];
}
export interface DataModelExcerpt {
    kind: string;
    text: string;
    canonicalReference?: string;
}
export interface DataModelParameter {
    parameterName: string;
    parameterTypeTokenRange: DataModelTypeTokenRange;
    isOptional: boolean;
}
export interface DataModelTypeTokenRange {
    startIndex: number;
    endIndex: number;
}
export declare class DataModel {
    options: CliOptions;
    jsons: DataModelJson[];
    projectVersion?: string;
    constructor(options: CliOptions);
    parse(): Promise<void>;
}
//# sourceMappingURL=data-model.d.ts.map