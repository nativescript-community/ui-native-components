/**
 * App bar and page.
 * Android: Material `AppBarLayout` (lift on scroll, hide on scroll, M3 medium / large collapsing bar). iOS: the navigation bar (large title, blur, Liquid Glass buttons on iOS 26).
 * The bar reacts to the scrolling content (the collectionview, a scrollview...) of the page.
 * @module @nativescript-community/ui-appbar
 */

import { ActionBar, FormattedString, Page, View } from '@nativescript/core';
import { AppBarScrollBehavior, AppBarSize } from './index-common';
export { AppBarScrollBehavior, AppBarSize };

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
    /** the scrolling view the bar follows. iOS: `setContentScrollView`. By default the first scrolling view found */
    scrollTarget: View;
}

/**
 * A Page whose content scrolls with the app bar.
 * Android: the page content is in a `CoordinatorLayout` NESTED in the root of the regular Page, so libraries that replace the root (gesturehandler) keep working.
 * iOS: a regular Page.
 */
export class AppPage extends Page {
    /** Android: the behavior used when the page `actionBar` is not an AppBar */
    scrollBehavior: AppBarScrollBehavior;
}
