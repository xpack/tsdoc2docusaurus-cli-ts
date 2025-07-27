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

import path from 'node:path'

import { CliOptions } from './options.js'
import { fileURLToPath } from 'node:url'
import { ViewModel } from './view-model/view-model.js'
import { DataModel } from '../tsdoc/data-model.js'

// ----------------------------------------------------------------------------

export class Workspace {
  // The tsdoc2docusaurus project path.
  projectPath: string

  dataModel: DataModel

  viewModel: ViewModel

  // From the project docusaurus.config.ts or defaults.
  options: CliOptions

  // Like `/micro-os-plus/docs/api/`.
  absoluteBaseUrl: string

  // Like `/micro-os-plus/docs/api/`.
  pageBaseUrl: string

  // Like `/api/`.
  slugBaseUrl: string

  // Like `/docs/api/`.
  menuBaseUrl: string

  // Like `docs/api/`.
  outputFolderPath: string

  // like `api/`.
  sidebarBaseId: string

  constructor({
    dataModel,
    options,
  }: {
    dataModel: DataModel
    options: CliOptions
  }) {
    // Like .../tsdoc2docusaurus/dist/src/docusaurus/generator

    const __dirname = path.dirname(fileURLToPath(import.meta.url))

    // tsdoc2docusaurus
    this.projectPath = path.dirname(path.dirname(__dirname))
    // console.log(__dirname, this.projectPath)

    this.options = options
    this.dataModel = dataModel

    const docsFolderPath = this.options.docsFolderPath
      .replace(/^[/]/, '')
      .replace(/[/]$/, '')
    const apiFolderPath = this.options.apiFolderPath
      .replace(/^[/]/, '')
      .replace(/[/]$/, '')

    this.outputFolderPath = `${docsFolderPath}/${apiFolderPath}/`

    this.sidebarBaseId = `${apiFolderPath}/`

    const docsBaseUrl = this.options.docsBaseUrl
      .replace(/^[/]/, '')
      .replace(/[/]$/, '')
    let apiBaseUrl = this.options.apiBaseUrl
      .replace(/^[/]/, '')
      .replace(/[/]$/, '')
    if (apiBaseUrl.length > 0) {
      apiBaseUrl += '/'
    }

    this.absoluteBaseUrl = `${this.options.baseUrl}${docsBaseUrl}/${apiBaseUrl}`
    this.pageBaseUrl = `${this.options.baseUrl}${docsBaseUrl}/${apiBaseUrl}`
    this.slugBaseUrl = `/${apiBaseUrl}`
    this.menuBaseUrl = `/${docsBaseUrl}/${apiBaseUrl}`

    this.viewModel = new ViewModel({
      dataModel: this.dataModel,
      options: this.options,
    })
  }
}

// ----------------------------------------------------------------------------
