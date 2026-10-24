import { Color, GridLayout, ItemSpec, Page, Utils, View } from '@nativescript/core';
import { createNativeFormattedText } from '@nativescript-community/ui-core/formatted-text';
import { createNativeMenu, getNativeIcon } from '@nativescript-community/ui-menu';
import {
    AppBarBase,
    AppBarBottomItem,
    AppBarBottomView,
    AppBarItem,
    AppBarScrollBehavior,
    AppBarSearchField,
    AppBarSearchMode,
    AppBarSearchPlacement,
    AppBarSize,
    AppPageSearchContent,
    notifyBottomItemTap
} from './index-common';
export { AppBarBottomItem, AppBarBottomView, AppBarItem, AppBarScrollBehavior, AppBarSearchField, AppBarSearchMode, AppBarSearchPlacement, AppBarSize, AppPageSearchContent };

function findScrollView(view: View): UIScrollView {
    const native = view?.nativeViewProtected;
    if (!native) {
        return null;
    }
    if (native instanceof UIScrollView) {
        return native;
    }
    return native.scrollView instanceof UIScrollView ? native.scrollView : null;
}

@NativeClass
class BottomItemHandler extends NSObject {
    static ObjCExposedMethods = {
        tap: { returns: interop.types.void, params: [interop.types.id] }
    };
    owner: WeakRef<AppBar>;
    item: AppBarBottomItem;
    static initWithOwnerItem(owner: AppBar, item: AppBarBottomItem) {
        const handler = BottomItemHandler.new() as BottomItemHandler;
        handler.owner = new WeakRef(owner);
        handler.item = item;
        return handler;
    }
    tap(sender: any) {
        const bar = this.owner?.deref();
        if (bar) {
            notifyBottomItemTap(bar, this.item);
        }
    }
}

declare const UIBarButtonItemBadge: any;

/** iOS 26: the badge of a bar button item (a count, a text, or a dot) */
function applyBadge(barButtonItem: UIBarButtonItem, badge: string | number | boolean) {
    if (typeof UIBarButtonItemBadge === 'undefined' || !('badge' in barButtonItem)) {
        return;
    }
    const value = badge as any;
    if (value === undefined || value === null || value === false || value === '') {
        (barButtonItem as any).badge = null;
    } else if (value === true) {
        (barButtonItem as any).badge = UIBarButtonItemBadge.indicatorBadge();
    } else if (typeof value === 'number') {
        (barButtonItem as any).badge = UIBarButtonItemBadge.badgeWithCount(value);
    } else {
        (barButtonItem as any).badge = UIBarButtonItemBadge.badgeWithString(String(value));
    }
}

const SEARCH_PLACEMENTS = { automatic: 0, integrated: 1, stacked: 2, integratedCentered: 3, integratedButton: 4 };

/** a view which lets the touches go through its empty areas */
@NativeClass
class PassthroughView extends UIView {
    // @ts-ignore
    hitTestWithEvent(point: CGPoint, event: any): UIView {
        const hit = super.hitTestWithEvent(point, event) as any;
        return hit === (this as any) ? null : hit;
    }
}

/**
 * Layout for the views anchored to the page (a floating action button, a bottom bar...): use it as the `overlay` of an AppPage.
 * Its empty areas let the touches go through to the content.
 */
export class AppPageOverlay extends GridLayout {
    constructor() {
        super();
        this.addRow(new ItemSpec(1, 'star'));
        this.addColumn(new ItemSpec(1, 'star'));
    }
    createNativeView() {
        return PassthroughView.new();
    }
}

@NativeClass
class SearchDelegate extends NSObject implements UISearchResultsUpdating, UISearchBarDelegate {
    static ObjCProtocols = [UISearchResultsUpdating, UISearchBarDelegate];
    owner: WeakRef<AppBar>;
    static initWithOwner(owner: AppBar) {
        const delegate = SearchDelegate.new() as SearchDelegate;
        delegate.owner = new WeakRef(owner);
        return delegate;
    }
    updateSearchResultsForSearchController(searchController: UISearchController) {
        const bar = this.owner?.deref();
        const text = searchController.searchBar.text ?? '';
        if (bar && bar.searchText !== text) {
            bar.searchText = text;
            bar.notify({ eventName: AppBar.searchChangeEvent, object: bar, text });
        }
    }
    searchBarSearchButtonClicked(searchBar: UISearchBar) {
        const bar = this.owner?.deref();
        bar?.notify({ eventName: AppBar.searchSubmitEvent, object: bar, text: searchBar.text ?? '' });
    }
    searchBarCancelButtonClicked(searchBar: UISearchBar) {
        const bar = this.owner?.deref();
        if (bar) {
            bar.searchText = '';
            bar.notify({ eventName: AppBar.searchCancelEvent, object: bar, text: '' });
        }
    }
}

/**
 * iOS: the page `navigationItem` of the navigation controller bar.
 * - `size` medium / large: large title that collapses with the scroll (limit: on a pushed page the inline title is not shown once collapsed, UIKit `Always` mode)
 * - `scrollBehavior`: `lift` separator / shadow only when content scrolls under the bar, `hide` hides the bar when swiping (hidesBarsOnSwipe)
 * - `translucent`: blur when content scrolls under the bar, see through at the top
 * - `scrollTarget` / `scrollTargetId`: the scroll view the bar follows (setContentScrollView), by default UIKit finds the first one
 * - `subtitle` and `formattedTitle` (spans): iOS 26 (`subtitle`, `attributedTitle`)
 * iOS 26 gives the bar buttons the Liquid Glass look.
 */
export class AppBar extends AppBarBase {
    private _scrollTargetLoadedHandler: () => void;
    private _hadFormattedTitle = false;
    private _searchController: UISearchController;
    private _searchDelegate: SearchDelegate;

    update() {
        super.update();
        this.applyAppBar();
    }

    focusSearch() {
        if (!this._searchController) {
            return false;
        }
        this._searchController.searchBar.becomeFirstResponder();
        return true;
    }

    createBarButtonItem(item: AppBarItem): UIBarButtonItem {
        let barButtonItem: UIBarButtonItem;
        if (item instanceof AppBarItem && item.menu?.length && !item.actionView) {
            // the bar button shows a native menu when tapped
            const menu = createNativeMenu(item.menu);
            const image = item.icon ? getNativeIcon(item.icon) : null;
            barButtonItem = image ? UIBarButtonItem.alloc().initWithImageMenu(image, menu) : UIBarButtonItem.alloc().initWithTitleMenu(item.text + '', menu);
            barButtonItem.accessibilityLabel = item.text;
        } else {
            // @ts-ignore
            barButtonItem = super.createBarButtonItem(item);
        }
        if (item instanceof AppBarItem && barButtonItem) {
            applyBadge(barButtonItem, item.badge);
        }
        if (item instanceof AppBarItem && item.prominent && barButtonItem && 'style' in barButtonItem) {
            // UIBarButtonItemStylePlain = 0, Done / prominent = 2
            barButtonItem.style = 2 as UIBarButtonItemStyle;
        }
        return barButtonItem;
    }

    private applyAppBar() {
        const page = this.page;
        const viewController = page?.ios as UIViewController;
        const navigationItem = viewController?.navigationItem;
        const navController = viewController?.navigationController;
        if (!navigationItem || !navController) {
            return;
        }
        const navigationBar = navController.navigationBar;
        const size = this.size || 'small';
        const behavior = this.scrollBehavior || 'none';

        // large title. `Automatic` collapses to an inline title but follows the state of the previous page: it is only large on the root page of the Frame.
        // `Always` shows the large title on a pushed page, but UIKit never shows the inline title once collapsed.
        const isRoot = navController.viewControllers.indexOfObject(viewController) === 0;
        if (size !== 'small' && !navigationBar.prefersLargeTitles) {
            navigationBar.prefersLargeTitles = true;
            // on the first presentation UIKit does not lay out the large title by itself
            navigationBar.sizeToFit();
        }
        if ('style' in navigationItem) {
            // UINavigationItemStyle: 0 navigator (centered title), 1 browser (leading title)
            (navigationItem as any).style = this.titleAlignment === 'leading' ? 1 : 0;
        }
        navigationItem.largeTitleDisplayMode =
            size === 'small' ? UINavigationItemLargeTitleDisplayMode.Never : isRoot ? UINavigationItemLargeTitleDisplayMode.Automatic : UINavigationItemLargeTitleDisplayMode.Always;

        // appearances: one for the bar when content scrolls under it (standard) and one at the top (scroll edge)
        const base = (navigationBar.standardAppearance ?? UINavigationBarAppearance.new()).copy();
        const standard = base.copy();
        const edge = base.copy();
        if (this.translucent) {
            // the content scrolls under the bar: a blur tinted with the color of the bar, at the top too
            const barColor = standard.backgroundColor;
            const tinted = barColor ? barColor.colorWithAlphaComponent(0.7) : null;
            for (const appearance of [standard, edge]) {
                appearance.backgroundEffect = UIBlurEffect.effectWithStyle(UIBlurEffectStyle.SystemChromeMaterial);
                appearance.backgroundColor = tinted;
            }
            edge.shadowColor = UIColor.clearColor;
        } else if (behavior === 'lift') {
            edge.shadowColor = UIColor.clearColor;
        }
        // css font of the bar (font-size, font-weight, font-family) for the title
        if (this.style.fontSize || this.style.fontWeight || this.style.fontFamily) {
            const font = this.style.fontInternal.getUIFont(UIFont.systemFontOfSize(17));
            for (const appearance of [standard, edge]) {
                const attributes = NSMutableDictionary.dictionaryWithDictionary((appearance.titleTextAttributes ?? NSDictionary.new()) as any);
                attributes.setObjectForKey(font, NSFontAttributeName);
                appearance.titleTextAttributes = attributes as any;
            }
        }
        // iOS 26: the subtitle and the large title have their own text attributes: same as the title
        for (const appearance of [standard, edge]) {
            const attributes = appearance.titleTextAttributes;
            if (attributes) {
                for (const key of ['subtitleTextAttributes', 'largeSubtitleTextAttributes']) {
                    if (key in (appearance as any)) {
                        (appearance as any)[key] = attributes;
                    }
                }
                // the large title has the color of the title
                const color = attributes.objectForKey(NSForegroundColorAttributeName);
                if (color) {
                    const large = NSMutableDictionary.dictionaryWithDictionary((appearance.largeTitleTextAttributes ?? NSDictionary.new()) as any);
                    large.setObjectForKey(color, NSForegroundColorAttributeName);
                    appearance.largeTitleTextAttributes = large as any;
                }
            }
        }
        navigationItem.standardAppearance = standard;
        navigationItem.compactAppearance = standard;
        navigationItem.scrollEdgeAppearance = edge;

        // hide on swipe
        navController.hidesBarsOnSwipe = behavior === 'hide';

        // title with spans and subtitle (iOS 26)
        if (this.formattedTitle && !this.titleView) {
            const attributed = createNativeFormattedText(this.formattedTitle) as NSAttributedString;
            if (navigationItem.respondsToSelector('setAttributedTitle:')) {
                (navigationItem as any).attributedTitle = attributed;
            } else {
                const label = UILabel.new();
                label.attributedText = attributed;
                label.sizeToFit();
                navigationItem.titleView = label;
            }
            this._hadFormattedTitle = true;
        } else if (this._hadFormattedTitle) {
            // clearing the attributed title also clears the title: set it again
            this._hadFormattedTitle = false;
            if (navigationItem.respondsToSelector('setAttributedTitle:')) {
                (navigationItem as any).attributedTitle = null;
            }
            navigationItem.titleView = this.titleView?.ios ?? null;
            navigationItem.title = this.title;
        }
        if (navigationItem.respondsToSelector('setSubtitle:')) {
            (navigationItem as any).subtitle = this.subtitle ?? null;
        }

        this.applyOverflowSafeArea();
        this.applyBottomItems(viewController, navController);
        this.applySearch(navigationItem, behavior);
        this.applyScrollTarget(viewController);
    }

    private _bottomHandlers: BottomItemHandler[] = [];
    /** the bottom toolbar of the navigation controller (Liquid Glass buttons on iOS 26) */
    private applyBottomItems(viewController: UIViewController, navController: UINavigationController) {
        const items = this.bottomItems;
        if (!items?.length) {
            if (!navController.toolbarHidden) {
                navController.setToolbarHiddenAnimated(true, false);
            }
            viewController.setToolbarItemsAnimated(null, false);
            this._bottomHandlers = [];
            return;
        }
        const handlers: BottomItemHandler[] = [];
        const badges: [UIBarButtonItem, string | number | boolean][] = [];
        const barButtonItems = NSMutableArray.new<UIBarButtonItem>();
        for (const item of items) {
            if (item.spacer) {
                barButtonItems.addObject(UIBarButtonItem.alloc().initWithBarButtonSystemItemTargetAction(UIBarButtonSystemItem.FlexibleSpace, null, null));
                continue;
            }
            if (item.search) {
                const searchItem = (viewController.navigationItem as any).searchBarPlacementBarButtonItem;
                if (searchItem) {
                    barButtonItems.addObject(searchItem);
                }
                continue;
            }
            const handler = BottomItemHandler.initWithOwnerItem(this, item);
            handlers.push(handler);
            const image = item.icon ? getNativeIcon(item.icon) : null;
            let barButtonItem: UIBarButtonItem;
            if (item.menu?.length) {
                const menu = createNativeMenu(item.menu);
                barButtonItem = image ? UIBarButtonItem.alloc().initWithImageMenu(image, menu) : UIBarButtonItem.alloc().initWithTitleMenu(item.text + '', menu);
            } else {
                barButtonItem = image
                    ? UIBarButtonItem.alloc().initWithImageStyleTargetAction(image, UIBarButtonItemStyle.Plain, handler, 'tap')
                    : UIBarButtonItem.alloc().initWithTitleStyleTargetAction(item.text + '', UIBarButtonItemStyle.Plain, handler, 'tap');
            }
            barButtonItem.accessibilityLabel = item.text;
            // iOS 26: each button in its own glass capsule (next to the search field)
            if ('sharesBackground' in barButtonItem) {
                (barButtonItem as any).sharesBackground = false;
            }
            badges.push([barButtonItem, item.badge]);
            barButtonItems.addObject(barButtonItem);
        }
        // the handlers must stay alive
        this._bottomHandlers = handlers;
        viewController.setToolbarItemsAnimated(barButtonItems, false);
        navController.setToolbarHiddenAnimated(false, false);
        // the badge is set once the items are in the toolbar
        badges.forEach(([barButtonItem, badge]) => applyBadge(barButtonItem, badge));
    }

    private _ignoredSafeArea = false;
    /**
     * translucent: the page does not shrink its content to the safe area (the NativeScript Page places its content below the bar):
     * the scrolling view starts at the top of the page, under the bar. UIKit adds the safe area to its content inset,
     * so the first rows start below the bar and the next ones scroll under the blur.
     * Works when the scrolling view is the content of the page.
     */
    private applyOverflowSafeArea() {
        const page = this.page;
        const wanted = this.translucent;
        if (wanted !== this._ignoredSafeArea) {
            this._ignoredSafeArea = wanted;
            page.iosIgnoreSafeArea = wanted;
            page.requestLayout();
            (page.ios as UIViewController).view.setNeedsLayout();
        }
    }

    private applySearch(navigationItem: UINavigationItem, behavior: AppBarScrollBehavior) {
        if (!this.searchable) {
            navigationItem.searchController = null;
            return;
        }
        if (!this._searchController) {
            const controller = UISearchController.alloc().initWithSearchResultsController(null);
            this._searchDelegate = SearchDelegate.initWithOwner(this);
            controller.searchResultsUpdater = this._searchDelegate;
            controller.searchBar.delegate = this._searchDelegate;
            controller.obscuresBackgroundDuringPresentation = false;
            this._searchController = controller;
        }
        const searchBar = this._searchController.searchBar;
        searchBar.placeholder = this.searchHint ?? null;
        // the field follows the color of the bar
        const color = this.color instanceof Color ? this.color : this.color ? new Color(this.color as any) : null;
        const field = searchBar.searchTextField;
        if (color && field) {
            field.textColor = color.ios;
            field.tintColor = color.ios;
            field.leftView && (field.leftView.tintColor = color.ios);
            if (this.searchHint) {
                field.attributedPlaceholder = NSAttributedString.alloc().initWithStringAttributes(this.searchHint, {
                    [NSForegroundColorAttributeName]: new Color(150, color.r, color.g, color.b).ios
                } as any);
            }
        }
        // the search bar stays visible unless the bar scrolls away
        navigationItem.hidesSearchBarWhenScrolling = behavior === 'hide';
        if ('preferredSearchBarPlacement' in navigationItem) {
            // iOS 16+: the search bar under the title, as with large titles
            (navigationItem as any).preferredSearchBarPlacement = SEARCH_PLACEMENTS[this.searchPlacement || 'stacked'] ?? 2;
        }
        if ('searchBarPlacementAllowsToolbarIntegration' in navigationItem) {
            (navigationItem as any).searchBarPlacementAllowsToolbarIntegration = !!this.bottomItems?.some((item) => item.search);
        }
        navigationItem.searchController = this._searchController;
        (this.page.ios as UIViewController).definesPresentationContext = true;
    }

    private _inlineTitleTarget: View;
    private _inlineTitleListener: () => void;
    private _expandedBarHeight = 0;
    private _inlineTitleShown = false;

    /**
     * A large title on a pushed page uses the UIKit `Always` mode, which never shows the inline title once collapsed:
     * a title view is shown while the bar is collapsed (the height of the bar tells).
     */
    private observeInlineTitle(target: View) {
        const viewController = this.page?.ios as UIViewController;
        if (!viewController || this._inlineTitleTarget === target) {
            return;
        }
        if (this._inlineTitleTarget) {
            this._inlineTitleTarget.off('scroll', this._inlineTitleListener);
        }
        this._inlineTitleTarget = target;
        this._inlineTitleListener = () => this.updateInlineTitle();
        target.on('scroll', this._inlineTitleListener);
    }

    private updateInlineTitle() {
        const viewController = this.page?.ios as UIViewController;
        const navigationItem = viewController?.navigationItem;
        const navigationBar = viewController?.navigationController?.navigationBar;
        if (!navigationItem || !navigationBar || this.titleView || this.size === 'small' || navigationItem.largeTitleDisplayMode !== UINavigationItemLargeTitleDisplayMode.Always) {
            return;
        }
        const height = navigationBar.frame.size.height;
        this._expandedBarHeight = Math.max(this._expandedBarHeight, height);
        const collapsed = height < this._expandedBarHeight - 20;
        if (collapsed === this._inlineTitleShown) {
            return;
        }
        this._inlineTitleShown = collapsed;
        if (!collapsed) {
            navigationItem.titleView = null;
            return;
        }
        const label = UILabel.new();
        label.textAlignment = NSTextAlignment.Center;
        const attributes = (navigationItem.standardAppearance ?? navigationBar.standardAppearance)?.titleTextAttributes;
        const text = NSMutableAttributedString.new();
        const title = this.formattedTitle ? (createNativeFormattedText(this.formattedTitle) as NSAttributedString) : NSAttributedString.alloc().initWithStringAttributes(this.title ?? '', attributes);
        text.appendAttributedString(title);
        label.attributedText = text;
        label.sizeToFit();
        navigationItem.titleView = label;
    }

    private applyScrollTarget(viewController: UIViewController) {
        const target = this.getScrollTarget();
        if (!target) {
            return;
        }
        const scrollView = findScrollView(target);
        if (scrollView) {
            (viewController as any).setContentScrollViewForEdge(scrollView, NSDirectionalRectEdge.Top);
            // the bottom toolbar follows the same scrolling view (scroll edge effect under the glass buttons)
            (viewController as any).setContentScrollViewForEdge(scrollView, NSDirectionalRectEdge.Bottom);
            this.observeInlineTitle(target);
        } else if (!this._scrollTargetLoadedHandler) {
            // not created yet
            this._scrollTargetLoadedHandler = () => {
                target.off('loaded', this._scrollTargetLoadedHandler);
                this._scrollTargetLoadedHandler = null;
                this.update();
            };
            target.on('loaded', this._scrollTargetLoadedHandler);
        }
    }
}

/**
 * iOS: the navigation controller of the Frame already owns the bar (large title, blur, scroll edge effect): the page is a regular Page.
 */
export class AppPage extends Page {
    scrollBehavior: AppBarScrollBehavior = 'none';
    private _overlay: View;

    /** views anchored to the page (a FAB, a bottom bar...) instead of the scrolling content: they are laid out over the content */
    get overlay() {
        return this._overlay;
    }
    set overlay(value: View) {
        if (this._overlay === value) {
            return;
        }
        if (this._overlay) {
            this._removeView(this._overlay);
        }
        this._overlay = value;
        if (value) {
            this._addView(value);
        }
    }

    _addChildFromBuilder(name: string, value: any) {
        if (value instanceof AppPageOverlay) {
            this.overlay = value;
        } else if (value instanceof AppPageSearchContent) {
            // Android only (full screen search)
        } else if (value instanceof AppBarBase) {
            // core only matches the constructor name 'ActionBar' (@akylas/nativescript)
            this.actionBar = value;
        } else {
            super._addChildFromBuilder(name, value);
        }
    }

    eachChildView(callback: (child: View) => boolean) {
        super.eachChildView(callback);
        if (this._overlay) {
            callback(this._overlay);
        }
    }

    onMeasure(widthMeasureSpec: number, heightMeasureSpec: number) {
        super.onMeasure(widthMeasureSpec, heightMeasureSpec);
        if (this._overlay) {
            const width = Utils.layout.getMeasureSpecSize(widthMeasureSpec);
            const height = Utils.layout.getMeasureSpecSize(heightMeasureSpec);
            View.measureChild(this, this._overlay, Utils.layout.makeMeasureSpec(width, Utils.layout.EXACTLY), Utils.layout.makeMeasureSpec(height, Utils.layout.EXACTLY));
        }
    }

    onLayout(left: number, top: number, right: number, bottom: number) {
        super.onLayout(left, top, right, bottom);
        if (this._overlay) {
            // inside the safe area (also when the content ignores it)
            const safeArea = (this.nativeViewProtected as UIView).safeAreaInsets;
            const insets = {
                left: Utils.layout.toDevicePixels(safeArea.left),
                top: Utils.layout.toDevicePixels(safeArea.top),
                right: Utils.layout.toDevicePixels(safeArea.right),
                bottom: Utils.layout.toDevicePixels(safeArea.bottom)
            };
            View.layoutChild(this, this._overlay, insets.left, insets.top, right - insets.right, bottom - insets.bottom);
        }
    }
}
