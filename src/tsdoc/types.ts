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

// import { ApiModel } from "@microsoft/api-extractor-model"

// ----------------------------------------------------------------------------

export interface DataModel {
  jsons: DataModelJson[]
}

export interface DataModelJson {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: any

  kind: string // Package
  canonicalReference: string // @scope/name!
  name: string // @scope/name
  preserveMemberOrder: boolean
  members?: DataModelMember[]
}

export interface DataModelMember {
  kind: string // EntryPoint, Class
  canonicalReference: string
  docComment: string
  excerptTokens?: DataModelExcerpt[]
  fileUrlPath?: string
  releaseTag?: string // public
  isAbstract?: boolean
  name?: string // Possibly empty
  preserveMemberOrder: boolean
  isProtected?: boolean
  isReadonly?: boolean
  isOptional?: boolean
  isStatic?: boolean
  overloadIndex?: number
  propertyTypeTokenRange?: DataModelTypeTokenRange
  parameters?: DataModelParameter[]
  members?: DataModelMember[]
  extendsTokenRange?: DataModelTypeTokenRange
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  implementsTokenRanges: any[]
}

export interface DataModelExcerpt {
  kind: string
  text: string
  canonicalReference?: string
}

export interface DataModelParameter {
  parameterName: string
  parameterTypeTokenRange: DataModelTypeTokenRange
  isOptional: boolean
}

export interface DataModelTypeTokenRange {
  startIndex: number
  endIndex: number
}

// ----------------------------------------------------------------------------
