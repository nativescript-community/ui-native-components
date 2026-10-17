/**
 * Toolbar for a custom action bar: a title, a navigation icon, action items and an overflow menu.
 * Android: Material 3 `MaterialToolbar`. iOS: a `UINavigationBar` used as a view, its bar buttons get the Liquid Glass capsules on iOS 26.
 * `background-color` and `color` apply to the bar and its icons.
 * @module @nativescript-community/ui-toolbar
 */

import { EventData, FormattedString, ImageSource, View } from '@nativescript/core';
import { ToolbarItem, ToolbarShowAsAction } from './index-common';
export { ToolbarItem, ToolbarShowAsAction };

export interface ToolbarItemTapEventData extends EventData {
    item: ToolbarItem;
}

export class Toolbar extends View {
    /** name of the event raised when an action is tapped */
    static itemTapEvent: string;
    /** name of the event raised when the navigation icon is tapped */
    static navigationTapEvent: string;

    title: string;
    subtitle: string;
    /** icon at the start of the bar: back, menu, close... */
    navigationIcon: string | ImageSource | FormattedString;
    /** the actions */
    items: ToolbarItem[];
    /** Android: the title is centered (always centered on iOS) */
    centerTitle: boolean;
}
