import { ActionBar, Color, Page, Utils, View } from '@nativescript/core';
import { createNativeFormattedText } from '@nativescript-community/ui-core/formatted-text';
import { getNativeIcon } from '@nativescript-community/ui-menu';
import { AppBarBase, AppBarBottomItem, AppBarItem, AppBarScrollBehavior, AppBarSearchMode, AppBarSearchPlacement, AppBarSize, AppPageOverlay, AppPageSearchContent, notifyBottomItemTap } from './index-common';
export { AppBarBottomItem, AppBarItem, AppBarScrollBehavior, AppBarSearchMode, AppBarSearchPlacement, AppBarSize, AppPageOverlay, AppPageSearchContent };

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
 * Badges (a number, a text, or a dot) on the actions of a toolbar. The previous ones are detached. The action views must exist: attached after the layout.
 */
function attachBadges(toolbar: androidx.appcompat.widget.Toolbar, previous: com.google.android.material.badge.BadgeDrawable[], wanted: { id: number; badge: string | number | boolean }[]) {
    const BadgeDrawable = com.google.android.material.badge.BadgeDrawable;
    const BadgeUtils = com.google.android.material.badge.BadgeUtils as any;
    previous.splice(0).forEach((badge: any) => BadgeUtils.detachBadgeDrawable(badge, toolbar, badge.__itemId));
    if (!wanted.length) {
        return;
    }
    toolbar.post(
        new java.lang.Runnable({
            run: () => {
                wanted.forEach(({ id, badge }) => {
                    const drawable = BadgeDrawable.create(toolbar.getContext()) as any;
                    if (typeof badge === 'number') {
                        drawable.setNumber(badge);
                    } else if (typeof badge === 'string') {
                        drawable.setText(badge);
                    }
                    // `true`: the dot (no number, no text)
                    drawable.__itemId = id;
                    BadgeUtils.attachBadgeDrawable(drawable, toolbar, id);
                    previous.push(drawable);
                });
            }
        })
    );
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
        this.syncBadges();
        if (this.searchable && this.searchMode !== 'bar') {
            this.addSearchItem();
        }
    }

    private _badges: com.google.android.material.badge.BadgeDrawable[] = [];

    /** the badges of the actions (a number, a text or a dot): attached once the action views exist */
    private syncBadges() {
        const toolbar = this.nativeViewProtected as androidx.appcompat.widget.Toolbar;
        const items = ((this.actionItems as any)?.getVisibleItems() ?? []) as AppBarItem[];
        const wanted = items.filter((item) => item instanceof AppBarItem && item.badge !== undefined && item.badge !== null && (item.badge as any) !== false && (item.badge as any) !== '');
        attachBadges(toolbar, this._badges, wanted.map((item) => ({ id: (item as any)._getItemId(), badge: item.badge })));
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
    private _nativeOverlay: any;
    private _overlay: View;
    private _searchContent: View;
    private _searchBar: com.google.android.material.search.SearchBar;
    private _searchView: com.google.android.material.search.SearchView;
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

    /** views anchored to the page (a FAB, a bottom bar...) instead of the scrolling content */
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
            this.searchContent = value;
        } else {
            super._addChildFromBuilder(name, value);
        }
    }

    /** `searchMode="bar"`: the content of the full screen search (suggestions, results) */
    get searchContent() {
        return this._searchContent;
    }
    set searchContent(value: View) {
        if (this._searchContent === value) {
            return;
        }
        if (this._searchContent) {
            this._removeView(this._searchContent);
        }
        this._searchContent = value;
        if (value) {
            this._addView(value);
        }
    }

    eachChildView(callback: (child: View) => boolean) {
        super.eachChildView(callback);
        if (this._overlay) {
            callback(this._overlay);
        }
        if (this._searchContent) {
            callback(this._searchContent);
        }
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
        // above the content and the bar, no behavior: it does not move with them
        const overlay = new org.nativescript.widgets.ContentLayout(context);
        coordinator.addView(overlay, new CoordinatorLayout.LayoutParams(MATCH_PARENT, MATCH_PARENT));
        this._nativeOverlay = overlay;
        // the status bar area: the bar scrolls away under it, what it draws there (a faded title) is covered
        const scrim = new android.view.View(context);
        coordinator.addView(scrim, new CoordinatorLayout.LayoutParams(MATCH_PARENT, 0));
        // the AppBarLayout is elevated (lift on scroll): a sibling is drawn below it unless it is elevated more
        scrim.setElevation(Math.round(12 * Utils.layout.getDisplayDensity()));
        this._statusScrim = scrim;
        // the full screen search of the M3 SearchBar: on top of everything, hidden until the bar is tapped
        const searchView = new com.google.android.material.search.SearchView(context);
        coordinator.addView(searchView, new CoordinatorLayout.LayoutParams(MATCH_PARENT, MATCH_PARENT));
        this._searchView = searchView;

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
        const statusBarHeight = this.getStatusBarHeight();
        this._appBarLayout?.setPadding(0, statusBarHeight, 0, 0);
        const scrimParams = this._statusScrim.getLayoutParams();
        scrimParams.height = statusBarHeight;
        this._statusScrim.setLayoutParams(scrimParams);
        // the bar scrolls away under the status bar area: its content must not draw in the padding
        this._appBarLayout?.setClipToPadding(true);
        this.syncAppBar();
    }

    disposeNativeView() {
        this._coordinator = null;
        this._appBarLayout = null;
        this._nativeContent = null;
        this._nativeOverlay = null;
        this._bottomBar = null;
        this._statusScrim = null;
        this._searchBar = null;
        this._searchView = null;
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
        if (behavior === 'hide') {
            // the whole bar leaves the screen (also the pinned toolbar of a medium / large bar) and comes back as soon as the content scrolls up
            flags = AppBarLayoutParams.SCROLL_FLAG_SCROLL | AppBarLayoutParams.SCROLL_FLAG_ENTER_ALWAYS | AppBarLayoutParams.SCROLL_FLAG_SNAP;
        } else if (size !== 'small') {
            // the title collapses into the pinned toolbar
            flags = AppBarLayoutParams.SCROLL_FLAG_SCROLL | AppBarLayoutParams.SCROLL_FLAG_EXIT_UNTIL_COLLAPSED;
        }
        if (params.getScrollFlags() !== flags) {
            params.setScrollFlags(flags);
            child.setLayoutParams(params);
        }
        appBarLayout.setLiftOnScroll(behavior === 'lift');

        // 3. colors: the collapsing area is not the Toolbar
        const toColor = (value: string | Color) => (value instanceof Color ? value : value ? new Color(value) : null);
        const backgroundColor = toColor(bar.backgroundColor);
        if (backgroundColor) {
            // translucent: the content scrolls under the bar, which stays slightly see through
            const barColor = translucent ? androidx.core.graphics.ColorUtils.setAlphaComponent(backgroundColor.android, 217) : backgroundColor.android;
            appBarLayout.setBackgroundColor(barColor);
            this._statusScrim?.setBackgroundColor(barColor);
        } else if (translucent) {
            appBarLayout.setBackgroundColor(android.graphics.Color.TRANSPARENT);
        }
        if (this._collapsing && backgroundColor) {
            // the scrim drawn once the bar is collapsed: the color of the bar (the M3 default is the surface color)
            const scrim = translucent ? androidx.core.graphics.ColorUtils.setAlphaComponent(backgroundColor.android, 217) : backgroundColor.android;
            this._collapsing.setContentScrimColor(scrim);
            this._collapsing.setStatusBarScrimColor(scrim);
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

        // 4. translucent: the content goes under the bar. The behavior of the content places it below the bar: without it the content fills the page
        const contentParams = this._nativeContent.getLayoutParams() as any;
        const hasBehavior = !!contentParams.getBehavior();
        if (translucent === hasBehavior) {
            const AppBarLayout = com.google.android.material.appbar.AppBarLayout as any;
            contentParams.setBehavior(translucent ? null : new AppBarLayout.ScrollingViewBehavior());
            this._nativeContent.setLayoutParams(contentParams);
            if (translucent) {
                appBarLayout.bringToFront();
            }
        }
        appBarLayout.setElevation(translucent ? 0 : appBarLayout.getElevation());
        this.syncTranslucentInset(appBar, translucent);
        this.syncBottomBar(appBar, behavior);
        this.syncSearchBar(appBar);
    }

    private _statusScrim: android.view.View;
    private _searchBarSetup = false;
    /** `searchMode="bar"`: a Material 3 SearchBar under the toolbar that opens the full screen SearchView */
    private syncSearchBar(appBar: AppBar) {
        const appBarLayout = this._appBarLayout as com.google.android.material.appbar.AppBarLayout;
        const wanted = !!appBar?.searchable && appBar.searchMode === 'bar';
        if (!wanted) {
            if (this._searchBar) {
                this._searchBar.setVisibility(android.view.View.GONE);
            }
            return;
        }
        const AppBarLayoutParams = com.google.android.material.appbar.AppBarLayout.LayoutParams as any;
        if (!this._searchBar) {
            const searchBar = new com.google.android.material.search.SearchBar(this._context);
            const density = Utils.layout.getDisplayDensity();
            const params = new AppBarLayoutParams(MATCH_PARENT, WRAP_CONTENT);
            params.setMargins(Math.round(16 * density), Math.round(8 * density), Math.round(16 * density), Math.round(8 * density));
            params.setScrollFlags(AppBarLayoutParams.SCROLL_FLAG_SCROLL | AppBarLayoutParams.SCROLL_FLAG_ENTER_ALWAYS);
            appBarLayout.addView(searchBar, params);
            this._searchBar = searchBar;
        }
        const searchBar = this._searchBar;
        searchBar.setVisibility(android.view.View.VISIBLE);
        // below the toolbar / collapsing bar
        const last = appBarLayout.getChildCount() - 1;
        if (appBarLayout.indexOfChild(searchBar) !== last) {
            appBarLayout.removeView(searchBar);
            appBarLayout.addView(searchBar);
        }
        searchBar.setHint(appBar.searchHint ?? null);
        const searchView = this._searchView;
        searchView.setHint(appBar.searchHint ?? null);
        if (!this._searchBarSetup) {
            this._searchBarSetup = true;
            searchView.setupWithSearchBar(searchBar);
            const owner = new WeakRef(appBar);
            searchView.getEditText().addTextChangedListener(
                new android.text.TextWatcher({
                    beforeTextChanged: () => null,
                    onTextChanged: () => null,
                    afterTextChanged: (editable: android.text.Editable) => {
                        const bar = owner.get();
                        const text = editable.toString();
                        if (bar && bar.searchText !== text) {
                            bar.searchText = text;
                            bar.notify({ eventName: AppBarBase.searchChangeEvent, object: bar, text });
                        }
                    }
                })
            );
            searchView.getEditText().setOnEditorActionListener(
                new android.widget.TextView.OnEditorActionListener({
                    onEditorAction: () => {
                        const bar = owner.get();
                        bar?.notify({ eventName: AppBarBase.searchSubmitEvent, object: bar, text: searchView.getText().toString() });
                        return false;
                    }
                })
            );
            searchView.addTransitionListener(
                new com.google.android.material.search.SearchView.TransitionListener({
                    onStateChanged: (view: any, previousState: any, newState: any) => {
                        if (String(newState) === 'HIDDEN') {
                            const bar = owner.get();
                            if (bar) {
                                bar.searchText = '';
                                bar.notify({ eventName: AppBarBase.searchCancelEvent, object: bar, text: '' });
                            }
                        }
                    }
                })
            );
        }
    }

    private _bottomBadges: com.google.android.material.badge.BadgeDrawable[] = [];
    private _bottomBar: com.google.android.material.bottomappbar.BottomAppBar;
    private _bottomInsetListener: any;
    /** `bottomItems`: a Material BottomAppBar, over the content, below the overlay */
    private syncBottomBar(appBar: AppBar, behavior: AppBarScrollBehavior) {
        const items = (appBar?.bottomItems || []).filter((item) => !item.spacer);
        const coordinator = this._coordinator as androidx.coordinatorlayout.widget.CoordinatorLayout;
        if (!items.length) {
            if (this._bottomBar) {
                this._bottomBar.setVisibility(android.view.View.GONE);
                this.syncBottomInset(appBar, false);
            }
            return;
        }
        const BottomAppBar = com.google.android.material.bottomappbar.BottomAppBar as any;
        const CoordinatorLayout = androidx.coordinatorlayout.widget.CoordinatorLayout as any;
        if (!this._bottomBar) {
            const bar = new BottomAppBar(this._context) as com.google.android.material.bottomappbar.BottomAppBar;
            const params = new CoordinatorLayout.LayoutParams(MATCH_PARENT, WRAP_CONTENT);
            params.gravity = android.view.Gravity.BOTTOM;
            // below the overlay (a FAB, a panel)
            coordinator.addView(bar, coordinator.indexOfChild(this._nativeOverlay), params);
            this._bottomBar = bar;
        }
        const bar = this._bottomBar;
        bar.setVisibility(android.view.View.VISIBLE);
        bar.setHideOnScroll(behavior === 'hide');
        const menu = bar.getMenu();
        menu.clear();
        const owner = new WeakRef(appBar);
        items.forEach((item, index) => {
            const menuItem = menu.add(0, index, index, item.text || '');
            const icon = item.icon ? getNativeIcon(item.icon) : null;
            if (icon) {
                menuItem.setIcon(icon);
            }
            menuItem.setShowAsAction(android.view.MenuItem.SHOW_AS_ACTION_ALWAYS);
        });
        attachBadges(
            bar,
            this._bottomBadges,
            items.map((item, index) => ({ id: index, badge: item.badge })).filter((entry) => entry.badge !== undefined && entry.badge !== null && (entry.badge as any) !== false && (entry.badge as any) !== '')
        );
        bar.setOnMenuItemClickListener(
            new androidx.appcompat.widget.Toolbar.OnMenuItemClickListener({
                onMenuItemClick: (menuItem: android.view.MenuItem) => {
                    const target = owner.get();
                    if (target) {
                        notifyBottomItemTap(target, items[menuItem.getItemId()]);
                    }
                    return true;
                }
            })
        );
        this.syncBottomInset(appBar, true);
    }

    /** the last items of the scrolling view must not stay under the bottom bar */
    private syncBottomInset(appBar: AppBar, visible: boolean) {
        const bar = this._bottomBar;
        const target = appBar?.scrollTarget?.nativeViewProtected as android.view.View;
        if (this._bottomInsetListener) {
            bar.removeOnLayoutChangeListener(this._bottomInsetListener);
            this._bottomInsetListener = null;
        }
        if (!target) {
            return;
        }
        if (!visible) {
            if (target['__appBarBottomPadding'] !== undefined) {
                target.setPadding(target.getPaddingLeft(), target.getPaddingTop(), target.getPaddingRight(), target['__appBarBottomPadding']);
                target['__appBarBottomPadding'] = undefined;
            }
            return;
        }
        const apply = () => {
            if (target['__appBarBottomPadding'] === undefined) {
                target['__appBarBottomPadding'] = target.getPaddingBottom();
            }
            if (target instanceof android.view.ViewGroup) {
                target.setClipToPadding(false);
            }
            target.setPadding(target.getPaddingLeft(), target.getPaddingTop(), target.getPaddingRight(), bar.getHeight());
        };
        this._bottomInsetListener = new android.view.View.OnLayoutChangeListener({
            onLayoutChange: () => {
                if (target.getPaddingBottom() !== bar.getHeight() && this._bottomInsetListener) {
                    apply();
                }
            }
        });
        bar.addOnLayoutChangeListener(this._bottomInsetListener);
        apply();
    }


    private _insetListener: any;
    /** translucent: the first items of the scrolling view must start below the bar: its top padding follows the height of the bar */
    private syncTranslucentInset(appBar: AppBar, translucent: boolean) {
        const appBarLayout = this._appBarLayout as com.google.android.material.appbar.AppBarLayout;
        const target = appBar?.scrollTarget?.nativeViewProtected as android.view.View;
        if (this._insetListener) {
            appBarLayout.removeOnLayoutChangeListener(this._insetListener);
            this._insetListener = null;
        }
        if (!target) {
            return;
        }
        if (!translucent) {
            if (target['__appBarPadding'] !== undefined) {
                target.setPadding(target.getPaddingLeft(), target['__appBarPadding'], target.getPaddingRight(), target.getPaddingBottom());
                target['__appBarPadding'] = undefined;
            }
            return;
        }
        const apply = () => {
            if (target['__appBarPadding'] === undefined) {
                target['__appBarPadding'] = target.getPaddingTop();
            }
            if (target instanceof android.view.ViewGroup) {
                target.setClipToPadding(false);
            }
            // only the part of the bar that does not scroll away: the height of the expanded bar
            target.setPadding(target.getPaddingLeft(), appBarLayout.getHeight(), target.getPaddingRight(), target.getPaddingBottom());
        };
        this._insetListener = new android.view.View.OnLayoutChangeListener({
            onLayoutChange: () => {
                if (target.getPaddingTop() !== appBarLayout.getHeight() && this._insetListener) {
                    apply();
                }
            }
        });
        appBarLayout.addOnLayoutChangeListener(this._insetListener);
        apply();
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
        } else if (child === this._overlay) {
            this._nativeOverlay.addView(nativeChild, atIndex);
        } else if (child === this._searchContent) {
            this._searchView.addView(nativeChild);
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
