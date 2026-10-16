/**
 * Pull to refresh for a scrollable view (CollectionView, ListView, ScrollView, WebView...), from the top and the bottom.
 * Android uses SwipeRefreshLayout (+ a nested scrolling pull for the bottom). iOS uses UIRefreshControl (+ a pull at the end of the scrolling for the other edge).
 * The edges are visual: a CollectionView with `reverseLayout` (chat) is supported, `top` stays the top of the screen.
 * @module @nativescript-community/ui-refreshlayout
 */

import { Color, ContentView } from '@nativescript/core';

export class RefreshLayout extends ContentView {
    /** event of the pull from the top */
    public static refreshEvent: string;
    /** event of the pull from the bottom */
    public static bottomRefreshEvent: string;

    /** native SwipeRefreshLayout. Android only */
    android: any;
    /** the container UIView. Use `refreshControl` to access the UIRefreshControl. iOS only */
    ios: any;
    /** the native UIRefreshControl, `undefined` when the content has no scroll at the start of its content. iOS only */
    refreshControl?: any;

    /** the top refresh is running. Set it to false when the work is done */
    refreshing: boolean;
    /** the bottom refresh is running. Set it to false when the work is done */
    bottomRefreshing: boolean;
    /** the pull from the top triggers a refresh. Default: true */
    topEnabled: boolean;
    /** the pull from the bottom triggers a bottomRefresh. Default: false */
    bottomEnabled: boolean;
    /** color of the spinner */
    indicatorColor: Color;
    /** background color of the spinner */
    indicatorFillColor: Color;
}
