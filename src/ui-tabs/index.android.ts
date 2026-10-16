import { TabContentItem } from '@nativescript-community/ui-core-tabs/tab-content-item';
import { PositionChanger, TabNavigation } from '@nativescript-community/ui-core-tabs/tab-navigation/index.android';
import { TabStrip } from '@nativescript-community/ui-core-tabs/tab-strip';
import { TabStripItem } from '@nativescript-community/ui-core-tabs/tab-strip-item';
import { CSSType, Color } from '@nativescript/core';

export { TabContentItem, TabStrip, TabStripItem };

interface TabsBar extends com.nativescript.material.core.MaterialTabs {
    // tslint:disable-next-line:no-misused-new
    new (context: android.content.Context, owner: Tabs): TabsBar;
    onSelectedPositionChange(position: number, prevPosition: number): void;
}
// eslint-disable-next-line no-redeclare
let TabsBar: TabsBar;

function initializeNativeClasses() {
    if (TabsBar) {
        return;
    }
    @NativeClass
    class MaterialTabsImplementation extends com.nativescript.material.core.MaterialTabs implements PositionChanger {
        constructor(context: android.content.Context, public owner: Tabs) {
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

    TabsBar = MaterialTabsImplementation as any;
}

@CSSType('Tabs')
export class Tabs extends TabNavigation<TabsBar> {
    public override createNativeView() {
        const view = super.createNativeView();
        if (this.mTabsBar) {
            this.mTabsBar.setViewPager(this.mViewPager);
        }
        return view;
    }
    protected override updateTabsBarItemAt(position: number, itemSpec: com.nativescript.material.core.TabItemSpec) {
        this.mTabsBar.updateItemAt(position, itemSpec);
    }
    protected override setTabsBarSelectedIndicatorColors(colors: number[]) {
        this.mTabsBar.setSelectedIndicatorColors(colors);
    }
    protected override getTabBarItemView(index: number) {
        return this.mTabsBar.getViewForItemAt(index);
    }
    protected override getTabBarItemTextView(index: number) {
        // the labels are styled by the Material tabs (theme)
        return null;
    }

    public override _setItemColor(item: TabStripItem) {
        // the Material tabs color icons and labels with a state list, see _setItemsColors
    }

    public _setItemsColors(items: TabStripItem[]): void {
        this.mTabsBar?.setItemColors(this.mSelectedItemColor?.android || 0, this.mUnSelectedItemColor?.android || 0);
    }

    public override setTabBarSelectedItemColor(value: Color) {
        super.setTabBarSelectedItemColor(value);
        this._setItemsColors(null);
    }

    public override setTabBarUnSelectedItemColor(value: Color) {
        super.setTabBarUnSelectedItemColor(value);
        this._setItemsColors(null);
    }
    protected override createNativeTabBar(context: android.content.Context) {
        initializeNativeClasses();
        const tabsBar = new TabsBar(context, this);
        tabsBar.setViewPager(this.mViewPager);
        // Material 3 tabs: the colors come from the theme
        tabsBar.setSelectedPosition(this.selectedIndex);
        return tabsBar;
    }

    protected override setTabBarItems(tabItems: com.nativescript.material.core.TabItemSpec[]) {
        this.mTabsBar.setItems(tabItems);
        this._setItemsColors(null);
        // The setTimeout below is necessary to ensure the scrollToTab is executed only after
        // all tabs are recreated. The tabs' recreation is triggered by the setItems call above.
        //
        // The setTimeout is necessary to fix an Android issue:
        // Android Issue: Active Tab item not displaying after nav back
        // Reproduce steps:
        //      1. On app with multiple (overflown) tab items, Switch to the last tab item
        //      2. Navigate to a new page
        //      3. Nav back to the page with Tabs
        //      4. Notice the active last tab item is not showing. The tab strip is showing the most left / initial tab items instead.
        setTimeout(() => {
            this.mTabsBar.scrollToTab(this.selectedIndex);
        }, 0);
    }

    protected override selectTabBar(oldIndex: number, newIndex: number) {
        this.mTabsBar.setSelectedPosition(newIndex);
    }

    protected override setTabStripItems(items: TabStripItem[]) {
        // no default unselected color from the labels: the Material 3 theme colors are used
        super.setTabStripItems(items);
    }
    protected override willSelectWithoutAnimation(index: number) {
        this.mTabsBar?.forceTransitionToPosition(index);
    }

    public override onLoaded(): void {
        super.onLoaded();

        if (!this.tabStrip && this.mTabsBar) {
            // manually set the visibility, so that the grid layout remeasures
            this.mTabsBar.setVisibility(android.view.View.GONE);
        }
    }
}
