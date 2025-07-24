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

// import assert from 'node:assert'
import * as path from 'node:path'
// import * as util from 'node:util'

import { formatDuration } from '../docusaurus/utils.js'
import type { DataModel } from '../tsdoc/types.js'
import { type CliOptions, parseOptions } from '../docusaurus/options.js'
import { parseDataModel } from '../tsdoc/parser.js'
import { prepareViewModel } from '../docusaurus/view-model/prepare.js'
import { generateMdFiles, generateSidebar } from '../docusaurus/generate.js'

// ----------------------------------------------------------------------------

/**
 * Main entry point for the tsdoc2docusaurus CLI tool.
 *
 * @param argv - Command line arguments array
 * @returns Promise that resolves to the exit code (0 for success, 1 for error)
 *
 * @public
 */
export async function main(argv: string[]): Promise<number> {
  const startTime = Date.now()

  let commandLine: string = path.basename(argv[1] ?? 'tsdoc2docusaurus')
  if (argv.length > 2) {
    commandLine += ` ${argv.slice(2).join(' ')}`
  }

  console.log(`Running '${commandLine}'...`)

  const options: CliOptions = await parseOptions(argv)

  let exitCode = 0

  console.log()

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const dataModel: DataModel = await parseDataModel(options)

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const viewModel = prepareViewModel({ dataModel, options })

  exitCode = await generateSidebar({ viewModel, options })
  if (exitCode !== 0) {
    return exitCode
  }

  exitCode = await generateMdFiles({ viewModel, options })

  const durationString = formatDuration(Date.now() - startTime)

  if (exitCode === 0) {
    console.log()
    console.log(
      `Running '${commandLine}' has completed successfully ` +
        `in ${durationString}.`
    )
  }

  return exitCode
}

// ----------------------------------------------------------------------------
