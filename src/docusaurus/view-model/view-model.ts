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

import { DataModelMember } from '../../tsdoc/data-model.js'
import { CliOptions } from '../cli-options.js'
import { filterFileName as filterFileName, pluralise } from '../utils.js'
import { Workspace } from '../workspace.js'
import {
  Component,
  EntryPoint,
  EntryPointsSet,
  Member,
  NodeWithComponents,
  TopIndex,
} from './types.js'

// ----------------------------------------------------------------------------

export class ViewModel {
  options: CliOptions

  workspace: Workspace

  topIndex: TopIndex
  entryPointsSet: EntryPointsSet
  permalinksMapByPath: Map<string, string>
  outputBaseUrl: string

  constructor(workspace: Workspace) {
    this.workspace = workspace
    this.options = workspace.options

    const options = workspace.options
    const dataModel = workspace.dataModel

    // Key paths do not start with '/', permalinks are absolute
    // (start with baseUrl).
    const permalinksMapByPath = new Map<string, string>()
    this.permalinksMapByPath = permalinksMapByPath

    // eslint-disable-next-line max-len
    const outputBaseUrl = `${options.baseUrl}${options.docsBaseUrl}/${options.apiBaseUrl}`
    this.outputBaseUrl = outputBaseUrl

    const topIndex: TopIndex = {
      kind: 'TopIndex',

      inputFilePath: 'index.md',
      permalink: outputBaseUrl,

      frontMatterSlug: `/${options.apiBaseUrl}`,
      frontMatterTitle: 'API Reference',

      sidebarLabel: options.sidebarCategoryLabel,
      sidebarId: `${options.apiFolderPath}/index`,

      outputFilePath: 'index.md',
    }

    permalinksMapByPath.set(topIndex.inputFilePath, topIndex.permalink)

    const entryPointsSet = new Set<EntryPoint>()

    for (const json of dataModel.jsons) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const toolVersion = json.metadata.toolVersion as string

      if (json.members !== undefined) {
        for (const entryPointDataModel of json.members) {
          if (options.debug) {
            console.log(
              entryPointDataModel.kind,
              entryPointDataModel.canonicalReference
            )
          }

          const entryPointKind: string = entryPointDataModel.kind

          const entryPointLabel: string =
            entryPointDataModel.canonicalReference.replace(/[!]$/, '')
          const entryPointId = entryPointLabel
            .replace(/^.*\//, '')
            .toLowerCase()

          const inputFilePath = `${entryPointId}.md`
          const permalink = `${outputBaseUrl}/${entryPointId}`
          permalinksMapByPath.set(inputFilePath, permalink)

          const frontMatterSlug = `/${options.apiBaseUrl}/${entryPointId}`
          const frontMatterTitle = `${entryPointId} package`

          const sidebarLabel = entryPointLabel
          const sidebarId = `${options.apiFolderPath}/${entryPointId}`

          const outputFilePath = `${entryPointId}.md`

          const entryPoint: EntryPoint = {
            kind: entryPointKind,
            id: entryPointId,

            inputFilePath,
            permalink,

            frontMatterSlug,
            frontMatterTitle,

            sidebarLabel,
            sidebarId,

            outputFilePath,

            // Map of array of components, by kind (Class, Interface, ...)
            componentsMap: new Map(),

            toolVersion,

            dataModel: entryPointDataModel,
          }
          entryPointsSet.add(entryPoint)
          if (entryPointDataModel.members) {
            for (const componentDataModel of entryPointDataModel.members) {
              this.createComponentRecursively({
                componentDataModel,
                entryPointId: entryPointId,
                parentNode: entryPoint,
              })
            }
          }
        }
      }
    }

    if (options.debug) {
      for (const [keyPath, permalink] of permalinksMapByPath) {
        console.log(keyPath, '=>', permalink)
      }
    }

    this.topIndex = topIndex
    this.entryPointsSet = entryPointsSet
    this.permalinksMapByPath = permalinksMapByPath
  }

  createComponentRecursively({
    componentDataModel,
    entryPointId,
    parentComponentIds = [],
    parentNode,
    depth = 1,
  }: {
    componentDataModel: DataModelMember
    entryPointId: string
    parentComponentIds?: string[]
    parentNode: NodeWithComponents
    depth?: number
  }): void {
    const workspace = this.workspace
    const options = workspace.options

    const outputBaseUrl = this.outputBaseUrl
    const permalinksMapByPath = this.permalinksMapByPath
    if (options.debug) {
      console.log(
        ' '.repeat(depth * 2 - 1),
        componentDataModel.kind,
        componentDataModel.name,
        componentDataModel.canonicalReference
      )
    }

    const componentKind: string = componentDataModel.kind
    const componentLabel: string = componentDataModel.name ?? '???'
    const componentId: string = (componentDataModel.name ?? '???').toLowerCase()
    const componentCategoryId = pluralise(componentKind)
      .toLowerCase()
      .replaceAll(/ /g, '')

    const componentIds = [...parentComponentIds, componentId]

    const inputFilePath = `${entryPointId}.${componentIds.join('.')}.md`
    const permalink =
      `${outputBaseUrl}/${entryPointId}/` +
      `${componentCategoryId}/${componentIds.join('/')}`
    permalinksMapByPath.set(inputFilePath, permalink)

    const frontMatterSlug =
      `/${options.apiBaseUrl}/${entryPointId}/` +
      `${componentCategoryId}/${componentIds.join('/')}`

    let componentTitle: string = componentDataModel.name ?? '???'
    if (componentKind === 'Function') {
      componentTitle += '()'
    }

    const docCommentLines = componentDataModel.docComment.split('\n')
    let componentSummary = ''
    for (const line of docCommentLines) {
      const trimmedLine = line
        .replace(/^\s*\/\*\*/, '')
        .replace(/^\s*\*/g, '')
        .trim()
      if (trimmedLine.length > 0) {
        componentSummary = trimmedLine
        break
      }
    }

    const frontMatterTitle = componentTitle + ' ' + componentKind.toLowerCase()

    const sidebarLabel = componentTitle

    const filteredComponentId = filterFileName(componentId)
    const sidebarId =
      `${options.apiFolderPath}/${entryPointId}/${componentCategoryId}/` +
      [...componentIds, filteredComponentId].join('/')

    const outputFilePath =
      `${entryPointId}/${componentCategoryId}/` +
      [...componentIds, filteredComponentId].join('/') +
      '.md'

    const component: Component = {
      kind: componentKind,

      inputFilePath,
      permalink,

      frontMatterSlug,
      frontMatterTitle,

      sidebarLabel,
      sidebarId,

      outputFilePath,

      componentsMap: new Map(),

      // Map of array of members, by kind (Constructor, Property, ...)
      membersMap: new Map(),

      summary: componentSummary,

      dataModel: componentDataModel,
    }

    let componentsArray = parentNode.componentsMap.get(componentDataModel.kind)
    if (componentsArray === undefined) {
      componentsArray = []
      parentNode.componentsMap.set(component.kind, componentsArray)
    }
    componentsArray.push(component)

    if (componentDataModel.members !== undefined) {
      for (const memberDataModel of componentDataModel.members) {
        if (
          memberDataModel.members !== undefined &&
          memberDataModel.members.length > 0
        ) {
          this.createComponentRecursively({
            componentDataModel: memberDataModel,
            entryPointId,
            parentComponentIds: componentIds,
            parentNode: component,
            depth: depth + 1,
          })
        } else {
          this.createMamber({
            memberDataModel,
            entryPointId,
            parentComponentIds: componentIds,
            componentLabel,
            componentCategoryId,
            component,
            depth: depth + 1,
          })
        }
      }
    }
  }

  createMamber({
    memberDataModel,
    entryPointId,
    parentComponentIds,
    componentLabel,
    componentCategoryId,
    component,
    depth,
  }: {
    memberDataModel: DataModelMember
    entryPointId: string
    parentComponentIds: string[]
    componentLabel: string
    componentCategoryId: string
    component: Component
    depth: number
  }) {
    assert(parentComponentIds.length > 0, 'Member must have a parent component')
    const workspace = this.workspace
    const options = workspace.options

    const outputBaseUrl = this.outputBaseUrl
    const permalinksMapByPath = this.permalinksMapByPath

    if (options.debug) {
      console.log(
        ' '.repeat(depth * 2 - 1),

        memberDataModel.kind,
        memberDataModel.name ?? '-',
        memberDataModel.canonicalReference
      )
    }

    const memberKind: string = memberDataModel.kind

    let memberTitle: string = memberDataModel.name ?? '???'
    let originalMemberId: string = memberDataModel.name ?? '???'
    let memberId: string | undefined = memberDataModel.name

    if (memberKind === 'Constructor') {
      memberId = 'constructor'
      memberTitle = '(constructor)'
      originalMemberId = '_constructor_'
    } else {
      if (
        memberDataModel.name === undefined ||
        memberDataModel.name.length === 0
      ) {
        return
      }

      originalMemberId = memberDataModel.name
        .replaceAll(/[^a-zA-Z0-9]/g, '_')
        .toLowerCase()

      memberId = originalMemberId
    }

    // eslint-disable-next-line max-len
    const inputFilePath = `${entryPointId}.${parentComponentIds.join('.')}.${originalMemberId}.md`
    const permalink =
      `${outputBaseUrl}/${entryPointId}/` +
      `${componentCategoryId}/${parentComponentIds.join('/')}/${memberId}`
    if (memberKind !== 'CallSignature') {
      // if(originalMemberId === undefined) {
      //   console.log(memberDataModel)
      // }
      permalinksMapByPath.set(inputFilePath, permalink)
    }

    const frontMatterSlug =
      `/${options.apiBaseUrl}/${entryPointId}/` +
      `${componentCategoryId}/${parentComponentIds.join('/')}/${memberId}`

    if (memberKind === 'Method') {
      memberTitle += '()'
    }

    let titleKind = memberKind
    if (titleKind === 'PropertySignature') {
      titleKind = 'Property'
    }

    const filteredMemberId = filterFileName(originalMemberId)

    const frontMatterTitle =
      memberKind !== 'Constructor'
        ? `${componentLabel}.${memberTitle} ` + titleKind.toLowerCase()
        : `${componentLabel}.${memberTitle}`

    const sidebarLabel = memberTitle
    // By default the sidebar id uses the file path.
    const sidebarId =
      `${options.apiFolderPath}/${entryPointId}/${componentCategoryId}/` +
      [...parentComponentIds, filteredMemberId].join('/')

    const outputFilePath =
      `${entryPointId}/${componentCategoryId}/` +
      [...parentComponentIds, filteredMemberId].join('/') +
      '.md'

    const member: Member = {
      kind: memberKind,

      inputFilePath,
      permalink,

      frontMatterSlug,
      frontMatterTitle,

      sidebarLabel,
      sidebarId,

      outputFilePath,

      dataModel: memberDataModel,
    }

    // if (memberId === undefined) {
    //   member.isHidden = true
    // }

    let membersArray = component.membersMap.get(member.kind)
    if (membersArray === undefined) {
      membersArray = []
      component.membersMap.set(member.kind, membersArray)
    }

    membersArray.push(member)
  }
}

// ----------------------------------------------------------------------------
