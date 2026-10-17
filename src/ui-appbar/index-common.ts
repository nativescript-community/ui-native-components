import { ActionBar, ActionItem, EventData, FormattedString, GridLayout, ImageSource, Property, View, isAndroid } from '@nativescript/core';
import { MenuItem, showMenu } from '@nativescript-community/ui-menu';

/** small: standard bar, medium / large: a title that collapses on scroll (M3 collapsing app bar on Android, large title on iOS) */
export type AppBarSize = 'small' | 'medium' | 'large';
/**
 * none: the bar stays,
 * lift: the bar gets an elevation / separator only when the content scrolls under it,
 * hide: the bar leaves the screen when scrolling down and comes back when scrolling up
 */
export type AppBarScrollBehavior = 'none' | 'lift' | 'hide';

function changed(target: AppBarBase) {
    target.onAppBarPropertyChanged();
}

export const sizeProperty = new Property<AppBarBase, AppBarSize>({ name: 'size', defaultValue: 'small', valueChanged: changed });
export const scrollBehaviorProperty = new Property<AppBarBase, AppBarScrollBehavior>({ name: 'scrollBehavior', defaultValue: 'none', valueChanged: changed });
export const subtitleProperty = new Property<AppBarBase, string>({ name: 'subtitle', valueChanged: changed });
export const formattedTitleProperty = new Property<AppBarBase, FormattedString>({ name: 'formattedTitle', valueChanged: changed });
export const translucentProperty = new Property<AppBarBase, boolean>({ name: 'translucent', defaultValue: false, valueConverter: (v: any) => v === true || v === 'true' || v === '', valueChanged: changed });
export const searchableProperty = new Property<AppBarBase, boolean>({ name: 'searchable', defaultValue: false, valueConverter: (v: any) => v === true || v === 'true' || v === '', valueChanged: changed });
export const searchHintProperty = new Property<AppBarBase, string>({ name: 'searchHint', valueChanged: changed });
export const scrollTargetProperty = new Property<AppBarBase, View>({ name: 'scrollTarget', valueChanged: changed });

function itemChanged(target: AppBarItem) {
    (target.actionBar as AppBarBase)?.update?.();
}
export const menuProperty = new Property<AppBarItem, MenuItem[]>({ name: 'menu', valueChanged: itemChanged });
export const prominentProperty = new Property<AppBarItem, boolean>({ name: 'prominent', defaultValue: false, valueConverter: (v: any) => v === true || v === 'true' || v === '', valueChanged: itemChanged });

/**
 * An action of the bar. In addition to the core `ActionItem` (text, icon, `actionView`, `android.position`...):
 * - `menu`: items of a menu shown when the action is tapped (iOS: native menu of the bar button, Android: popup menu)
 * - `prominent`: iOS 26 tinted Liquid Glass button
 */
export class AppBarItem extends ActionItem {
    menu: MenuItem[];
    prominent: boolean;

    _raiseTap() {
        if (isAndroid && this.menu?.length && this.actionBar) {
            showMenu({ anchor: this.actionBar, items: this.menu, placement: { horizontal: 'end', vertical: 'below' } });
            return;
        }
        super._raiseTap();
    }
}
menuProperty.register(AppBarItem);
prominentProperty.register(AppBarItem);

export interface AppBarSearchEventData extends EventData {
    text: string;
}

/**
 * An action of the bottom bar (`bottomItems`): iOS a button of the bottom toolbar (Liquid Glass on iOS 26), Android an action of the Material `BottomAppBar`.
 */
export interface AppBarBottomItem {
    /** `sys://name` (SF Symbol, iOS), `res://name` or a file path, an ImageSource, or a FormattedString */
    icon?: string | ImageSource | FormattedString;
    text?: string;
    /** iOS: a flexible space between the buttons. Android: ignored (the actions are at the end of the bar) */
    spacer?: boolean;
    /** called when the action is tapped */
    onTap?: (item: AppBarBottomItem) => void;
    [key: string]: any;
}

export const bottomItemsProperty = new Property<AppBarBase, AppBarBottomItem[]>({ name: 'bottomItems', valueChanged: changed });

export class AppBarBase extends ActionBar {
    static bottomItemTapEvent = 'bottomItemTap';
    /** actions of a bar at the bottom of the page: iOS the bottom toolbar, Android a `BottomAppBar` */
    bottomItems: AppBarBottomItem[];

    /** raised when the text of the search changes */
    static searchChangeEvent = 'searchChange';
    /** raised when the search is submitted (keyboard search key) */
    static searchSubmitEvent = 'searchSubmit';
    /** raised when the search is closed / cancelled */
    static searchCancelEvent = 'searchCancel';
    /** adds a search: iOS `UISearchController` under the title, Android a collapsible `SearchView` action */
    searchable: boolean;
    searchHint: string;
    /** the current text of the search (read only) */
    searchText = '';

    size: AppBarSize;
    scrollBehavior: AppBarScrollBehavior;
    subtitle: string;
    /** the title with spans (needs `@nativescript-community/text` for the full support) */
    formattedTitle: FormattedString;
    /** the content goes under the bar, the bar is see through until the content scrolls */
    translucent: boolean;
    /** the scrolling view (collectionview, scrollview...) that drives the bar. By default the first one found */
    scrollTarget: View;

    onAppBarPropertyChanged() {
        this.update();
    }
}
sizeProperty.register(AppBarBase);
scrollBehaviorProperty.register(AppBarBase);
subtitleProperty.register(AppBarBase);
formattedTitleProperty.register(AppBarBase);
translucentProperty.register(AppBarBase);
scrollTargetProperty.register(AppBarBase);
searchableProperty.register(AppBarBase);
searchHintProperty.register(AppBarBase);
bottomItemsProperty.register(AppBarBase);

/**
 * Layout for the views anchored to the page itself (a floating action button, a bottom bar...), not to the scrolling content: use it as the `overlay` of an AppPage.
 * Android: the content of an AppPage is taller than the screen while the bar is expanded (the content moves up when the bar collapses), so a view anchored to the bottom of the content would be off screen.
 */
export class AppPageOverlay extends GridLayout {}

/** raises the tap of a bottom item: the `onTap` of the item and the `bottomItemTap` event of the bar */
export function notifyBottomItemTap(bar: AppBarBase, item: AppBarBottomItem) {
    item.onTap?.(item);
    bar.notify({ eventName: AppBarBase.bottomItemTapEvent, object: bar, item } as any);
}
