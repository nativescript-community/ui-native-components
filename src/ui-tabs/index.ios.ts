import { TabContentItem } from '@nativescript-community/ui-core-tabs/tab-content-item';
import { TabsPosition } from '@nativescript-community/ui-core-tabs/tab-navigation/index-common';
import { TabNavigation, updateBackgroundPositions, updateTitleAndIconPositions } from '@nativescript-community/ui-core-tabs/tab-navigation/index.ios';
import { SegmentedTabBar, SegmentedTabBarDelegate } from '@nativescript-community/ui-core-tabs/tab-navigation/segmented-tab-bar.ios';
import { TabStrip } from '@nativescript-community/ui-core-tabs/tab-strip';
import { TabStripItem } from '@nativescript-community/ui-core-tabs/tab-strip-item';
import { IOSHelper, Utils } from '@nativescript/core';

export { TabContentItem, TabStrip, TabStripItem };

const majorVersion = Utils.ios.MajorVersion;

class TabBarViewDelegateImpl implements SegmentedTabBarDelegate {
    constructor(private _owner: WeakRef<Tabs>) {}

    public tabBarViewShouldSelectItem(tabBar: SegmentedTabBar, item: UITabBarItem): boolean {
        const owner = this._owner?.get();
        if (owner) {
            const shouldSelectItem = owner.mCanSelectItem;
            const selectedIndex = owner.tabBarItems.indexOf(item);

            if (owner.selectedIndex !== selectedIndex) {
                owner.beginTabTransition();
            }

            const tabStrip = owner.tabStrip;
            const tabStripItems = tabStrip && tabStrip.items;

            if (tabStripItems && tabStripItems[selectedIndex]) {
                tabStripItems[selectedIndex]._emit(TabStripItem.tapEvent);
                tabStrip.notify({ eventName: TabStrip.itemTapEvent, object: tabStrip, index: selectedIndex });
            }

            return shouldSelectItem;
        }
        return false;
    }

    public tabBarViewDidSelectItem(tabBar: SegmentedTabBar, selectedItem: UITabBarItem): void {
        const owner = this._owner?.get();
        if (owner) {
            const selectedIndex = owner.tabBarItems.indexOf(selectedItem);
            owner.selectedIndex = selectedIndex;
        }
    }
}

@NativeClass
class UIPageViewControllerImpl extends UIPageViewController {
    tabBar: SegmentedTabBar;
    scrollView: UIScrollView;
    tabBarDelegate: TabBarViewDelegateImpl;

    private _owner: WeakRef<Tabs>;

    public static initWithOwner(owner: WeakRef<Tabs>): UIPageViewControllerImpl {
        const handler = UIPageViewControllerImpl.alloc().initWithTransitionStyleNavigationOrientationOptions(
            UIPageViewControllerTransitionStyle.Scroll,
            UIPageViewControllerNavigationOrientation.Horizontal,
            null
        ) as UIPageViewControllerImpl;
        handler._owner = owner;

        return handler;
    }

    public accessibilityScroll(direction: UIAccessibilityScrollDirection): boolean {
        if (this._owner.get()?.swipeEnabled ?? true) {
            return super.accessibilityScroll(direction);
        }
        return false;
    }

    public viewDidLoad(): void {
        const owner = this._owner.get();

        const tabBarItems = owner.tabBarItems;
        // the top tabs are a native segmented control, colors come from the system
        const tabBar = SegmentedTabBar.create();
        this.tabBar = tabBar;

        if (tabBarItems && tabBarItems.length) {
            tabBar.items = NSArray.arrayWithArray(tabBarItems);
        }

        tabBar.tabBarDelegate = this.tabBarDelegate = new TabBarViewDelegateImpl(new WeakRef(owner));
        tabBar.autoresizingMask = UIViewAutoresizing.FlexibleWidth | UIViewAutoresizing.FlexibleBottomMargin;

        this.view.addSubview(tabBar);
        tabBar.sizeToFit();
    }

    public viewDidUnload(): void {
        if (this.tabBar) {
            this.tabBar.tabBarDelegate = null;
            this.tabBar = null;
        }
    }

    public viewWillAppear(animated: boolean): void {
        super.viewWillAppear(animated);
        const owner = this._owner.get();
        if (!owner) {
            return;
        }

        IOSHelper.updateAutoAdjustScrollInsets(this, owner);

        // Tabs can be reset as a root view. Call loaded here in this scenario.
        if (!owner.isLoaded) {
            owner.callLoaded();
        }
    }
    // public viewWillLayoutSubviews(): void {
    //     super.viewWillLayoutSubviews();
    //     this.tabBar.sizeToFit();
    // }
    public viewDidLayoutSubviews(): void {
        super.viewDidLayoutSubviews();
        const owner = this._owner.get();
        if (!owner) {
            return;
        }

        let safeAreaInsetsBottom = 0;
        let safeAreaInsetsTop = 0;

        if (majorVersion > 10) {
            safeAreaInsetsBottom = this.view.safeAreaInsets.bottom;
            safeAreaInsetsTop = this.view.safeAreaInsets.top;
        } else {
            safeAreaInsetsTop = this.topLayoutGuide.length;
        }

        const conditionalSafeAreaBottom = owner.iosOverflowSafeArea ? safeAreaInsetsBottom : 0;
        let scrollViewTop = 0;
        let scrollViewHeight = this.view.bounds.size.height + conditionalSafeAreaBottom;

        if (owner.tabStrip && this.tabBar) {
            if (owner.tabStrip.visibility === 'visible') {
                this.tabBar.hidden = false;
            } else {
                this.tabBar.hidden = true;
            }
            // failsafe with !this.tabBar.hidden just in some really odd case where hidden is false and collapse is true
            // which should never happen
            if (!owner.tabStrip.isCollapsed || !this.tabBar.hidden) {
                const viewWidth = this.view.bounds.size.width;
                const viewHeight = this.view.bounds.size.height;
                const tabBarHeight = this.tabBar.frame.size.height;
                let tabBarTop = safeAreaInsetsTop;

                scrollViewTop = tabBarHeight;
                scrollViewHeight = this.view.bounds.size.height - tabBarHeight + conditionalSafeAreaBottom;

                const tabsPosition = owner.tabsPosition;
                if (tabsPosition === TabsPosition.Bottom) {
                    tabBarTop = viewHeight - tabBarHeight - safeAreaInsetsBottom;
                    scrollViewTop = this.view.frame.origin.y;
                    scrollViewHeight = viewHeight - tabBarHeight;
                }

                let parent = owner.parent;

                // Handle Angular scenario where Tabs is in a ProxyViewContainer
                // It is possible to wrap components in ProxyViewContainers indefinitely
                while (parent && !parent.nativeViewProtected) {
                    parent = parent.parent;
                }

                if (parent && majorVersion > 10) {
                    // TODO: Figure out a better way to handle ViewController nesting/Safe Area nesting
                    tabBarTop = Math.max(tabBarTop, parent.nativeView.safeAreaInsets.top);
                }
                this.tabBar.frame = CGRectMake(0, tabBarTop, viewWidth, tabBarHeight);
            }
        } else {
            this.tabBar.hidden = true;
        }

        const subViews: NSArray<UIView> = this.view.subviews;
        let scrollView: UIScrollView = null;

        for (let i = 0; i < subViews.count; i++) {
            const view: UIView = subViews.objectAtIndex(i);
            if (view instanceof UIScrollView) {
                scrollView = view;
            }
        }
        if (scrollView) {
            // The part of the UIPageViewController that is changing the pages is a UIScrollView
            // We want to expand it to the size of the UIPageViewController as it is not so by default
            this.scrollView = scrollView;

            if (!owner.swipeEnabled) {
                scrollView.scrollEnabled = false;
            } else {
                scrollView.scrollEnabled = true;
            }

            scrollView.frame = CGRectMake(0, scrollViewTop, this.view.bounds.size.width, scrollViewHeight); //this.view.bounds;
        }
    }

    // Mind implementation for other controllers
    public traitCollectionDidChange(previousTraitCollection: UITraitCollection): void {
        super.traitCollectionDidChange(previousTraitCollection);

        if (majorVersion >= 13) {
            const owner = this._owner.get();
            if (
                owner &&
                this.traitCollection.hasDifferentColorAppearanceComparedToTraitCollection &&
                this.traitCollection.hasDifferentColorAppearanceComparedToTraitCollection(previousTraitCollection)
            ) {
                owner.notify({ eventName: IOSHelper.traitCollectionColorAppearanceChangedEvent, object: owner });
            }
        }
    }

    public viewWillTransitionToSizeWithTransitionCoordinator(size: CGSize, coordinator: UIViewControllerTransitionCoordinator): void {
        super.viewWillTransitionToSizeWithTransitionCoordinator(size, coordinator);
        coordinator.animateAlongsideTransitionCompletion(() => {
            const owner = this._owner.get();
            if (owner && owner.tabStrip && owner.tabStrip.items) {
                const tabStrip = owner.tabStrip;
                tabStrip.items.forEach((tabStripItem) => {
                    updateBackgroundPositions(tabStrip, tabStripItem, owner.selectedIndex !== tabStripItem.index ? owner.mDefaultItemBackgroundColor : null);

                    const index = tabStripItem.index;
                    const tabBarItemController = owner.viewControllers[index];
                    updateTitleAndIconPositions(tabStripItem, tabBarItemController.tabBarItem, tabBarItemController);
                });
            }
        }, null);
    }
}

export class Tabs extends TabNavigation {
    protected createViewController() {
        return UIPageViewControllerImpl.initWithOwner(new WeakRef(this));
    }
}
