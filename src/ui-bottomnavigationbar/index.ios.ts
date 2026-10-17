import { Application, Color, ImageSource, Screen, Utils, backgroundColorProperty } from '@nativescript/core';
import {
    BottomNavigationBarBase,
    BottomNavigationTabBase,
    TitleVisibility,
    activeColorCssProperty,
    badgeColorCssProperty,
    badgeTextColorCssProperty,
    iconProperty,
    inactiveColorCssProperty,
    tabsProperty,
    titleVisibilityProperty
} from './index-common';

/**
 * iOS: native UITabBar (floating Liquid Glass bar on iOS 26+).
 * Colors are applied through UITabBarAppearance, and through pre tinted icons because the glass tab bar ignores the tint of the unselected icons.
 * `titleVisibility` selected/never are emulated (the HIG recommends always showing the labels).
 */
@NativeClass
class TabBarDelegate extends NSObject {
    static ObjCProtocols = [UITabBarDelegate];
    _owner: WeakRef<BottomNavigationBar>;
    public static initWithOwner(owner: BottomNavigationBar) {
        const delegate = TabBarDelegate.new() as TabBarDelegate;
        delegate._owner = new WeakRef(owner);
        return delegate;
    }
    tabBarDidSelectItem(tabBar: UITabBar, item: UITabBarItem) {
        this._owner.get()?._onNativeItemSelected(item);
    }
}

/**
 * The items are created while the bar has no size yet (width 0): UIKit lays their labels out for that size (squashed, lower than they should)
 * and only lays an item out again when its state changes (the selected one is fine, the others stay wrong).
 * When the bar gets its width, the items are set again, which lays all of them out for the real size.
 */
@NativeClass
class TabBarImpl extends UITabBar {
    private mLaidOutWidth = 0;
    private mRelayouting = false;

    layoutSubviews() {
        super.layoutSubviews();
        const width = this.bounds.size.width;
        if (width > 0 && width !== this.mLaidOutWidth && !this.mRelayouting) {
            this.mLaidOutWidth = width;
            const items = this.items;
            if (items && items.count) {
                this.mRelayouting = true;
                const selected = this.selectedItem;
                // a selection change is what makes UIKit lay an item out for the real size
                for (let i = 0; i < items.count; i++) {
                    this.selectedItem = items.objectAtIndex(i);
                }
                this.selectedItem = selected;
                this.mRelayouting = false;
            }
        }
    }
}

export class BottomNavigationBar extends BottomNavigationBarBase {
    nativeViewProtected: UITabBar;
    _items: BottomNavigationTab[];
    private _delegate: TabBarDelegate;

    createNativeView(): Object {
        return TabBarImpl.new();
    }

    initNativeView(): void {
        super.initNativeView();
        this._delegate = TabBarDelegate.initWithOwner(this);
        this.nativeViewProtected.delegate = this._delegate;
        // Create the tabs before setting the default values for each tab
        // We call this method here to create the tabs defined in the xml
        this.createTabs(this._items);
    }

    disposeNativeView() {
        this.nativeViewProtected.delegate = null;
        this._delegate = null;
        this._items.forEach((item) => this._removeView(item));
        super.disposeNativeView();
    }

    layoutNativeView(left: number, top: number, right: number, bottom: number): void {
        if (!this.nativeViewProtected) {
            return;
        }
        const viewSize: CGSize = CGSizeMake(Screen.mainScreen.widthDIPs, Screen.mainScreen.heightDIPs);
        const bar = this.nativeViewProtected;
        // sizeThatFits includes the bottom safe area once the bar is in a window, the system bar height otherwise
        let height = bar.sizeThatFits(viewSize).height;
        if (!bar.window) {
            height += Application.ios.window?.safeAreaInsets?.bottom || 0;
        }
        const frame = CGRectMake(0, Utils.layout.toDeviceIndependentPixels(top), viewSize.width, height);
        (this as any)._setNativeViewFrame(bar, frame);
    }

    showBadge(index: number, value?: number): void {
        this._items[index] && this._items[index].showBadge(value);
    }

    removeBadge(index: number): void {
        this._items[index] && this._items[index].removeBadge();
    }

    [tabsProperty.setNative](tabs: BottomNavigationTab[]) {
        this.createTabs(tabs);
    }

    [titleVisibilityProperty.setNative](titleVisibility: TitleVisibility) {
        this.updateTitles();
    }

    [activeColorCssProperty.setNative](activeColor: Color) {
        this.updateAppearance();
    }
    [inactiveColorCssProperty.setNative](inactiveColor: Color) {
        this.updateAppearance();
    }
    [badgeColorCssProperty.setNative](color: Color) {
        this.updateAppearance();
    }
    [badgeTextColorCssProperty.setNative](color: Color) {
        this.updateAppearance();
    }
    [backgroundColorProperty.setNative](backgroundColor: Color) {
        this.updateAppearance();
    }

    /**
     * Applies the colors of the bar to the UITabBarAppearance (stacked, inline and compact inline layouts)
     */
    updateAppearance() {
        const tabBar = this.nativeViewProtected;
        if (!tabBar) {
            return;
        }
        const active = this.activeColor?.ios as UIColor;
        const inactive = this.inactiveColor?.ios as UIColor;
        const badgeColor = this.badgeColor?.ios as UIColor;
        const badgeTextColor = this.badgeTextColor?.ios as UIColor;
        const background = (this.style.backgroundColor as Color)?.ios as UIColor;

        const appearance = UITabBarAppearance.new();
        appearance.configureWithDefaultBackground();
        if (background) {
            appearance.backgroundColor = background;
        }
        const itemAppearances = [appearance.stackedLayoutAppearance, appearance.inlineLayoutAppearance, appearance.compactInlineLayoutAppearance];
        for (const layout of itemAppearances) {
            if (inactive) {
                layout.normal.iconColor = inactive;
                layout.normal.titleTextAttributes = { [NSForegroundColorAttributeName]: inactive } as any;
            }
            if (active) {
                layout.selected.iconColor = active;
                layout.selected.titleTextAttributes = { [NSForegroundColorAttributeName]: active } as any;
            }
            for (const state of [layout.normal, layout.selected]) {
                if (badgeColor) {
                    state.badgeBackgroundColor = badgeColor;
                }
                if (badgeTextColor) {
                    state.badgeTextAttributes = { [NSForegroundColorAttributeName]: badgeTextColor } as any;
                }
            }
        }
        tabBar.standardAppearance = appearance;
        tabBar.scrollEdgeAppearance = appearance;
        if (active) {
            tabBar.tintColor = active;
        }
        this._items?.forEach((item) => item.updateIcon());
    }

    /**
     * `titleVisibility`: never hides the titles, selected only shows the title of the selected tab
     */
    updateTitles() {
        const visibility = this.titleVisibility;
        this._items?.forEach((item, index) => {
            const showTitle = visibility === TitleVisibility.always || (visibility === TitleVisibility.selected && index === this.selectedTabIndex);
            item.updateTitle(showTitle);
        });
    }

    protected createTabs(tabs: BottomNavigationTab[] | undefined) {
        if (tabs) {
            this._items = tabs;
        }
        const nativeItems = this._items.map((item) => {
            this._addView(item);
            return item.nativeViewProtected;
        });
        // The titles and the icons are set on the items first: UIKit lays out the items with what they hold when the bar gets them
        this.updateAppearance();
        this.updateTitles();
        this.nativeViewProtected.setItemsAnimated(NSArray.arrayWithArray(nativeItems as any), false);
        const index = Math.max(0, this.selectedTabIndex);
        if (this._items[index]) {
            // UITabBar has no selected item by default
            this.nativeViewProtected.selectedItem = this._items[index].nativeViewProtected;
        }
    }

    protected selectTabNative(index: number): void {
        const tab = this._items[index];
        if (!tab || !this.nativeViewProtected.items || this.nativeViewProtected.items.count === 0) {
            return;
        }
        if (tab.isSelectable) {
            // UITabBar does not call the delegate when selecting programmatically
            this.nativeViewProtected.selectedItem = tab.nativeViewProtected;
        }
        this._onNativeItemSelected(tab.nativeViewProtected);
    }

    _onNativeItemSelected(item: UITabBarItem) {
        const index = this._items.findIndex((tab) => tab.nativeViewProtected === item);
        if (index < 0) {
            return;
        }
        if (!this._items[index].isSelectable) {
            // UITabBar has no shouldSelect: restore the previous selection
            this._emitTabPressed(index);
            const selected = this._items[this.selectedTabIndex];
            if (selected) {
                // UITabBar ignores the change while it is handling the selection
                setTimeout(() => {
                    if (this.nativeViewProtected) {
                        this.nativeViewProtected.selectedItem = selected.nativeViewProtected;
                    }
                }, 0);
            }
            return;
        }
        if (this.selectedTabIndex === index) {
            this._emitTabReselected(index);
            return;
        }
        this._emitTabSelected(index);
        this.updateTitles();
    }
}

// Bottom Navigation Tab

export class BottomNavigationTab extends BottomNavigationTabBase {
    nativeViewProtected: UITabBarItem;
    private mTitleVisible = true;

    createNativeView() {
        return UITabBarItem.alloc().initWithTitleImageTag(this.title, this.getNativeIcon(), 0);
    }

    getNativeIcon(): UIImage {
        const iconSource = this.icon;
        if (!iconSource) {
            return null;
        }
        if (iconSource instanceof ImageSource) {
            return iconSource.ios;
        }

        let is: ImageSource;
        if (Utils.isFontIconURI(iconSource)) {
            const fontIconCode = iconSource.split('//')[1];
            const font = this.style.fontInternal;
            is = ImageSource.fromFontIconCodeSync(fontIconCode, font, new Color('white'));
        } else {
            is = ImageSource.fromFileOrResourceSync(iconSource);
        }
        return is && is.ios;
    }

    /**
     * Colors of the icons: pre tinted (always original) images, the tint of the tab bar is ignored by the iOS 26 glass bar.
     * Without colors the icon is a template image tinted by the system.
     */
    updateIcon() {
        const item = this.nativeViewProtected;
        const bar = this.parent as BottomNavigationBar;
        if (!item) {
            return;
        }
        const icon = this.getNativeIcon();
        if (!icon) {
            item.image = null;
            item.selectedImage = null;
            return;
        }
        const active = (this.activeColor || bar?.activeColor)?.ios as UIColor;
        const inactive = (this.inactiveColor || bar?.inactiveColor)?.ios as UIColor;
        const tint = (color: UIColor) => (color ? icon.imageWithTintColorRenderingMode(color, UIImageRenderingMode.AlwaysOriginal) : icon.imageWithRenderingMode(UIImageRenderingMode.AlwaysTemplate));
        item.image = tint(inactive);
        item.selectedImage = tint(active);
    }

    updateTitle(visible: boolean) {
        this.mTitleVisible = visible;
        const item = this.nativeViewProtected;
        if (item) {
            item.title = visible ? this.title : null;
            // without title the icon is centered
            item.imageInsets = visible ? UIEdgeInsetsZero : ({ top: 6, left: 0, bottom: -6, right: 0 } as any);
        }
    }

    [iconProperty.setNative](iconSource) {
        this.updateIcon();
    }

    [activeColorCssProperty.setNative](activeColor: Color) {
        this.updateIcon();
    }

    [inactiveColorCssProperty.setNative](inactiveColor: Color) {
        this.updateIcon();
    }

    showBadge(value?: number): void {
        this.nativeViewProtected.badgeValue = value ? `${value}` : '';
    }

    removeBadge(): void {
        this.nativeViewProtected.badgeValue = null;
    }
}
