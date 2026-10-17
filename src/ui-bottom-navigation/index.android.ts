import { BottomAccessory } from './bottom-accessory';
import { TabContentItem } from '@nativescript-community/ui-core-tabs/tab-content-item';
import { TabNavigation } from '@nativescript-community/ui-core-tabs/tab-navigation/index.android';
import { TabStrip } from '@nativescript-community/ui-core-tabs/tab-strip';
import { TabStripItem } from '@nativescript-community/ui-core-tabs/tab-strip-item';
import { TabsPosition, animationEnabledProperty, swipeEnabledProperty } from '@nativescript-community/ui-core-tabs/tab-navigation/index-common';
import { CSSType, Color, Utils } from '@nativescript/core';

export { TabContentItem, TabStrip, TabStripItem };

interface BottomNavigationBar extends com.nativescript.material.core.NavigationBar {
    // tslint:disable-next-line:no-misused-new
    new (context: android.content.Context, owner: BottomNavigation): BottomNavigationBar;
}
// eslint-disable-next-line no-redeclare
let BottomNavigationBar: BottomNavigationBar;

function initializeNativeClasses() {
    if (BottomNavigationBar) {
        return;
    }

    @NativeClass
    class NavigationBarImplementation extends com.nativescript.material.core.NavigationBar {
        constructor(context: android.content.Context, public owner: BottomNavigation) {
            super(context);

            return global.__native(this);
        }

        public onSelectedPositionChange(position: number, prevPosition: number): void {
            const owner = this.owner;
            if (!owner) {
                return;
            }
            owner.onTabsBarSelectedPositionChange(position, prevPosition);
        }

        public onTap(position: number): boolean {
            const owner = this.owner;
            if (!owner) {
                return false;
            }
            return owner.onTabsBarTap(position);
        }
    }

    BottomNavigationBar = NavigationBarImplementation as any;
}

@CSSType('BottomNavigation')
export class BottomNavigation extends TabNavigation<com.nativescript.material.core.NavigationBar> {
    tabsPosition = TabsPosition.Bottom;
    animationEnabled = false;
    swipeEnabled = false;
    protected override updateTabsBarItemAt(position: number, itemSpec: com.nativescript.material.core.TabItemSpec) {
        this.mTabsBar.updateItemAt(position, itemSpec);
    }
    protected override setTabsBarSelectedIndicatorColors(colors: number[]) {
        // nothing to do
    }
    protected override getTabBarItemView(index: number) {
        return this.mTabsBar.getViewForItemAt(index);
    }
    protected override getTabBarItemTextView(index: number) {
        // the labels are styled by the Material navigation bar (theme), binding them to the TabStripItem would apply the NativeScript styles
        return null;
    }
    protected override createNativeTabBar(context: android.content.Context) {
        initializeNativeClasses();
        // Material 3 navigation bar: the colors come from the theme
        const tabsBar = new BottomNavigationBar(context, this);
        tabsBar.setSelectedPosition(this.selectedIndex);
        return tabsBar;
    }

    protected override setTabBarItems(tabItems: com.nativescript.material.core.TabItemSpec[]) {
        this.mTabsBar.setItems(tabItems);
        this._setItemsColors(null);
    }

    public override _setItemColor(item: TabStripItem) {
        // the Material bar colors icons and labels with a state list, see _setItemsColors
    }

    protected override selectTabBar(oldIndex: number, newIndex: number) {
        this.mTabsBar.setSelectedPosition(newIndex);
    }

    public onLoaded(): void {
        super.onLoaded();

        if (!this.tabStrip && this.mTabsBar) {
            // manually set the visibility, so that the grid layout remeasures
            this.mTabsBar.setVisibility(android.view.View.GONE);
        }

        // if (this._attachedToWindow) {
        //     this.changeTab(this.selectedIndex);
        // }
    }

    // _onAttachedToWindow(): void {
    //     super._onAttachedToWindow();
    //     // this.changeTab(this.selectedIndex);
    // }

    public override updateAndroidItemAt(index: number, spec: com.nativescript.material.core.TabItemSpec) {
        // that try catch is fix for an android NPE error on css change which navigated in (not the current fragment)
        try {
            if (this.mTabsBar) {
                this.mTabsBar.updateItemAt(index, spec);
            }
        } catch (err) {}
    }

    public override setTabBarBackgroundColor(value: android.graphics.drawable.Drawable | Color): void {
        super.setTabBarBackgroundColor(value);
        // this.updateTabStripItems();
    }

    // private updateTabStripItems(): void {
    //     this.tabStrip.items.forEach((tabStripItem: TabStripItem) => {
    //         if (tabStripItem.nativeView) {
    //             const tabItemSpec = this.createTabItemSpec(tabStripItem);
    //             this.updateAndroidItemAt(tabStripItem._index, tabItemSpec);
    //         }
    //     });
    // }

    public _setItemsColors(items: TabStripItem[]): void {
        // the Material bar colors icons and labels with a state list
        this.mTabsBar?.setItemColors(this.mSelectedItemColor?.android || 0, this.mUnSelectedItemColor?.android || 0);
    }

    public override setTabBarSelectedItemColor(value: Color) {
        super.setTabBarSelectedItemColor(value);
        this._setItemsColors(this.tabStrip.items);
    }

    public override setTabBarUnSelectedItemColor(value: Color) {
        super.setTabBarUnSelectedItemColor(value);
        this._setItemsColors(this.tabStrip.items);
    }

    public override onTabsBarSelectedPositionChange(position: number, prevPosition: number): void {
        this.mViewPager.setCurrentItem(position, this.animationEnabled);
        const tabStripItems = this.tabStrip && this.tabStrip.items;

        if (position >= 0 && tabStripItems && tabStripItems[position]) {
            tabStripItems[position]._emit(TabStripItem.selectEvent);
        }

        if (prevPosition >= 0 && tabStripItems && tabStripItems[prevPosition]) {
            tabStripItems[prevPosition]._emit(TabStripItem.unselectEvent);
        }

        this._setItemsColors(this.tabStrip.items);
    }
}

// iOS 26 only: the minimize behavior and the accessory of the tab bar are ignored on Android
import { BottomSearchContent } from './search-content';
export { BottomAccessory, BottomSearchContent };
