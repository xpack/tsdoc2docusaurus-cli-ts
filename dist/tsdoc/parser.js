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
// import { ApiModel } from '@microsoft/api-extractor-model'
// ----------------------------------------------------------------------------
export async function parseDataModel(options) {
    // Parse the API JSON file
    const apiJsonFilePath = options.apiJsonInputFilePath;
    console.log(`Reading ${apiJsonFilePath}...`);
    // const apiModel: ApiModel = new ApiModel()
    // apiModel.loadPackage(apiJsonFilePath)
    // TODO: deprecate plain json after the transition to apiModel.
    let json = undefined;
    try {
        const jsonContent = await fs.readFile(apiJsonFilePath, 'utf8');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        json = JSON.parse(jsonContent);
    }
    catch (err) {
        if (err instanceof Error) {
            console.warn(`Could not parse API JSON file ${options.apiJsonInputFilePath}: ` +
                err.message);
        }
        else {
            console.warn(`Could not parse API JSON file ${options.apiJsonInputFilePath}: ` +
                'Unknown error');
        }
    }
    return {
        // apiModel,
        json,
    };
}
// ----------------------------------------------------------------------------
//# sourceMappingURL=parser.js.map