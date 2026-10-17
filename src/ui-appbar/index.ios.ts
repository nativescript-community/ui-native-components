import { Color, Page, View } from '@nativescript/core';
import { createNativeFormattedText } from '@nativescript-community/ui-core/formatted-text';
import { createNativeMenu, getNativeIcon } from '@nativescript-community/ui-menu';
import { AppBarBase, AppBarItem, AppBarScrollBehavior, AppBarSize } from './index-common';
export { AppBarItem, AppBarScrollBehavior, AppBarSize };

function findScrollView(view: View): UIScrollView {
    const native = view?.nativeViewProtected as any;
    if (!native) {
        return null;
    }
    if (native instanceof UIScrollView) {
        return native;
    }
    return native.scrollView instanceof UIScrollView ? native.scrollView : null;
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
 * - `scrollTarget`: the scroll view the bar follows (setContentScrollView), by default UIKit finds the first one
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
        if (size !== 'small') {
            navigationBar.prefersLargeTitles = true;
        }
        navigationItem.largeTitleDisplayMode = size === 'small' ? UINavigationItemLargeTitleDisplayMode.Never : isRoot ? UINavigationItemLargeTitleDisplayMode.Automatic : UINavigationItemLargeTitleDisplayMode.Always;

        // appearances: one for the bar when content scrolls under it (standard) and one at the top (scroll edge)
        const base = (navigationBar.standardAppearance ?? UINavigationBarAppearance.new()).copy() as UINavigationBarAppearance;
        const standard = base.copy() as UINavigationBarAppearance;
        const edge = base.copy() as UINavigationBarAppearance;
        if (this.translucent) {
            standard.backgroundEffect = UIBlurEffect.effectWithStyle(UIBlurEffectStyle.SystemChromeMaterial);
            standard.backgroundColor = null;
            edge.backgroundEffect = null;
            edge.backgroundColor = UIColor.clearColor;
            edge.shadowColor = UIColor.clearColor;
        } else if (behavior === 'lift') {
            edge.shadowColor = UIColor.clearColor;
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

        this.applySearch(navigationItem, behavior);
        this.applyScrollTarget(viewController);
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
                field.attributedPlaceholder = NSAttributedString.alloc().initWithStringAttributes(this.searchHint, { [NSForegroundColorAttributeName]: new Color(150, color.r, color.g, color.b).ios } as any);
            }
        }
        // the search bar stays visible unless the bar scrolls away
        navigationItem.hidesSearchBarWhenScrolling = behavior === 'hide';
        if ('preferredSearchBarPlacement' in navigationItem) {
            // iOS 16+: the search bar under the title, as with large titles
            (navigationItem as any).preferredSearchBarPlacement = 2; /* UINavigationItemSearchBarPlacementStacked */
        }
        navigationItem.searchController = this._searchController;
        (this.page.ios as UIViewController).definesPresentationContext = true;
    }

    private applyScrollTarget(viewController: UIViewController) {
        const target = this.scrollTarget;
        if (!target) {
            return;
        }
        const scrollView = findScrollView(target);
        if (scrollView) {
            (viewController as any).setContentScrollViewForEdge(scrollView, NSDirectionalRectEdge.Top);
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
}
