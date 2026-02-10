import { Workspace } from './workspace.js';
import { Component, FrontMatter } from './view-model/types.js';
import { CliOptions } from './cli-options.js';
import { NavbarItem, SidebarCategory, SidebarCategoryItem } from './types.js';
export declare class DocusaurusGenerator {
    workspace: Workspace;
    options: CliOptions;
    writtenFilesCount: number;
    constructor(workspace: Workspace);
    run(): Promise<number>;
    prepareOutputFolder(): Promise<void>;
    readInputFileLines(filePath: string): Promise<string[]>;
    writeOutputMdFile({ filePath, frontMatter, lines, toolVersion, }: {
        filePath: string;
        frontMatter: FrontMatter;
        lines: string[];
        toolVersion?: string;
    }): Promise<void>;
    patchLines(lines: string[], permalinksMapByPath: Map<string, string>): string[];
    patchPermalinks(line: string, permalinksMapByPath: Map<string, string>): string;
    generateMdFiles(): Promise<void>;
    generateComponentMdFilesRecursively({ compound, toolVersion, }: {
        compound: Component;
        toolVersion: string;
    }): Promise<void>;
    generateSidebarCategory(): SidebarCategory;
    generateSidebarCategoryRecursively({ kind, compound, }: {
        kind: string;
        compound: Component;
    }): SidebarCategoryItem;
    generateNavbarItem(): NavbarItem;
    writeSidebarFile(sidebarCategory: SidebarCategory): Promise<void>;
    writeNavbarFile(navbarItem: NavbarItem): Promise<void>;
    copyCssFile(): Promise<void>;
}
//# sourceMappingURL=generator.d.ts.map