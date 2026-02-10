import { CliOptions } from './cli-options.js';
import { ViewModel } from './view-model/view-model.js';
import { DataModel } from '../tsdoc/data-model.js';
export declare class Workspace {
    options: CliOptions;
    dataModel: DataModel;
    viewModel: ViewModel;
    projectPath: string;
    absoluteBaseUrl: string;
    pageBaseUrl: string;
    slugBaseUrl: string;
    menuBaseUrl: string;
    outputFolderPath: string;
    sidebarBaseId: string;
    constructor(dataModel: DataModel);
}
//# sourceMappingURL=workspace.d.ts.map