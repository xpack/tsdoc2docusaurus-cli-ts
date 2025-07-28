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
// Docusaurus sidebar.

export interface SidebarCategory {
  type: 'category'
  label: string
  link: {
    type: 'doc'
    id: string
  }
  className?: string
  collapsed: boolean
  items: SidebarItem[]
}

export interface SidebarDocItem {
  type: 'doc'
  label: string
  className?: string
  id: string
}

export interface SidebarCategoryItem {
  type: 'category'
  label: string
  link?: {
    type: 'doc'
    id: string
  }
  className?: string
  collapsed: boolean
  items: SidebarItem[]
}

export type SidebarItem = SidebarDocItem | SidebarCategoryItem

// ----------------------------------------------------------------------------

// https://docusaurus.io/docs/api/themes/configuration#navbar-items

export interface NavbarItem {
  type?: string // 'dropdown'
  label: string
  to: string
  position?: 'left' | 'right'
  items?: NavbarItem[]
}

// ----------------------------------------------------------------------------
