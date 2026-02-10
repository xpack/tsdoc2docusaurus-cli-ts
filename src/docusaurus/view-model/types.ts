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

import { DataModelMember } from '../../index.js'

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

export interface NodeWithComponents extends Base {
  // Map of array of components, by kind (Class, Interface, ...)
  componentsMap: Map<string, Component[]>

  dataModel: DataModelMember
}

export interface EntryPoint extends NodeWithComponents {
  toolVersion: string

  id: string
}

export interface Component extends NodeWithComponents {
  parent: NodeWithComponents

  // Map of array of members, by kind (Constructor, Property, ...)
  membersMap: Map<string, Member[]>
}

// Leaf node, no component children.
export interface Member extends Base {
  parent: Component

  dataModel: DataModelMember
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TopIndex extends Base {}

export type EntryPointsSet = Set<EntryPoint>

export interface FrontMatter {
  slug: string
  title: string
}

// ----------------------------------------------------------------------------
