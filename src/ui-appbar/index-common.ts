import { ActionBar, ActionItem, Color, ContentView, EventData, FormattedString, GridLayout, ImageSource, ItemSpec, Property, View, ViewBase, isAndroid } from '@nativescript/core';
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
/** iOS: `leading` aligns the inline title of a small bar to the left (navigation item style `browser`), `center` is the system default. Android: the title of a small bar is always at the start */
export type AppBarTitleAlignment = 'center' | 'leading';
export const titleAlignmentProperty = new Property<AppBarBase, AppBarTitleAlignment>({ name: 'titleAlignment', defaultValue: 'center', valueChanged: changed });
export const subtitleProperty = new Property<AppBarBase, string>({ name: 'subtitle', valueChanged: changed });
export const formattedTitleProperty = new Property<AppBarBase, FormattedString | object>({ name: 'formattedTitle', valueChanged: changed });
export const translucentProperty = new Property<AppBarBase, boolean>({ name: 'translucent', defaultValue: false, valueConverter: (v: any) => v === true || v === 'true' || v === '', valueChanged: changed });
export const searchableProperty = new Property<AppBarBase, boolean>({ name: 'searchable', defaultValue: false, valueConverter: (v: any) => v === true || v === 'true' || v === '', valueChanged: changed });
export const searchHintProperty = new Property<AppBarBase, string>({ name: 'searchHint', valueChanged: changed });
export const scrollTargetProperty = new Property<AppBarBase, View>({ name: 'scrollTarget', valueChanged: changed });
export const scrollTargetIdProperty = new Property<AppBarBase, string>({ name: 'scrollTargetId', valueChanged: changed });

function itemChanged(target: AppBarItem) {
    (target.actionBar as AppBarBase)?.update?.();
}
export const badgeProperty = new Property<AppBarItem, string | number | boolean>({ name: 'badge', valueChanged: itemChanged });
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
    /** a badge on the action: a number, a text, or `true` for a dot. iOS 26 and Android */
    badge: string | number | boolean;

    // a view inside the item is its `actionView`: <appBarItem><uibutton .../></appBarItem>
    _addChildFromBuilder(name: string, value: any) {
        if (value instanceof View) {
            this.actionView = value;
        } else {
            // @ts-ignore
            super._addChildFromBuilder?.(name, value);
        }
    }

    _raiseTap() {
        if (this.actionView) {
            // the core takes the touches of the action view (Android click listener, iOS tap recognizer) for the tap of the item: the view gets its own `tap` event
            this.actionView.notify({ eventName: 'tap', object: this.actionView });
        }
        if (isAndroid && this.menu?.length && this.actionBar) {
            showMenu({ anchor: (this.actionBar as AppBarBase).getMenuAnchor(), items: this.menu, placement: { horizontal: 'end', vertical: 'below' } });
            return;
        }
        super._raiseTap();
    }
}
menuProperty.register(AppBarItem);
badgeProperty.register(AppBarItem);
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
    /** iOS 26: the search field of the bar, in the bottom toolbar (needs `searchable` and `searchPlacement="integrated"`). Android: ignored */
    search?: boolean;
    /** a badge on the action: a number, a text, or `true` for a dot */
    badge?: string | number | boolean;
    /** items of a menu shown when the button is tapped (no `onTap`): iOS native menu, Android popup menu above the bar */
    menu?: MenuItem[];
    /** the tint of the button (a destructive action in red, an accent...): its icon and text, on both platforms. Default: the color of the bar */
    color?: string | Color;
    /** called when the action is tapped */
    onTap?: (item: AppBarBottomItem) => void;
    [key: string]: any;
}

/**
 * collapsible: a search icon in the bar that expands (Android SearchView action).
 * bar: Android Material 3 `SearchBar` under the title that opens a full screen `SearchView`.
 * inline: Android Material 3 `SearchBar` that turns into an editable field in place: the search filters the current content, no full screen view.
 * iOS: always the `UISearchController`
 */
export type AppBarSearchMode = 'collapsible' | 'bar' | 'inline';
export const searchModeProperty = new Property<AppBarBase, AppBarSearchMode>({ name: 'searchMode', defaultValue: 'collapsible', valueChanged: changed });

/** iOS 26 placement of the search bar of the navigation bar: stacked (under the title, default), integrated (a field / button in the bar), integratedButton (always a button), integratedCentered (centered on iPad), automatic */
export type AppBarSearchPlacement = 'automatic' | 'stacked' | 'integrated' | 'integratedButton' | 'integratedCentered';
export const searchPlacementProperty = new Property<AppBarBase, AppBarSearchPlacement>({ name: 'searchPlacement', defaultValue: 'stacked', valueChanged: changed });

/** Android look of `bottomItems`: a Material 3 `floating` toolbar (default, a pill over the content) or a full width `bottomAppBar`. iOS: ignored (UIToolbar) */
export type AppBarBottomBarStyle = 'floating' | 'bottomAppBar';
export const bottomBarStyleProperty = new Property<AppBarBase, AppBarBottomBarStyle>({ name: 'bottomBarStyle', valueChanged: changed });

export const bottomItemsProperty = new Property<AppBarBase, AppBarBottomItem[]>({ name: 'bottomItems', valueChanged: changed });

/**
 * Android `searchMode="inline"`: holds the text field of the search in place of the built-in one, a core `TextField` or a `@nativescript-community/ui-textfield`: `<appBarSearchField><uitextfield /></appBarSearchField>`. Ignored on iOS.
 */
export class AppBarSearchField extends ContentView {}

/**
 * Android `bottomBarStyle="floating"`: holds the content of the floating toolbar in place of the `bottomItems` buttons: `<appBarBottomView><stacklayout orientation="horizontal">...</stacklayout></appBarBottomView>`. Ignored on iOS.
 */
export class AppBarBottomView extends ContentView {}

export class AppBarBase extends ActionBar {
    static bottomItemTapEvent = 'bottomItemTap';
    /** actions of a bar at the bottom of the page: iOS the bottom toolbar, Android a `BottomAppBar` */
    bottomItems: AppBarBottomItem[];
    /** Android: the look of the `bottomItems`, a `floating` toolbar (default) or a `bottomAppBar` (badges are only shown by the bottomAppBar) */
    bottomBarStyle: AppBarBottomBarStyle;

    /** raised when the text of the search changes */
    static searchChangeEvent = 'searchChange';
    /** raised when the search is submitted (keyboard search key) */
    static searchSubmitEvent = 'searchSubmit';
    /** raised when the search is closed / cancelled */
    static searchCancelEvent = 'searchCancel';
    /** adds a search: iOS `UISearchController` under the title, Android a collapsible `SearchView` action */
    searchable: boolean;
    searchHint: string;
    searchMode: AppBarSearchMode;
    searchPlacement: AppBarSearchPlacement;
    /** the current text of the search (read only) */
    searchText = '';

    private _searchField: View;
    private _bottomView: View;

    /** Android `inline` search: the view holding the text field of the search (an `AppBarSearchField`, or directly a `TextField`), instead of the built-in `EditText` */
    get searchField(): View {
        return this._searchField;
    }
    set searchField(value: View) {
        this._searchField = this.swapHostedView(this._searchField, value);
        this.onAppBarPropertyChanged();
    }

    /** Android `floating` bottom toolbar: the view shown in the toolbar instead of the `bottomItems` buttons */
    get bottomView(): View {
        return this._bottomView;
    }
    set bottomView(value: View) {
        this._bottomView = this.swapHostedView(this._bottomView, value);
        this.onAppBarPropertyChanged();
    }

    // the native views of the hosted views are placed by the page, not by the bar
    private swapHostedView(current: View, value: View) {
        if (current !== value && isAndroid) {
            if (current) {
                this._removeView(current);
            }
            if (value) {
                this._addView(value);
            }
        }
        return value;
    }

    eachChildView(callback: (child: View) => boolean) {
        super.eachChildView(callback);
        [this._searchField, this._bottomView].forEach((view) => view && callback(view));
    }

    // the core ActionBar only lists the title view, the items and the navigation button: the hosted views are also set up and loaded with the bar
    eachChild(callback: (child: ViewBase) => boolean) {
        super.eachChild(callback);
        [this._searchField, this._bottomView].forEach((view) => view && callback(view));
    }

    _addChildFromBuilder(name: string, value: any) {
        if (value instanceof AppBarSearchField) {
            this.searchField = value;
        } else if (value instanceof AppBarBottomView) {
            this.bottomView = value;
        } else {
            // @ts-ignore
            super._addChildFromBuilder?.(name, value);
        }
    }

    /** closes an expanded `inline` search. Returns true when there was one to close (use it in a back button handler) */
    closeSearch(): boolean {
        return false;
    }

    /** focuses the search field (keyboard shortcut, menu command). Returns true when the bar is searchable */
    focusSearch(): boolean {
        return false;
    }

    size: AppBarSize;
    scrollBehavior: AppBarScrollBehavior;
    titleAlignment: AppBarTitleAlignment;
    subtitle: string;
    /** the title with spans (needs `@nativescript-community/text` for the full support) */
    /** spans, or a native rich text (`createNativeAttributedString`) used as is */
    formattedTitle: FormattedString | object;
    /** the content goes under the bar, the bar is see through until the content scrolls */
    translucent: boolean;
    /** the scrolling view (collectionview, scrollview...) that drives the bar. By default the first one found */
    scrollTarget: View;
    /** same as `scrollTarget`, by `id` in the page: spares the search of the scrolling view */
    scrollTargetId: string;

    /** the scrolling view the bar follows: `scrollTarget`, else the view of the page with the id `scrollTargetId` */
    getScrollTarget(): View {
        return this.scrollTarget ?? (this.scrollTargetId ? this.page?.getViewById(this.scrollTargetId) : null) ?? null;
    }

    onAppBarPropertyChanged() {
        this.update();
    }

    /** @internal the view the menu of an action opens under */
    getMenuAnchor(): View {
        return this;
    }
}
sizeProperty.register(AppBarBase);
scrollBehaviorProperty.register(AppBarBase);
subtitleProperty.register(AppBarBase);
titleAlignmentProperty.register(AppBarBase);
formattedTitleProperty.register(AppBarBase);
translucentProperty.register(AppBarBase);
scrollTargetProperty.register(AppBarBase);
scrollTargetIdProperty.register(AppBarBase);
searchableProperty.register(AppBarBase);
searchHintProperty.register(AppBarBase);
bottomItemsProperty.register(AppBarBase);
bottomBarStyleProperty.register(AppBarBase);
searchModeProperty.register(AppBarBase);
searchPlacementProperty.register(AppBarBase);

/**
 * Layout for the views anchored to the page itself (a floating action button, a bottom bar...), not to the scrolling content: use it as the `overlay` of an AppPage.
 * Android: the content of an AppPage is taller than the screen while the bar is expanded (the content moves up when the bar collapses), so a view anchored to the bottom of the content would be off screen.
 */
export class AppPageOverlay extends GridLayout {
    constructor() {
        super();
        // explicit star row and column: the children are aligned in the whole page, also when the keyboard changes its size
        this.addRow(new ItemSpec(1, 'star'));
        this.addColumn(new ItemSpec(1, 'star'));
    }
}

/** raises the tap of a bottom item: the `onTap` of the item and the `bottomItemTap` event of the bar */
export function notifyBottomItemTap(bar: AppBarBase, item: AppBarBottomItem) {
    item.onTap?.(item);
    bar.notify({ eventName: AppBarBase.bottomItemTapEvent, object: bar, item } as any);
}

/**
 * Android `searchMode="bar"`: the content of the full screen search (suggestions, results): use it as the `searchContent` of an AppPage. Ignored on iOS.
 */
export class AppPageSearchContent extends GridLayout {}
