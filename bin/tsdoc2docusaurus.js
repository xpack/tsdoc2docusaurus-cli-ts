#!/usr/bin/env node
// Mandatory shebang must point to `node` and this file must be executable.

/*
 * This file is part of the xPack project (http://xpack.github.io).
 * Copyright (c) 2025 Liviu Ionescu. All rights reserved.
 *
 * Permission to use, copy, modify, and/or distribute this software
 * for any purpose is hereby granted, under the terms of the MIT license.
 *
 * If a copy of the license was not distributed with this file, it can
 * be obtained from https://opensource.org/license/mit.
 */

'use strict'

/*
 * On POSIX platforms, when installing a global package,
 * a symbolic link named `doxygen2docusaurus` is created
 * in the `/usr/local/bin` folder (on macOS), or
 * in the `/usr/bin` folder (on Ubuntu), pointing to this file.
 *
 * On Windows, where symbolic links are not available,
 * when installing a global package,
 * two forwarders are automatically created in the
 * user `\AppData\Roaming\npm\node_modules\doxygen2docusaurus\bin` folder:
 * - `doxygen2docusaurus.cmd`, for invocation from the Windows command line
 * - `doxygen2docusaurus` (a shell script), for invocations from an optional
 * POSIX environments like minGW-w64, msys2, git shell, etc.
 *
 * On all platforms, `process.argv[1]` will be the full path of
 * this file, or the full path of the `doxygen2docusaurus` link, so, in case
 * the program will need to be invoked with different names,
 * this is the method to differentiate between them.
 */

// ----------------------------------------------------------------------------

// import { main } from '../dist/cli/main.js'
import { main } from '../dist/tsdoc2docusaurus.js'

// ----------------------------------------------------------------------------

try {
  process.exit(await main(process.argv))
} catch(err) {
  // If the main function throws an error, it will be caught here.
  // The error message will be printed to the console.
  console.error('An error occurred while running tsdoc2docusaurus:', err)
  process.exit(1) // Exit with a non-zero status code to indicate failure.
}

// ----------------------------------------------------------------------------
