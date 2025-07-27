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

import assert from 'node:assert'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import * as util from 'node:util'

// https://www.npmjs.com/package/commander
import { Command } from 'commander'

// ----------------------------------------------------------------------------

export interface Redirects {
  from: string | string[]
  to: string
}

/**
 * Options, as written by the user in the configuration file.
 * All are optional.
 */
export interface CliConfigurationOptions {
  apiJsonInputFolderPath?: string
  apiMarkdownInputFolderPath?: string
  docsFolderPath?: string
  apiFolderPath?: string
  baseUrl?: string
  docsBaseUrl?: string
  apiBaseUrl?: string
  sidebarCategoryFilePath?: string
  sidebarCategoryLabel?: string
  navbarLabel?: string
  navbarPosition?: 'left' | 'right'
  navbarFilePath?: string
  customCssFilePath?: string
  verbose?: boolean
  debug?: boolean
  id?: string
}

/**
 * Options, as seen by the application. Most are mandatory.
 *
 * @remarks
 * If the user does not provide them, the defaults are used.
 *
 * @public
 */
export interface CliOptions {
  /**
   * Relative to the current website folder, like `../api-extractor`,
   * no final slash.
   */
  apiJsonInputFolderPath: string

  /**
   * Relative to the current website folder, like `../api-extractor/markdown`,
   * no final slash.
   */
  apiMarkdownInputFolderPath: string

  /**
   * Relative to the current website folder, like `docs`, no initial/final
   * slashes.
   */
  docsFolderPath: string

  /** Relative to the docs folder, like `api`, no initial/final slashes. */
  apiFolderPath: string

  /** Site base URL, like / or /xxx/. */
  baseUrl: string

  /** Relative to the web home, like `docs`, without initial/final slashes. */
  docsBaseUrl: string

  /** Relative to the docs home, like `api`, without initial/final slashes. */
  apiBaseUrl: string

  /**
   * Relative to the current website folder, default
   * `sidebar-category-doxygen.json`.
   */
  sidebarCategoryFilePath: string

  /** Short text to be displayed in the sidebar. */
  sidebarCategoryLabel: string

  /**
   * Relative to the current website folder, default
   * `docusaurus-config-tsdoc-menu.json`.
   */
  navbarFilePath: string

  /** Short text to be displayed in the menu. */
  navbarLabel: string

  /** Where the menu is to be displayed, left or right. */
  navbarPosition: 'left' | 'right'

  /**
   * Relative to the current website folder, default
   * `src/css/custom-doxygen.css`.
   */
  customCssFilePath: string

  /** Boolean to control verbosity. */
  verbose: boolean

  /** Boolean to control debug verbosity. */
  debug: boolean

  /** String identifier in case of multiple instances. */
  id: string
}

const defaultOptions: CliOptions = {
  apiJsonInputFolderPath: '../api-extractor',
  apiMarkdownInputFolderPath: '../api-extractor/markdown',
  docsFolderPath: 'docs',
  apiFolderPath: 'api',
  baseUrl: '/',
  docsBaseUrl: 'docs',
  apiBaseUrl: 'api',
  sidebarCategoryFilePath: 'sidebar-category-tsdoc.json',
  sidebarCategoryLabel: 'API Reference (TSDoc)',
  navbarFilePath: 'docusaurus-config-navbar-tsdoc.json',
  navbarLabel: 'Reference',
  navbarPosition: 'left',
  customCssFilePath: 'src/css/custom-tsdoc2docusaurus.css',
  verbose: false,
  debug: false,
  id: 'default',
}

// ----------------------------------------------------------------------------

// Combine single-configuration with multi-configurations.
type MultiConfigurations =
  | CliConfigurationOptions
  | Record<string, CliConfigurationOptions>
  | undefined

// Prefer config.doxygen2docusaurus, but also accept doxygen2docusaurus.
interface GenericPackageConfiguration {
  config?: { tsdoc2docusaurus: CliConfigurationOptions }
  tsdoc2docusaurus?: CliConfigurationOptions
}

// ----------------------------------------------------------------------------

export async function parseOptions(argv: string[]): Promise<CliOptions> {
  const program = new Command()

  program.option('--id <name>', 'id, for multi-configurations')
  program.parse(argv)

  const programOptions = program.opts()

  const id: string | undefined = programOptions.id as string | undefined

  let configurationOptions: CliConfigurationOptions | undefined = undefined

  try {
    const userPackageJsonPath = path.resolve(
      process.cwd(),
      'config',
      'tsdoc2docusaurus.json'
    )
    const pkgJsonRaw = await fs.readFile(userPackageJsonPath, 'utf8')

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const multiConfigurations: MultiConfigurations = JSON.parse(pkgJsonRaw)

    configurationOptions = selectMultiConfiguration(multiConfigurations, id)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    /* Cannot read/parse JSON */
  }

  if (configurationOptions === undefined) {
    try {
      const userPackageJsonPath = path.resolve(
        process.cwd(),
        'tsdoc2docusaurus.json'
      )
      const pkgJsonRaw = await fs.readFile(userPackageJsonPath, 'utf8')

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const multiConfigurations: MultiConfigurations = JSON.parse(pkgJsonRaw)

      configurationOptions = selectMultiConfiguration(multiConfigurations, id)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      /* Cannot read/parse JSON */
    }
  }

  if (configurationOptions === undefined) {
    try {
      // Try to get the configuration from
      // package.json/[config/]doxygen2docusaurus.
      const userPackageJsonPath = path.resolve(process.cwd(), 'package.json')
      const pkgJsonRaw = await fs.readFile(userPackageJsonPath, 'utf8')

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const pkgJson: GenericPackageConfiguration = JSON.parse(pkgJsonRaw)

      const multiConfigurations: MultiConfigurations =
        pkgJson.config?.tsdoc2docusaurus ?? pkgJson.tsdoc2docusaurus

      configurationOptions = selectMultiConfiguration(multiConfigurations, id)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      /* Cannot read/parse JSON */
    }
  }

  // console.log(configurationOptions)

  let options: CliOptions = defaultOptions
  if (configurationOptions !== undefined) {
    options = {
      ...getInstanceDefaultOptions(configurationOptions.id),
      ...configurationOptions,
    }
  }

  if (options.verbose) {
    console.log()
    console.log('configuration:', util.inspect(options))
  }

  assert(
    options.apiJsonInputFolderPath.length > 0,
    'apiJsonInputFolderPath is required'
  )

  assert(options.docsFolderPath.length > 0, 'docsFolderPath is required')
  assert(options.apiFolderPath.length > 0, 'apiFolderPath is required')

  assert(options.docsBaseUrl.length > 0, 'docsBaseUrl is required')
  // assert(options.apiBaseUrl.length > 0, 'apiBaseUrl is required')

  assert(
    options.sidebarCategoryFilePath.length > 0,
    'sidebarCategoryFilePath is required'
  )

  return options
}

// ----------------------------------------------------------------------------

function getInstanceDefaultOptions(id: string | undefined): CliOptions {
  const options = { ...defaultOptions }

  if (id !== undefined && id.length > 0) {
    options.apiFolderPath = id
    options.apiBaseUrl = id
    options.sidebarCategoryFilePath = `sidebar-category-tsdoc-${id}.json`
  }

  return options
}

function selectMultiConfiguration(
  multiConfigurations: MultiConfigurations,
  id: string | undefined
): CliConfigurationOptions | undefined {
  let configurationOptions: CliConfigurationOptions | undefined = undefined
  if (id !== undefined) {
    configurationOptions = (
      multiConfigurations as Record<string, CliConfigurationOptions | undefined>
    )[id]

    if (configurationOptions !== undefined) {
      configurationOptions.id = id
    }
  } else {
    configurationOptions = multiConfigurations
  }
  return configurationOptions
}

// ----------------------------------------------------------------------------
