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

import fs from 'node:fs/promises'
import path from 'node:path'

import { CliOptions } from '../docusaurus/options.js'
import { DataModel, DataModelJson } from './types.js'

// ----------------------------------------------------------------------------

export async function parseDataModel(
  options: CliOptions
): Promise<DataModel | undefined> {
  // Parse the API JSON file

  const jsons: DataModelJson[] = []

  const afiFiles = await fs.readdir(options.apiJsonInputFolderPath)
  for (const apiFile of afiFiles) {
    if (apiFile.endsWith('.api.json')) {
      console.log(apiFile)

      const apiJsonFilePath = path.join(options.apiJsonInputFolderPath, apiFile)
      console.log(`Reading ${apiJsonFilePath}...`)

      try {
        const jsonContent = await fs.readFile(apiJsonFilePath, 'utf8')

        jsons.push(JSON.parse(jsonContent) as DataModelJson)
      } catch (err) {
        if (err instanceof Error) {
          console.warn(
            `Could not parse API JSON file ${apiJsonFilePath}: ` + err.message
          )
        } else {
          console.warn(
            `Could not parse API JSON file ${apiJsonFilePath}: ` +
              'Unknown error'
          )
        }
      }
    }
  }

  return {
    jsons,
  }
}

// ----------------------------------------------------------------------------
