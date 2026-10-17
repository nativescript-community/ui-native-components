/**
 * App bar and page.
 * Android: Material `AppBarLayout` (lift on scroll, hide on scroll, M3 medium / large collapsing bar). iOS: the navigation bar (large title, blur, Liquid Glass buttons on iOS 26).
 * The bar reacts to the scrolling content (the collectionview, a scrollview...) of the page.
 * @module @nativescript-community/ui-appbar
 */

import { ActionBar, ActionItem, FormattedString, GridLayout, Page, View } from '@nativescript/core';
import { MenuItem } from '@nativescript-community/ui-menu';
import { AppBarBottomItem, AppBarScrollBehavior, AppBarSearchMode, AppBarSearchPlacement, AppBarSize } from './index-common';
export { AppBarBottomItem, AppBarScrollBehavior, AppBarSearchMode, AppBarSearchPlacement, AppBarSize };

/**
 * An ActionBar with scroll behaviors. Use it as the `actionBar` of an `AppPage` (Android needs the AppPage: it hosts the AppBarLayout).
 */
export class AppBar extends ActionBar {
    /** small (default), or medium / large: a title that collapses when the content scrolls (M3 collapsing bar / iOS large title) */
    size: AppBarSize;
    /** none (default), `lift` (elevation / separator only when content scrolls under the bar) or `hide` (leaves the screen when scrolling down) */
    scrollBehavior: AppBarScrollBehavior;
    /** iOS 26 and Android */
    subtitle: string;
    /** the title with spans */
    formattedTitle: FormattedString;
    /** the content goes under the bar: it is see through until the content scrolls (blur on iOS) */
    translucent: boolean;
    /** Android search style: `collapsible` (default, a search icon in the bar) or `bar` (Material 3 SearchBar under the title opening a full screen search, see `AppPage.searchContent`) */
    searchMode: AppBarSearchMode;
    /** iOS 26: where the search bar goes: `stacked` (under the title, default), `integrated` (a field / button in the bar), `integratedButton`, `integratedCentered`, `automatic`. Ignored before iOS 26 */
    searchPlacement: AppBarSearchPlacement;
    /** actions of a bar at the bottom of the page: iOS the bottom toolbar (Liquid Glass on iOS 26), Android a Material `BottomAppBar` (`scrollBehavior="hide"` hides it on scroll too) */
    bottomItems: AppBarBottomItem[];
    /** raised when a bottom item is tapped (`item`) */
    static bottomItemTapEvent: string;
    /** the scrolling view the bar follows. iOS: `setContentScrollView`. By default the first scrolling view found */
    scrollTarget: View;
}

/**
 * An action of the bar: the core `ActionItem` plus a menu and the prominent style.
 */
export class AppBarItem extends ActionItem {
    /** items of a menu shown when the action is tapped (iOS: the native menu of the bar button, Android: popup menu) */
    menu: MenuItem[];
    /** iOS 26: tinted Liquid Glass button */
    prominent: boolean;
    /** a badge on the action: a number, a text, or `true` for a dot (iOS 26 and Android) */
    badge: string | number | boolean;
}

/**
 * A Page whose content scrolls with the app bar.
 * Android: the page content is in a `CoordinatorLayout` NESTED in the root of the regular Page, so libraries that replace the root (gesturehandler) keep working.
 * iOS: a regular Page.
 */
export class AppPage extends Page {
    /** Android: the behavior used when the page `actionBar` is not an AppBar */
    scrollBehavior: AppBarScrollBehavior;
    /** views anchored to the page (a FAB, a bottom bar...): Android: not part of the scrolling content, which is taller than the screen while the bar is expanded */
    overlay: View;
    /** Android `searchMode="bar"`: the content of the full screen search (suggestions, results). Ignored on iOS */
    searchContent: View;
}

/** the layout to use as the `searchContent` of an AppPage */
export class AppPageSearchContent extends GridLayout {}

/** the layout to use as the `overlay` of an AppPage */
export class AppPageOverlay extends GridLayout {}
