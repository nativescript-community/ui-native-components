import type { View } from '@nativescript/core';

/**
 * An entry of a menu.
 * Use `{ separator: true }` to start a new section (a divider on Android, an inline group on iOS).
 */
export interface MenuItem {
    /** returned when the item is selected */
    id?: string | number;
    title?: string;
    /** shown below the title (iOS only) */
    subtitle?: string;
    /** `sys://name` (SF Symbol, iOS), `res://name` or a file path */
    icon?: string;
    /** shows a check mark when true */
    checked?: boolean;
    /** red item */
    destructive?: boolean;
    disabled?: boolean;
    /** a submenu */
    items?: MenuItem[];
    /** starts a new section */
    separator?: boolean;
    /** called when the item is selected */
    onSelect?: (item: MenuItem) => void;
    /** free data */
    [key: string]: any;
}

export interface ShowMenuOptions {
    /** the view the menu is attached to */
    anchor: View;
    items: MenuItem[];
    /** title of the menu (iOS only) */
    title?: string;
}

export interface ContextMenuOptions {
    /** the items, or a function called each time the menu opens */
    items: MenuItem[] | (() => MenuItem[]);
    title?: string;
    onSelect?: (item: MenuItem) => void;
}

/**
 * Splits the items on the separators
 */
export function splitSections(items: MenuItem[]): MenuItem[][] {
    const sections: MenuItem[][] = [[]];
    for (const item of items) {
        if (item.separator) {
            if (sections[sections.length - 1].length) {
                sections.push([]);
            }
        } else {
            sections[sections.length - 1].push(item);
        }
    }
    return sections.filter((s) => s.length);
}
