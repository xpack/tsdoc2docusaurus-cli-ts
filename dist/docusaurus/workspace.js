import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ViewModel } from './view-model/view-model.js';
export class Workspace {
    options;
    dataModel;
    viewModel;
    projectPath;
    absoluteBaseUrl;
    pageBaseUrl;
    slugBaseUrl;
    menuBaseUrl;
    outputFolderPath;
    sidebarBaseId;
    constructor(dataModel) {
        this.dataModel = dataModel;
        this.options = dataModel.options;
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        this.projectPath = path.dirname(path.dirname(__dirname));
        const docsFolderPath = this.options.docsFolderPath
            .replace(/^[/]/, '')
            .replace(/[/]$/, '');
        const apiFolderPath = this.options.apiFolderPath
            .replace(/^[/]/, '')
            .replace(/[/]$/, '');
        this.outputFolderPath = `${docsFolderPath}/${apiFolderPath}/`;
        this.sidebarBaseId = `${apiFolderPath}/`;
        const docsBaseUrl = this.options.docsBaseUrl
            .replace(/^[/]/, '')
            .replace(/[/]$/, '');
        let apiBaseUrl = this.options.apiBaseUrl
            .replace(/^[/]/, '')
            .replace(/[/]$/, '');
        if (apiBaseUrl.length > 0) {
            apiBaseUrl += '/';
        }
        this.absoluteBaseUrl = `${this.options.baseUrl}${docsBaseUrl}/${apiBaseUrl}`;
        this.pageBaseUrl = `${this.options.baseUrl}${docsBaseUrl}/${apiBaseUrl}`;
        this.slugBaseUrl = `/${apiBaseUrl}`;
        this.menuBaseUrl = `/${docsBaseUrl}/${apiBaseUrl}`;
        this.viewModel = new ViewModel(this);
    }
}
//# sourceMappingURL=workspace.js.map