import { CSSType, FormattedString, ImageSource, Property, View } from '@nativescript/core';

export type ToolbarShowAsAction = 'always' | 'ifRoom' | 'never';

/**
 * An action of the toolbar
 */
export interface ToolbarItem {
    id?: string | number;
    title?: string;
    /** `res://name`, a file path, `sys://name` (SF Symbol, iOS only), `font://code` (a glyph of the font-family of the toolbar), an ImageSource or a FormattedString (spans, as with `@nativescript-community/text`, drawn into an icon) */
    icon?: string | ImageSource | FormattedString;
    /** icon used on Android instead of `icon` */
    androidIcon?: string | ImageSource | FormattedString;
    /** icon used on iOS instead of `icon` */
    iosIcon?: string | ImageSource | FormattedString;
    /**
     * `always` (default when there is an icon): shown in the bar. `ifRoom`: same, Android moves it to the overflow when there is no room.
     * `never`: in the overflow menu (a menu on the trailing `ellipsis` button on iOS)
     */
    showAsAction?: ToolbarShowAsAction;
    disabled?: boolean;
    onTap?: (item: ToolbarItem) => void;
    [key: string]: any;
}

export const itemTapEvent = 'itemTap';
export const navigationTapEvent = 'navigationTap';

/**
 * Toolbar for a custom action bar: title, navigation icon and actions.
 * Android: Material 3 MaterialToolbar. iOS: a UINavigationBar used as a view (its bar buttons are glass on iOS 26).
 */
@CSSType('Toolbar')
export abstract class ToolbarBase extends View {
    public static itemTapEvent = itemTapEvent;
    public static navigationTapEvent = navigationTapEvent;

    public title: string;
    public subtitle: string;
    public navigationIcon: string | ImageSource | FormattedString;
    public items: ToolbarItem[];
    public centerTitle: boolean;

    protected notifyItemTap(item: ToolbarItem) {
        item.onTap?.(item);
        this.notify({ eventName: itemTapEvent, object: this, item });
    }
    protected notifyNavigationTap() {
        this.notify({ eventName: navigationTapEvent, object: this });
    }
}

export const titleProperty = new Property<ToolbarBase, string>({ name: 'title', defaultValue: '' });
titleProperty.register(ToolbarBase);
export const subtitleProperty = new Property<ToolbarBase, string>({ name: 'subtitle', defaultValue: '' });
subtitleProperty.register(ToolbarBase);
export const navigationIconProperty = new Property<ToolbarBase, string | ImageSource | FormattedString>({ name: 'navigationIcon' });
navigationIconProperty.register(ToolbarBase);
export const itemsProperty = new Property<ToolbarBase, ToolbarItem[]>({ name: 'items' });
itemsProperty.register(ToolbarBase);
export const centerTitleProperty = new Property<ToolbarBase, boolean>({ name: 'centerTitle', defaultValue: false, valueConverter: (v: any) => v === true || v === 'true' });
centerTitleProperty.register(ToolbarBase);
