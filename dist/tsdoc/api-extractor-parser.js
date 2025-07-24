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
// ----------------------------------------------------------------------------
import fs from 'node:fs/promises';
// ----------------------------------------------------------------------------
export async function parseDataModel(options) {
    // Parse the API JSON file
    let dataModel = null;
    try {
        console.log(`Reading ${options.apiJsonInputFolderPath}...`);
        const jsonContent = await fs.readFile(options.apiJsonInputFolderPath, 'utf8');
        dataModel = JSON.parse(jsonContent);
    }
    catch (err) {
        if (err instanceof Error) {
            console.warn(`Could not parse API JSON file ${options.apiJsonInputFolderPath}: ${err.message}`);
        }
        else {
            console.warn(`Could not parse API JSON file ${options.apiJsonInputFolderPath}: Unknown error`);
        }
        return null;
    }
    return dataModel;
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=api-extractor-parser.js.map