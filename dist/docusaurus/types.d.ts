export interface SidebarCategory {
    type: 'category';
    label: string;
    link: {
        type: 'doc';
        id: string;
    };
    className?: string;
    collapsed: boolean;
    items: SidebarItem[];
}
export interface SidebarDocItem {
    type: 'doc';
    label: string;
    className?: string;
    id: string;
}
export interface SidebarCategoryItem {
    type: 'category';
    label: string;
    link?: {
        type: 'doc';
        id: string;
    };
    className?: string;
    collapsed: boolean;
    items: SidebarItem[];
}
export type SidebarItem = SidebarDocItem | SidebarCategoryItem;
export interface NavbarItem {
    type?: string;
    label: string;
    to: string;
    position?: 'left' | 'right';
    items?: NavbarItem[];
}
//# sourceMappingURL=types.d.ts.map