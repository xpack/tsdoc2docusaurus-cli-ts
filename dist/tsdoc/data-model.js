import fs from 'node:fs/promises';
import path from 'node:path';
export class DataModel {
    options;
    jsons;
    projectVersion;
    constructor(options) {
        this.options = options;
        this.jsons = [];
    }
    async parse() {
        const afiFiles = await fs.readdir(this.options.apiJsonInputFolderPath);
        for (const apiFile of afiFiles) {
            if (apiFile.endsWith('.api.json')) {
                console.log(apiFile);
                const apiJsonFilePath = path.join(this.options.apiJsonInputFolderPath, apiFile);
                console.log(`Reading ${apiJsonFilePath}...`);
                try {
                    const jsonContent = await fs.readFile(apiJsonFilePath, 'utf8');
                    this.jsons.push(JSON.parse(jsonContent));
                }
                catch (err) {
                    if (err instanceof Error) {
                        console.warn(`Could not parse API JSON file ${apiJsonFilePath}: ` + err.message);
                    }
                    else {
                        console.warn(`Could not parse API JSON file ${apiJsonFilePath}: ` +
                            'Unknown error');
                    }
                }
            }
        }
    }
}
//# sourceMappingURL=data-model.js.map