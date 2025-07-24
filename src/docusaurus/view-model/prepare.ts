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

import type { DataModel } from '../../tsdoc/types.js'
import type {
  ViewModel,
  Compound,
  EntryPoint,
  Member,
  TopIndex,
} from './types.js'
import { pluralise } from '../generate.js'
import type { CliOptions } from '../options.js'
// import util from 'node:util'

// ----------------------------------------------------------------------------

export function prepareViewModel({
  dataModel,
  options,
}: {
  dataModel: DataModel
  options: CliOptions
}): ViewModel {
  const entryPointsSet = new Set<EntryPoint>()

  // Key paths do not start with '/', permalinks are absolute
  // (start with baseUrl).
  const permalinksMapByPath = new Map<string, string>()

  // eslint-disable-next-line max-len
  const outputBaseUrl = `${options.baseUrl}${options.docsBaseUrl}/${options.apiBaseUrl}`
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

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  for (const entryPointDataModel of dataModel.members) {
    if (options.debug) {
      console.log(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        entryPointDataModel.kind,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        entryPointDataModel.canonicalReference
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const entryPointKind: string = entryPointDataModel.kind

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const entryPointLabel: string =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      entryPointDataModel.canonicalReference.replace(/[!]$/, '')
    const entryPointId = entryPointLabel.replace(/^.*\//, '').toLowerCase()

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

      inputFilePath,
      permalink,

      frontMatterSlug,
      frontMatterTitle,

      sidebarLabel,
      sidebarId,

      outputFilePath,

      // Map of array of compounds, by kind (Class, Interface, ...)
      compoundsMap: new Map(),

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: entryPointDataModel,
    }
    entryPointsSet.add(entryPoint)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    for (const compoundDataModel of entryPointDataModel.members) {
      if (options.debug) {
        console.log(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          compoundDataModel.kind,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          compoundDataModel.name,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          compoundDataModel.canonicalReference
        )
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const compoundKind: string = compoundDataModel.kind
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const compoundLabel: string = compoundDataModel.name
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const compoundId: string = compoundDataModel.name.toLowerCase()

      const compoundCategoryId = pluralise(compoundKind).toLowerCase()

      const inputFilePath = `${entryPointId}.${compoundId}.md`
      const permalink =
        `${outputBaseUrl}/${entryPointId}/` +
        `${compoundCategoryId}/${compoundId}`
      permalinksMapByPath.set(inputFilePath, permalink)

      // eslint-disable-next-line max-len
      const frontMatterSlug = `/${options.apiBaseUrl}/${entryPointId}/${compoundCategoryId}/${compoundId}`

      let compoundTitle = compoundLabel
      if (compoundKind === 'Function') {
        compoundTitle += '()'
      }

      const frontMatterTitle = `${compoundTitle} ${compoundKind.toLowerCase()}`

      const sidebarLabel = compoundTitle
      const sidebarId =
        `${options.apiFolderPath}/${entryPointId}/` +
        `${compoundCategoryId}/${compoundId}`

      // eslint-disable-next-line max-len
      const outputFilePath = `${entryPointId}/${compoundCategoryId}/${compoundId}.md`

      const compound: Compound = {
        kind: compoundKind,

        inputFilePath,
        permalink,

        frontMatterSlug,
        frontMatterTitle,

        sidebarLabel,
        sidebarId,

        outputFilePath,

        // Map of array of members, by kind (Constructor, Property, ...)
        membersMap: new Map(),

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: compoundDataModel,
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      let compoundsArray = entryPoint.compoundsMap.get(compoundDataModel.kind)
      if (compoundsArray === undefined) {
        compoundsArray = []
        entryPoint.compoundsMap.set(compound.kind, compoundsArray)
      }
      compoundsArray.push(compound)

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (compoundDataModel.members !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        for (const memberDataModel of compoundDataModel.members) {
          if (options.debug) {
            console.log(
              '  ',
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              memberDataModel.kind,
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              memberDataModel.name,
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              memberDataModel.canonicalReference
            )
          }

          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          const memberKind: string = memberDataModel.kind
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          const memberLabel: string = memberDataModel.name
          let memberTitle = memberLabel
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          let originalMemberId: string = memberDataModel.name

          let memberId: string | undefined = undefined

          if (memberKind === 'Constructor') {
            memberId = 'constructor'
            memberTitle = '(constructor)'
            originalMemberId = '_constructor_'
          } else {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if (memberDataModel.name !== undefined) {
              continue
            }

            originalMemberId = memberLabel
              .replaceAll(/[^a-zA-Z0-9]/g, '_')
              .toLowerCase()

            memberId = originalMemberId
          }

          // eslint-disable-next-line max-len
          const inputFilePath = `${entryPointId}.${compoundId}.${originalMemberId}.md`
          const permalink =
            `${outputBaseUrl}/${entryPointId}/` +
            `${compoundCategoryId}/${compoundId}/${memberId}`
          if (memberKind !== 'CallSignature') {
            // if(originalMemberId === undefined) {
            //   console.log(memberDataModel)
            // }
            permalinksMapByPath.set(inputFilePath, permalink)
          }

          const frontMatterSlug =
            `/${options.apiBaseUrl}/${entryPointId}/${compoundCategoryId}` +
            `/${compoundId}/${memberId}`

          if (memberKind === 'Method') {
            memberTitle += '()'
          }

          let titleKind = memberKind
          if (titleKind === 'PropertySignature') {
            titleKind = 'Property'
          }

          let escapedMemberId = memberId
          // Docusaurus ignores files that start with an underscore.
          // Surround with $ if the original name contains non-alphanumeric
          // characters
          if (originalMemberId.startsWith('_')) {
            escapedMemberId = `$${escapedMemberId}$`
          }

          const frontMatterTitle =
            memberKind !== 'Constructor'
              ? `${compoundLabel}.${memberTitle} ${titleKind.toLowerCase()}`
              : `${compoundLabel}.${memberTitle}`

          const sidebarLabel = memberTitle
          const sidebarId =
            `${options.apiFolderPath}/${entryPointId}/` +
            `${compoundCategoryId}/${compoundId}/${escapedMemberId}`

          const outputFilePath =
            `${entryPointId}/${compoundCategoryId}/${compoundId}/` +
            `${escapedMemberId}.md`

          const member: Member = {
            kind: memberKind,

            inputFilePath,
            permalink,

            frontMatterSlug,
            frontMatterTitle,

            sidebarLabel,
            sidebarId,

            outputFilePath,

            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            data: memberDataModel,
          }

          // if (memberId === undefined) {
          //   member.isHidden = true
          // }

          let membersArray = compound.membersMap.get(member.kind)
          if (membersArray === undefined) {
            membersArray = []
            compound.membersMap.set(member.kind, membersArray)
          }

          membersArray.push(member)
        }
      }
    }
  }

  if (options.debug) {
    for (const [keyPath, permalink] of permalinksMapByPath) {
      console.log(keyPath, '=>', permalink)
    }
  }

  return {
    topIndex,
    entryPointsSet,
    permalinksMapByPath,
  }
}

// ----------------------------------------------------------------------------
