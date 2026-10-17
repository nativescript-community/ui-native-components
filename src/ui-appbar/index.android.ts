import { ActionBar, Color, Page, Utils, View } from '@nativescript/core';
import { createNativeFormattedText } from '@nativescript-community/ui-core/formatted-text';
import { AppBarBase, AppBarItem, AppBarScrollBehavior, AppBarSize } from './index-common';
export { AppBarItem, AppBarScrollBehavior, AppBarSize };

const MATCH_PARENT = -1;
const WRAP_CONTENT = -2;
const COLLAPSE_MODE_PIN = 1;

function getActionBarSize(context: android.content.Context) {
    const value = new android.util.TypedValue();
    if (context.getTheme().resolveAttribute(16843499 /* android.R.attr.actionBarSize */, value, true)) {
        return android.util.TypedValue.complexToDimensionPixelSize(value.data, context.getResources().getDisplayMetrics());
    }
    return Math.round(56 * Utils.layout.getDisplayDensity());
}

/**
 * Android: a Material Toolbar. In an `AppPage` it lives in an `AppBarLayout`: `size` medium / large use a M3 `CollapsingToolbarLayout`,
 * `scrollBehavior` the scroll flags / lift on scroll of the AppBarLayout.
 */
export class AppBar extends AppBarBase {
    onAppBarPropertyChanged() {
        super.onAppBarPropertyChanged();
        const page = this.page;
        if (page instanceof AppPage) {
            page.syncAppBar();
        }
    }

    update() {
        super.update();
        const page = this.page;
        if (page instanceof AppPage) {
            page.syncAppBar();
        }
    }

    _addActionItems() {
        // @ts-ignore
        super._addActionItems();
        if (this.searchable) {
            this.addSearchItem();
        }
    }

    /** a collapsible SearchView as the first action */
    private addSearchItem() {
        const toolbar = this.nativeViewProtected as androidx.appcompat.widget.Toolbar;
        const menu = toolbar.getMenu();
        const item = menu.add(0, 0x7f0a5ea1, 0, this.searchHint || 'Search');
        const context = toolbar.getContext();
        item.setIcon(android.R.drawable.ic_menu_search);
        const color = this.color instanceof Color ? this.color : this.color ? new Color(this.color as any) : null;
        if (color) {
            androidx.core.view.MenuItemCompat.setIconTintList(item, android.content.res.ColorStateList.valueOf(color.android));
        }
        item.setShowAsAction(android.view.MenuItem.SHOW_AS_ACTION_ALWAYS | android.view.MenuItem.SHOW_AS_ACTION_COLLAPSE_ACTION_VIEW);
        const searchView = new androidx.appcompat.widget.SearchView(context);
        searchView.setQueryHint(this.searchHint ?? null);
        searchView.setMaxWidth(java.lang.Integer.MAX_VALUE);
        const owner = new WeakRef(this);
        searchView.setOnQueryTextListener(
            new androidx.appcompat.widget.SearchView.OnQueryTextListener({
                onQueryTextChange: (text: string) => {
                    const bar = owner.get();
                    if (bar) {
                        bar.searchText = text;
                        bar.notify({ eventName: AppBarBase.searchChangeEvent, object: bar, text });
                    }
                    return true;
                },
                onQueryTextSubmit: (text: string) => {
                    const bar = owner.get();
                    bar?.notify({ eventName: AppBarBase.searchSubmitEvent, object: bar, text });
                    return false;
                }
            })
        );
        item.setOnActionExpandListener(
            new android.view.MenuItem.OnActionExpandListener({
                onMenuItemActionExpand: () => true,
                onMenuItemActionCollapse: () => {
                    const bar = owner.get();
                    if (bar) {
                        bar.searchText = '';
                        bar.notify({ eventName: AppBarBase.searchCancelEvent, object: bar, text: '' });
                    }
                    return true;
                }
            })
        );
        if (color) {
            // the SearchView follows the colors of the bar
            const R = (androidx.appcompat as any).R.id;
            const edit = searchView.findViewById(R.search_src_text) as android.widget.EditText;
            edit?.setTextColor(color.android);
            edit?.setHintTextColor(new Color(150, color.r, color.g, color.b).android);
            for (const id of [R.search_close_btn, R.search_mag_icon, R.search_button]) {
                const icon = searchView.findViewById(id) as android.widget.ImageView;
                icon?.setColorFilter(color.android);
            }
        }
        item.setActionView(searchView);
    }

    _updateTitleAndTitleView() {
        const page = this.page;
        const collapsing = page instanceof AppPage ? page.collapsingLayout : null;
        const toolbar = this.nativeViewProtected as androidx.appcompat.widget.Toolbar;
        if (this.titleView || (!this.formattedTitle && !this.subtitle && !collapsing)) {
            // @ts-ignore
            super._updateTitleAndTitleView();
            return;
        }
        const title: any = this.formattedTitle ? createNativeFormattedText(this.formattedTitle) : this.title;
        if (collapsing) {
            // the CollapsingToolbarLayout draws the title: the Toolbar one is empty
            toolbar.setTitle(null);
            collapsing.setTitle(title ?? null);
            if (typeof (collapsing as any).setSubtitle === 'function') {
                (collapsing as any).setSubtitle(this.subtitle ?? null);
            }
            toolbar.setSubtitle(null);
        } else {
            toolbar.setTitle(title ?? null);
            toolbar.setSubtitle(this.subtitle ?? null);
        }
    }
}

/**
 * Android: a Page whose content scrolls with a Material `AppBarLayout` (lift, hide, collapse...).
 *
 * The native tree is built INSIDE the root of the regular Page, so any library that replaces the Page root
 * (like gesturehandler `PageLayout`) keeps working:
 *
 *  root = super.createNativeView()          (GridLayout, or the gesturehandler PageLayout)
 *   `- CoordinatorLayout                    (row 1)
 *       |- AppBarLayout  <- the ActionBar Toolbar (in a CollapsingToolbarLayout for medium / large)
 *       `- ContentLayout (ScrollingViewBehavior) <- the page content
 */
export class AppPage extends Page {
    private _coordinator: any;
    private _appBarLayout: any;
    private _nativeContent: any;
    private _collapsing: any;
    private _collapsingSize: AppBarSize;
    private _scrollBehavior: AppBarScrollBehavior = 'none';

    /** the CollapsingToolbarLayout of a medium / large bar */
    get collapsingLayout(): com.google.android.material.appbar.CollapsingToolbarLayout {
        return this._collapsing;
    }

    /** the behavior of a bar which is not an AppBar (a core ActionBar) */
    get scrollBehavior() {
        return this._scrollBehavior;
    }
    set scrollBehavior(value: AppBarScrollBehavior) {
        this._scrollBehavior = value;
        this.syncAppBar();
    }

    createNativeView() {
        // the root can be replaced by another library (gesturehandler): never create it ourselves
        const root = super.createNativeView() as org.nativescript.widgets.GridLayout;
        const context = this._context;
        const CoordinatorLayout = androidx.coordinatorlayout.widget.CoordinatorLayout as any;
        const AppBarLayout = com.google.android.material.appbar.AppBarLayout as any;
        const coordinator = new CoordinatorLayout(context);
        const appBarLayout = new AppBarLayout(context);
        const content = new org.nativescript.widgets.ContentLayout(context);

        coordinator.addView(appBarLayout, new CoordinatorLayout.LayoutParams(MATCH_PARENT, WRAP_CONTENT));
        const contentParams = new CoordinatorLayout.LayoutParams(MATCH_PARENT, MATCH_PARENT);
        contentParams.setBehavior(new AppBarLayout.ScrollingViewBehavior());
        coordinator.addView(content, contentParams);

        const params = new org.nativescript.widgets.CommonLayoutParams();
        params.width = MATCH_PARENT;
        params.height = MATCH_PARENT;
        params.row = 1;
        root.addView(coordinator, params);

        this._coordinator = coordinator;
        this._appBarLayout = appBarLayout;
        this._nativeContent = content;
        return root;
    }

    onLoaded() {
        super.onLoaded();
        // the bar draws under the status bar: the AppBarLayout pads itself with the inset
        this.androidOverflowEdge = 'top';
        // the root does not pad itself with the status bar inset anymore: the AppBarLayout (and its background) does
        this._appBarLayout?.setPadding(0, this.getStatusBarHeight(), 0, 0);
        this.syncAppBar();
    }

    disposeNativeView() {
        this._coordinator = null;
        this._appBarLayout = null;
        this._nativeContent = null;
        this._collapsing = null;
        super.disposeNativeView();
    }

    private getStatusBarHeight() {
        const root = this.nativeViewProtected;
        const insets = androidx.core.view.ViewCompat.getRootWindowInsets(root);
        if (insets) {
            const types = androidx.core.view.WindowInsetsCompat.Type.statusBars() | androidx.core.view.WindowInsetsCompat.Type.displayCutout();
            return insets.getInsets(types).top;
        }
        const resources = this._context.getResources();
        const id = resources.getIdentifier('status_bar_height', 'dimen', 'android');
        return id > 0 ? resources.getDimensionPixelSize(id) : 0;
    }

    /** moves the toolbar between the AppBarLayout and a CollapsingToolbarLayout and applies the scroll settings */
    syncAppBar() {
        const appBarLayout = this._appBarLayout as com.google.android.material.appbar.AppBarLayout;
        if (!appBarLayout) {
            return;
        }
        const bar = this.hasActionBar ? this.actionBar : null;
        const toolbar = bar?.nativeViewProtected as androidx.appcompat.widget.Toolbar;
        if (!toolbar) {
            return;
        }
        const context = this._context;
        const appBar = bar instanceof AppBar ? bar : null;
        const size: AppBarSize = appBar?.size ?? 'small';
        const behavior: AppBarScrollBehavior = appBar && appBar.scrollBehavior !== 'none' ? appBar.scrollBehavior : this._scrollBehavior;
        const translucent = !!appBar?.translucent;
        const AppBarLayoutParams = com.google.android.material.appbar.AppBarLayout.LayoutParams as any;
        const CollapsingParams = com.google.android.material.appbar.CollapsingToolbarLayout.LayoutParams as any;

        // 1. the structure
        if (size === 'small') {
            if (this._collapsing) {
                (toolbar.getParent() as android.view.ViewGroup)?.removeView(toolbar);
                appBarLayout.removeView(this._collapsing);
                this._collapsing = null;
                this._collapsingSize = null;
            }
            if (toolbar.getParent() !== appBarLayout) {
                (toolbar.getParent() as android.view.ViewGroup)?.removeView(toolbar);
                appBarLayout.addView(toolbar, new AppBarLayoutParams(MATCH_PARENT, WRAP_CONTENT));
            }
        } else if (this._collapsingSize !== size || !this._collapsing) {
            (toolbar.getParent() as android.view.ViewGroup)?.removeView(toolbar);
            if (this._collapsing) {
                appBarLayout.removeView(this._collapsing);
            }
            const resources = context.getResources();
            const id = resources.getIdentifier(size === 'large' ? 'ns_appbar_collapsing_large' : 'ns_appbar_collapsing_medium', 'layout', context.getPackageName());
            const collapsing = android.view.LayoutInflater.from(context).inflate(id, appBarLayout, false) as com.google.android.material.appbar.CollapsingToolbarLayout;
            const toolbarParams = new CollapsingParams(MATCH_PARENT, getActionBarSize(context));
            toolbarParams.setCollapseMode(COLLAPSE_MODE_PIN);
            collapsing.addView(toolbar, toolbarParams);
            appBarLayout.addView(collapsing);
            this._collapsing = collapsing;
            this._collapsingSize = size;
            // the title now belongs to the collapsing layout
            bar.update();
        }

        // 2. the scroll behavior: the flags are on the direct child of the AppBarLayout
        const child = this._collapsing || toolbar;
        const params = child.getLayoutParams() as any;
        let flags = 0;
        if (size !== 'small') {
            flags = AppBarLayoutParams.SCROLL_FLAG_SCROLL | AppBarLayoutParams.SCROLL_FLAG_EXIT_UNTIL_COLLAPSED;
            if (behavior === 'hide') {
                flags |= AppBarLayoutParams.SCROLL_FLAG_ENTER_ALWAYS | AppBarLayoutParams.SCROLL_FLAG_SNAP;
            }
        } else if (behavior === 'hide') {
            flags = AppBarLayoutParams.SCROLL_FLAG_SCROLL | AppBarLayoutParams.SCROLL_FLAG_ENTER_ALWAYS | AppBarLayoutParams.SCROLL_FLAG_SNAP;
        }
        if (params.getScrollFlags() !== flags) {
            params.setScrollFlags(flags);
            child.setLayoutParams(params);
        }
        appBarLayout.setLiftOnScroll(behavior === 'lift');

        // 3. colors: the collapsing area is not the Toolbar
        const toColor = (value: string | Color) => (value instanceof Color ? value : value ? new Color(value) : null);
        const backgroundColor = toColor(bar.backgroundColor);
        if (backgroundColor && !translucent) {
            appBarLayout.setBackgroundColor(backgroundColor.android);
        }
        const color = toColor(bar.color as any);
        if (color) {
            toolbar.setSubtitleTextColor(color.android);
        }
        if (this._collapsing && color) {
            this._collapsing.setCollapsedTitleTextColor(color.android);
            this._collapsing.setExpandedTitleColor(color.android);
            // the subtitle API of the CollapsingToolbarLayout (Material 1.13+)
            const c: any = this._collapsing;
            c.setCollapsedSubtitleTextColor?.(color.android);
            c.setExpandedSubtitleColor?.(color.android);
        }

        // 4. translucent: the content goes under the bar
        const contentParams = this._nativeContent.getLayoutParams() as any;
        const hasBehavior = !!contentParams.getBehavior();
        if (translucent === hasBehavior) {
            const AppBarLayout = com.google.android.material.appbar.AppBarLayout as any;
            contentParams.setBehavior(translucent ? null : new AppBarLayout.ScrollingViewBehavior());
            this._nativeContent.setLayoutParams(contentParams);
            if (translucent) {
                appBarLayout.setBackgroundColor(android.graphics.Color.TRANSPARENT);
                appBarLayout.setStateListAnimator(null);
                appBarLayout.setElevation(0);
                appBarLayout.bringToFront();
            }
        }
    }

    _addViewToNativeVisualTree(child: View, atIndex = Number.MAX_SAFE_INTEGER): boolean {
        const nativeChild = child.nativeViewProtected;
        if (!this.nativeViewProtected || !nativeChild || !this._coordinator) {
            return false;
        }
        if (child instanceof ActionBar) {
            const AppBarLayout = com.google.android.material.appbar.AppBarLayout as any;
            this._appBarLayout.addView(nativeChild, new AppBarLayout.LayoutParams(MATCH_PARENT, WRAP_CONTENT));
            this.syncAppBar();
        } else {
            this._nativeContent.addView(nativeChild, atIndex);
        }
        return true;
    }

    _removeViewFromNativeVisualTree(child: View) {
        const nativeChild = child.nativeViewProtected;
        const parent = nativeChild?.getParent() as android.view.ViewGroup;
        parent?.removeView(nativeChild);
    }
}
