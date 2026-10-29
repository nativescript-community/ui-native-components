import type { FormattedString, ImageSource, View } from '@nativescript/core';

/**
 * An entry of a menu.
 * Use `{ separator: true, title?: string }` to start a new section, with an optional title above it (a segment on Android, an inline group on iOS).
 */
export interface MenuItem {
    /** returned when the item is selected */
    id?: string | number;
    title?: string;
    /** shown below the title (iOS only) */
    subtitle?: string;
    /** `sys://name` (SF Symbol, iOS), `res://name` or a file path, an ImageSource, or a FormattedString (spans drawn into an icon) */
    icon?: string | ImageSource | FormattedString;
    /** shows a check mark when true (Android: a tonal row, for a single choice) */
    checked?: boolean;
    /** a setting which is on or off: the state is `checked`, Android draws a switch instead of a tonal row */
    toggle?: boolean;
    /** red item */
    destructive?: boolean;
    disabled?: boolean;
    /** a submenu */
    items?: MenuItem[];
    /** starts a new section, `title` is the label of the section */
    separator?: boolean;
    /** called when the item is selected */
    onSelect?: (item: MenuItem) => void;
    /** free data */
    [key: string]: any;
}

/**
 * Where the menu opens relative to its anchor.
 * Android: `vertical` above/below and `horizontal` start/end (center behaves like start). The system flips the menu when there is no room.
 * iOS: the system chooses the side with room, the placement sets the attachment point of the menu.
 */
export interface MenuPlacement {
    horizontal?: 'start' | 'center' | 'end';
    vertical?: 'auto' | 'above' | 'below';
}

export interface ShowMenuOptions {
    /** the view the menu is attached to */
    anchor: View;
    items: MenuItem[];
    /** title of the menu (iOS only) */
    title?: string;
    /** where the menu opens, relative to the anchor */
    placement?: MenuPlacement;
}

export interface ContextMenuOptions {
    placement?: MenuPlacement;
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

export interface MenuSection {
    title?: string;
    items: MenuItem[];
}

/**
 * Splits the items on the separators, keeping the title of each section
 */
export function getSections(items: MenuItem[]): MenuSection[] {
    const sections: MenuSection[] = [{ items: [] }];
    for (const item of items) {
        if (item.separator) {
            const current = sections[sections.length - 1];
            if (!current.items.length && !current.title) {
                current.title = item.title;
            } else if (current.items.length) {
                sections.push({ title: item.title, items: [] });
            }
        } else {
            sections[sections.length - 1].items.push(item);
        }
    }
    return sections.filter((section) => section.items.length);
}
