import { CSSType, Color, ContentView, CssProperty, Property, Style, booleanConverter } from '@nativescript/core';

/**
 * A layout with the pull to refresh pattern for its content (a CollectionView, ListView, ScrollView, WebView...).
 * The edges are visual: `top` is the top of the screen, also for a CollectionView with `reverseLayout` (chat).
 * Same API as `@nativescript-community/ui-refreshlayout`: `refreshing`, the `refresh` event, `indicatorColor`, `indicatorFillColor`.
 */
@CSSType('RefreshLayout')
export abstract class RefreshLayoutBase extends ContentView {
    public static refreshEvent = 'refresh';
    public static bottomRefreshEvent = 'bottomRefresh';

    /**
     * the top refresh is running. Set it to false when the work is done
     */
    public refreshing: boolean;
    /**
     * the bottom refresh is running. Set it to false when the work is done
     */
    public bottomRefreshing: boolean;
    /**
     * the pull from the top triggers a refresh. Default: true
     */
    public topEnabled: boolean;
    /**
     * the pull from the bottom triggers a bottomRefresh. Default: false
     */
    public bottomEnabled: boolean;

    get indicatorColor(): Color {
        return (this.style as any).indicatorColor;
    }
    set indicatorColor(value: Color) {
        (this.style as any).indicatorColor = value;
    }
    get indicatorFillColor(): Color {
        return (this.style as any).indicatorFillColor;
    }
    set indicatorFillColor(value: Color) {
        (this.style as any).indicatorFillColor = value;
    }

    /**
     * true when the content shows its last item at the top (CollectionView `reverseLayout`: chat)
     */
    protected get contentReversed() {
        return !!(this.content as any)?.reverseLayout;
    }

    protected notifyRefresh(bottom: boolean) {
        this.notify({ eventName: bottom ? RefreshLayoutBase.bottomRefreshEvent : RefreshLayoutBase.refreshEvent, object: this });
    }
}

export const refreshingProperty = new Property<RefreshLayoutBase, boolean>({ name: 'refreshing', defaultValue: false, valueConverter: booleanConverter });
refreshingProperty.register(RefreshLayoutBase);
export const bottomRefreshingProperty = new Property<RefreshLayoutBase, boolean>({ name: 'bottomRefreshing', defaultValue: false, valueConverter: booleanConverter });
bottomRefreshingProperty.register(RefreshLayoutBase);
export const topEnabledProperty = new Property<RefreshLayoutBase, boolean>({ name: 'topEnabled', defaultValue: true, valueConverter: booleanConverter });
topEnabledProperty.register(RefreshLayoutBase);
export const bottomEnabledProperty = new Property<RefreshLayoutBase, boolean>({ name: 'bottomEnabled', defaultValue: false, valueConverter: booleanConverter });
bottomEnabledProperty.register(RefreshLayoutBase);

export const indicatorColorProperty = new CssProperty<Style, Color>({
    name: 'indicatorColor',
    cssName: 'indicator-color',
    equalityComparer: Color.equals,
    valueConverter: (v) => new Color(v)
});
indicatorColorProperty.register(Style);

export const indicatorFillColorProperty = new CssProperty<Style, Color>({
    name: 'indicatorFillColor',
    cssName: 'indicator-fill-color',
    equalityComparer: Color.equals,
    valueConverter: (v) => new Color(v)
});
indicatorFillColorProperty.register(Style);
