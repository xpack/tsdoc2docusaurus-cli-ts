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

export function formatDuration(millis: number): string {
  if (millis < 1000) {
    return `${String(millis)} ms`
  } else if (millis < 100000) {
    return `${(millis / 1000).toFixed(1)} sec`
  } else {
    return `${(millis / 60000).toFixed(1)} min`
  }
}

// ----------------------------------------------------------------------------

export function pluralise(name: string): string {
  const plurals: Record<string, string> = {
    Class: 'Classes',
    Interface: 'Interfaces',
    Function: 'Functions',
    Variable: 'Variables',
    'Type alias': 'Type Aliases',
    TypeAlias: 'Type Aliases',
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
