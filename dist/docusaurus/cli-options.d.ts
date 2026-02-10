export interface Redirects {
    from: string | string[];
    to: string;
}
export type CliConfigurationOptions = Record<string, string | boolean>;
export type CommandOptions = Record<string, string | boolean | undefined>;
export type MultiConfigurations = Record<string, CliConfigurationOptions>;
export declare class CliOptions {
    apiJsonInputFolderPath: string;
    apiMarkdownInputFolderPath: string;
    docsFolderPath: string;
    apiFolderPath: string;
    baseUrl: string;
    docsBaseUrl: string;
    apiBaseUrl: string;
    sidebarCategoryFilePath: string;
    sidebarCategoryLabel: string;
    navbarFilePath: string;
    navbarLabel: string;
    navbarPosition: 'left' | 'right';
    customCssFilePath: string;
    verbose: boolean;
    debug: boolean;
    id: string;
    constructor(commandOptions: CommandOptions);
    parse(): Promise<void>;
    selectMultiConfiguration(multiConfigurations: CliConfigurationOptions | MultiConfigurations): CliConfigurationOptions | undefined;
}
//# sourceMappingURL=cli-options.d.ts.map