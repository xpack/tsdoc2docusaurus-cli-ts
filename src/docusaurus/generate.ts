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
import assert from 'node:assert'

import type {
  SidebarCategory,
  SidebarCategoryItem,
  SidebarDocItem,
} from './types.js'
import type { FrontMatter, ViewModel } from './view-model/types.js'
import type { CliOptions } from './options.js'

// ----------------------------------------------------------------------------

async function readInputFileLines(filePath: string): Promise<string[]> {
  const inputData = await fs.readFile(filePath, 'utf8')
  return inputData.split('\n').map((line) => line.trimEnd())
}

let writtenFilesCount = 0

async function writeOutputFile({
  filePath,
  frontMatter,
  lines,
  options,
}: {
  filePath: string
  frontMatter: FrontMatter
  lines: string[]
  options: CliOptions
}): Promise<void> {
  const header = [
    '---',
    // '',
    // '# DO NOT EDIT!',
    // '# Automatically generated via tsdoc2docusaurus by API Documenter.',
    // '',
    `slug: ${frontMatter.slug}`,
    `title: ${frontMatter.title}`,
    'custom_edit_url: null',
    '---',
    '',
    '<div class="tsdocPage">',
    '',
  ]

  const footer = ['</div>']

  const outputContent = header.concat(lines).concat(footer).join('\n')
  await fs.mkdir(path.dirname(filePath), { recursive: true })

  if (options.verbose) {
    console.log(`Writing ${filePath}...`)
  }
  await fs.writeFile(filePath, outputContent, 'utf8')

  writtenFilesCount += 1
}

function patchLines(
  lines: string[],
  permalinksMapByPath: Map<string, string>
): string[] {
  const outLines = []

  let firstH2 = false

  for (const line of lines) {
    if (line.startsWith('[Home](./index.md)')) {
      continue // Skip the home link
    } else if (!firstH2 && line.startsWith('## ')) {
      firstH2 = true
      continue
    } else if (line.startsWith('**Signature:**')) {
      // Convert the signature line to a H2
      outLines.push('## Signature')
    } else if (line.startsWith('**Returns:**')) {
      // Convert the returns line to a H2
      outLines.push('## Returns')
    } else {
      // Patch links and other formatting
      outLines.push(patchPermalinks(line, permalinksMapByPath))
    }
  }
  return outLines
}

function patchPermalinks(
  line: string,
  permalinksMapByPath: Map<string, string>
): string {
  let patchedLine = line

  const matches = [...line.matchAll(/\]\([^(<>)]*\)/g)]
  if (matches.length > 0) {
    // console.log(matches)
    for (const match of matches) {
      const link = match[0]
      // Remove the leading `](` and trailing `)`
      const linkPath = link.slice(2, -1)
      if (linkPath.startsWith('./')) {
        // Relative link, patch it
        const relativePath = linkPath.slice(2)
        if (permalinksMapByPath.has(relativePath)) {
          const permalink = permalinksMapByPath.get(relativePath)
          assert(permalink !== undefined)
          // console.log(relativePath, '->', permalink)
          patchedLine = patchedLine.replace(link, `](${permalink})`)
          // console.log(patchedLine)
        } else {
          console.warn(`No permalink for ${relativePath}, skipping patch.`)
        }
      }
    }
  }

  return patchedLine
}

export async function generateMdFiles({
  viewModel,
  options,
}: {
  viewModel: ViewModel
  options: CliOptions
}): Promise<number> {
  const { entryPointsSet } = viewModel

  if (!options.verbose) {
    console.log('Writing .md files...')
  }

  const inputFolderPath = options.apiMarkdownInputFolderPath
  const outputFolderPath = `${options.docsFolderPath}/${options.apiFolderPath}`

  {
    const { topIndex } = viewModel
    const lines = await readInputFileLines(
      `${inputFolderPath}/${topIndex.inputFilePath}`
    )

    const patchLinesLines = patchLines(lines, viewModel.permalinksMapByPath)

    const frontMatter = {
      slug: topIndex.frontMatterSlug,
      title: topIndex.frontMatterTitle,
    }

    await writeOutputFile({
      filePath: `${outputFolderPath}/${topIndex.outputFilePath}`,
      frontMatter,
      lines: patchLinesLines,
      options,
    })
  }

  // --------------------------------------------------------------------------

  for (const entryPoint of entryPointsSet) {
    // console.log(entryPoint)
    const lines = await readInputFileLines(
      `${inputFolderPath}/${entryPoint.inputFilePath}`
    )

    const patchLinesLines = patchLines(lines, viewModel.permalinksMapByPath)

    const frontMatter = {
      slug: entryPoint.frontMatterSlug,
      title: entryPoint.frontMatterTitle,
    }

    await writeOutputFile({
      filePath: `${outputFolderPath}/${entryPoint.outputFilePath}`,
      frontMatter,
      lines: patchLinesLines,
      options,
    })

    // ------------------------------------------------------------------------

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [compoundKind, compoundsArray] of entryPoint.compoundsMap) {
      // console.log(`  ${compoundCategoryLabel}`)
      for (const compound of compoundsArray) {
        // console.log(`    ${compound.label}`)
        const lines = await readInputFileLines(
          `${inputFolderPath}/${compound.inputFilePath}`
        )

        const patchLinesLines = patchLines(lines, viewModel.permalinksMapByPath)

        const frontMatter = {
          slug: compound.frontMatterSlug,
          title: compound.frontMatterTitle,
        }

        // TODO: Insert members into compound (future improvement).
        await writeOutputFile({
          filePath: `${outputFolderPath}/${compound.outputFilePath}`,
          frontMatter,
          lines: patchLinesLines,
          options,
        })

        // --------------------------------------------------------------------

        if (compound.membersMap.size > 0) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          for (const [memberKind, membersArray] of compound.membersMap) {
            for (const member of membersArray) {
              // if (member.isHidden === true) {
              //   continue
              // }

              // console.log(
              //   `      ${member.label} ${member.name} ${member.id}`
              // )
              const lines = await readInputFileLines(
                `${inputFolderPath}/${member.inputFilePath}`
              )

              const patchLinesLines = patchLines(
                lines,
                viewModel.permalinksMapByPath
              )

              const frontMatter = {
                slug: member.frontMatterSlug,
                title: member.frontMatterTitle,
              }

              await writeOutputFile({
                filePath: `${outputFolderPath}/${member.outputFilePath}`,
                frontMatter,
                lines: patchLinesLines,
                options,
              })
            }
          }
        }
      }
    }
  }

  console.log(writtenFilesCount, 'files written')
  return 0
}

// ----------------------------------------------------------------------------

function generateSidebarCategory(viewModel: ViewModel): SidebarCategory {
  const { entryPointsSet } = viewModel

  const { topIndex } = viewModel

  const sidebarTopCategory: SidebarCategory = {
    type: 'category',
    label: topIndex.sidebarLabel,
    link: {
      type: 'doc',
      id: topIndex.sidebarId,
    },
    collapsed: false,
    items: [],
  }

  for (const entryPoint of entryPointsSet) {
    const entryPointCategory: SidebarCategory = {
      type: 'category',
      label: entryPoint.sidebarLabel,
      link: {
        type: 'doc',
        id: entryPoint.sidebarId,
      },
      collapsed: false,
      items: [],
    }
    sidebarTopCategory.items.push(entryPointCategory)

    for (const [kind, compoundsArray] of entryPoint.compoundsMap) {
      const compoundCategoryLabel = pluralise(kind)
      const kindCategory: SidebarCategoryItem = {
        type: 'category',
        label: compoundCategoryLabel,
        collapsed: true,
        items: [],
      }
      entryPointCategory.items.push(kindCategory)

      for (const compound of compoundsArray) {
        const compoundCategory: SidebarCategoryItem = {
          type: 'category',
          label: compound.sidebarLabel,
          link: {
            type: 'doc',
            id: compound.sidebarId,
          },
          collapsed: true,
          items: [],
        }
        kindCategory.items.push(compoundCategory)

        if (compound.membersMap.size > 0) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          for (const [memberKind, membersArray] of compound.membersMap) {
            for (const member of membersArray) {
              // Explicitly handle nullable boolean for isHidden
              // if (member.isHidden === true) {
              // console.warn(
              //   `Skipping member without name in ${compoundLabel}: ` +
              //   `${member.data.canonicalReference}`
              // );
              //  continue
              // }

              const memberDoc: SidebarDocItem = {
                type: 'doc',
                id: member.sidebarId,
                label: member.sidebarLabel,
              }
              compoundCategory.items.push(memberDoc)
            }
          }
        }
      }
    }
  }

  return sidebarTopCategory
}

// ----------------------------------------------------------------------------

export function pluralise(name: string): string {
  const plurals: Record<string, string> = {
    Class: 'Classes',
    Interface: 'Interfaces',
    Function: 'Functions',
    Variable: 'Variables',
    'Type alias': 'Type aliases',
    Namespace: 'Namespaces',
    Enum: 'Enums',
    Method: 'Methods',
    Property: 'Properties',
  }

  if (Object.prototype.hasOwnProperty.call(plurals, name)) {
    return plurals[name]
  }

  console.warn(`No plural for ${name}, using default.`)
  return name + 's?'
}

// ----------------------------------------------------------------------------

export async function generateSidebar({
  viewModel,
  options,
}: {
  viewModel: ViewModel
  options: CliOptions
}): Promise<number> {
  const sidebar = generateSidebarCategory(viewModel)
  // console.log(util.inspect(sidebar, { compact: false, depth: 999 }));
  // Write the sidebar to file.

  const sidebarFilePath = options.sidebarCategoryFilePath
  try {
    console.log(`Writing sidebar file ${sidebarFilePath}`)
    const sidebarJson = JSON.stringify(sidebar, null, 2)
    await fs.writeFile(sidebarFilePath, sidebarJson)
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(
        `Could not write sidebar file ${sidebarFilePath}: ${err.message}`
      )
    } else {
      console.error(
        `Could not write sidebar file ${sidebarFilePath}: Unknown error`
      )
    }
    return 1
  }

  return 0
}

// ----------------------------------------------------------------------------
