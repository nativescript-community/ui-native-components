/**
 * App bar and page.
 * Android: Material `AppBarLayout` (lift on scroll, hide on scroll, M3 medium / large collapsing bar). iOS: the navigation bar (large title, blur, Liquid Glass buttons on iOS 26).
 * The bar reacts to the scrolling content (the collectionview, a scrollview...) of the page.
 * @module @nativescript-community/ui-appbar
 */

import { ActionBar, ActionItem, ContentView, FormattedString, GridLayout, Page, View } from '@nativescript/core';
import { MenuItem } from '@nativescript-community/ui-menu';
import { AppBarBottomBarStyle, AppBarBottomItem, AppBarScrollBehavior, AppBarSearchMode, AppBarSearchPlacement, AppBarSize, AppBarTitleAlignment } from './index-common';
export { AppBarBottomBarStyle, AppBarBottomItem, AppBarScrollBehavior, AppBarSearchMode, AppBarSearchPlacement, AppBarSize, AppBarTitleAlignment };

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
    /** Android search style: `collapsible` (default, a search icon in the bar), `bar` (Material 3 SearchBar under the title opening a full screen search, see `AppPage.searchContent`) or `inline` (the SearchBar turns into an editable field in place, your content is filtered from `searchChange`) */
    searchMode: AppBarSearchMode;
    /** iOS: `leading` aligns the inline title of a small bar to the left. Android: ignored (always at the start) */
    titleAlignment: AppBarTitleAlignment;
    /** closes an expanded `inline` search. Returns true when there was one to close (use it in a back button handler) */
    closeSearch(): boolean;
    /** focuses the search field (keyboard shortcut, menu command). Returns true when the bar is searchable */
    focusSearch(): boolean;
    /** iOS 26: where the search bar goes: `stacked` (under the title, default), `integrated` (a field / button in the bar), `integratedButton`, `integratedCentered`, `automatic`. Ignored before iOS 26 */
    searchPlacement: AppBarSearchPlacement;
    /** actions of a bar at the bottom of the page: iOS the bottom toolbar (Liquid Glass on iOS 26), Android a Material `BottomAppBar` (`scrollBehavior="hide"` hides it on scroll too) */
    bottomItems: AppBarBottomItem[];
    /** Android: the look of the `bottomItems`, a Material 3 `floating` toolbar (default) or a full width `bottomAppBar`. iOS: ignored */
    bottomBarStyle: AppBarBottomBarStyle;
    /** raised when a bottom item is tapped (`item`) */
    static bottomItemTapEvent: string;
    /** the scrolling view the bar follows. iOS: `setContentScrollView`. By default the first scrolling view found */
    scrollTarget: View;
    /** @platform android the view holding the text field of an `inline` search, in place of the built-in `EditText`: an `AppBarSearchField` or directly a `TextField` (core or `@nativescript-community/ui-textfield`). The bar wires `searchChange`, `searchSubmit` and the clear button to it */
    searchField: View;
    /** @platform android the view shown in the `floating` bottom toolbar in place of the `bottomItems` buttons: an `AppBarBottomView` or any view */
    bottomView: View;
    /** the `id` of the scrolling view the bar follows, used when `scrollTarget` is not set. Android: spares the search of the first scrolling view of the content, which is the default */
    scrollTargetId: string;
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

/** @platform android holds the text field of the `inline` search, the `searchField` of an AppBar (`<appBarSearchField>`) */
export class AppBarSearchField extends ContentView {}

/** @platform android holds the content of the floating bottom toolbar, the `bottomView` of an AppBar (`<appBarBottomView>`) */
export class AppBarBottomView extends ContentView {}

/** the layout to use as the `searchContent` of an AppPage */
export class AppPageSearchContent extends GridLayout {}

/** the layout to use as the `overlay` of an AppPage */
export class AppPageOverlay extends GridLayout {}
