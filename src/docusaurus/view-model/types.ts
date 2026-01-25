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

export interface Base {
  kind: string

  inputFilePath: string
  permalink: string

  frontMatterSlug: string
  frontMatterTitle: string

  sidebarLabel: string
  sidebarId: string

  outputFilePath: string

  summary?: string
  // isHidden?: boolean
}

export interface EntryPoint extends Base {
  // Map of array of components, by kind (Class, Interface, ...)
  componentsMap: Map<string, Component[]>

  toolVersion: string

  id: string

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
}

export interface Component extends Base {
  // Map of array of members, by kind (Constructor, Property, ...)
  membersMap: Map<string, Member[]>

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
}

export interface Member extends Base {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TopIndex extends Base {}

export type EntryPointsSet = Set<EntryPoint>

export interface ViewModel {
  topIndex: TopIndex
  entryPointsSet: EntryPointsSet
  permalinksMapByPath: Map<string, string>
}

export interface FrontMatter {
  slug: string
  title: string
}

// ----------------------------------------------------------------------------
