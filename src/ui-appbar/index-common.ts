import { ActionBar, FormattedString, Property, View } from '@nativescript/core';

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
export const translucentProperty = new Property<AppBarBase, boolean>({ name: 'translucent', defaultValue: false, valueConverter: (v: any) => v === true || v === 'true', valueChanged: changed });
export const scrollTargetProperty = new Property<AppBarBase, View>({ name: 'scrollTarget', valueChanged: changed });

export class AppBarBase extends ActionBar {
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
