/**
 * Menus.
 * Android uses the Material 3 PopupMenu. iOS uses the native UIMenu: shown from a view (iOS 17.4+, an action sheet before) or as a context menu.
 * @module @nativescript-community/ui-menu
 */

import { View } from '@nativescript/core';
import { ContextMenuOptions, MenuItem, ShowMenuOptions } from './menu-common';
export * from './menu-common';

/**
 * Shows a menu attached to the `anchor` view.
 * @returns the selected item, or undefined when the menu is dismissed
 */
export function showMenu(options: ShowMenuOptions): Promise<MenuItem | undefined>;

/**
 * Sets a menu shown on long press of the view (native context menu on iOS).
 * @returns a function removing the menu
 */
export function setContextMenu(view: View, options: ContextMenuOptions): () => void;
