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

export function formatDuration(n: number): string {
  if (n < 1000) {
    return `${n} ms`
  } else if (n < 100000) {
    return `${(n / 1000).toFixed(1)} sec`
  } else {
    return `${(n / 60000).toFixed(1)} min`
  }
}

// ----------------------------------------------------------------------------
