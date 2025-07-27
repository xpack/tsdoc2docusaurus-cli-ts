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

export * from './cli/main.js'

// Export types and interfaces required by API Extractor
export { ViewModel } from './docusaurus/view-model/view-model.js'
export type {
  CliOptions,
  CliConfigurationOptions,
  MultiConfigurations,
} from './docusaurus/cli-options.js'
export type {
  EntryPoint,
  EntryPointsSet,
  Component,
  Member,
  TopIndex,
} from './docusaurus/view-model/types.js'
export type {
  DataModel,
  DataModelJson,
  DataModelMember,
  DataModelParameter,
  DataModelTypeTokenRange,
  DataModelExcerpt,
} from './tsdoc/data-model.js'

// ----------------------------------------------------------------------------
