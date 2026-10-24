import { ActionBar, Application, Color, ContentView, EventData, FormattedString, ImageSource, Page, TextField, Utils, View } from '@nativescript/core';
import { createNativeFormattedText } from '@nativescript-community/ui-core/formatted-text';
import { getNativeIcon, showMenu } from '@nativescript-community/ui-menu';
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
    AppPageOverlay,
    AppPageSearchContent,
    notifyBottomItemTap
} from './index-common';
export { AppBarBottomItem, AppBarBottomView, AppBarItem, AppBarScrollBehavior, AppBarSearchField, AppBarSearchMode, AppBarSearchPlacement, AppBarSize, AppPageOverlay, AppPageSearchContent };

const MATCH_PARENT = -1;
const WRAP_CONTENT = -2;
const COLLAPSE_MODE_PIN = 1;
const MATERIAL_NAVIGATION_ICONS: Record<string, string> = {
    ic_menu_back: 'abc_ic_ab_back_material',
    ic_menu_close_clear_cancel: 'abc_ic_clear_material'
};

function getActionBarSize(context: android.content.Context) {
    const value = new android.util.TypedValue();
    if (context.getTheme().resolveAttribute(16843499 /* android.R.attr.actionBarSize */, value, true)) {
        return android.util.TypedValue.complexToDimensionPixelSize(value.data, context.getResources().getDisplayMetrics());
    }
    return Math.round(56 * Utils.layout.getDisplayDensity());
}

function getMaterialAttr(name: string): number {
    return Utils.android.resources.getId(':attr/' + name);
}

/** a color of the Material theme (colorSurface, colorOnSurface...) */
function getThemeColor(view: android.view.View, name: string, fallback: number) {
    // the theme of a view context is a copy made when the view was created: with dynamic colors it keeps the day/night colors of that time.
    // The theme of the activity is the one that is applied again when the mode changes
    const activity = Application.android.foregroundActivity || Application.android.startActivity;
    return com.google.android.material.color.MaterialColors.getColor(activity || view.getContext(), getMaterialAttr(name), fallback);
}

let noShadowOutline: android.view.ViewOutlineProvider;
/** a view that only takes part in the stacking order (elevation) casts no shadow */
function getNoShadowOutline() {
    if (!noShadowOutline) {
        // @ts-ignore abstract class: extended through the runtime
        const NoShadowOutline = android.view.ViewOutlineProvider.extend({ getOutline: (_view, outline) => outline.setEmpty() });
        noShadowOutline = new NoShadowOutline();
    }
    return noShadowOutline;
}

/** the SearchBar draws its fill in a MaterialShapeDrawable under a ripple / focus ring layer */
function findShapeDrawable(drawable: android.graphics.drawable.Drawable): com.google.android.material.shape.MaterialShapeDrawable {
    if (drawable instanceof com.google.android.material.shape.MaterialShapeDrawable) {
        return drawable;
    }
    if (drawable instanceof android.graphics.drawable.LayerDrawable) {
        for (let index = 0; index < drawable.getNumberOfLayers(); index++) {
            const found = findShapeDrawable(drawable.getDrawable(index));
            if (found) {
                return found;
            }
        }
    }
    return null;
}

function toNativeColor(value: any): number {
    if (!value) {
        return null;
    }
    return (value instanceof Color ? value : new Color(value)).android;
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
                wanted.forEach(({ badge, id }) => {
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
    // a Material 3 toolbar: tinted navigation icon, centered title...
    createNativeView() {
        return new com.google.android.material.appbar.MaterialToolbar(this._context);
    }

    // in an AppPage the surface of the bar is the AppBarLayout (lift, translucent, collapsing area): the toolbar is transparent
    // @ts-ignore
    _redrawNativeBackground(value: any) {
        if (this.page instanceof AppPage) {
            return;
        }
        // @ts-ignore
        super._redrawNativeBackground(value);
    }

    /** the color of the bar: the css `background-color`, else the surface color of the theme */
    getBarColor(): number {
        const toolbar = this.nativeViewProtected as androidx.appcompat.widget.Toolbar;
        return toNativeColor(this.backgroundColor) ?? getThemeColor(toolbar, 'colorSurface', android.graphics.Color.WHITE);
    }

    /** the color of the title and the icons: the css `color`, else the on surface color of the theme */
    getOnBarColor(): number {
        const toolbar = this.nativeViewProtected as androidx.appcompat.widget.Toolbar;
        return toNativeColor(this.color) ?? getThemeColor(toolbar, 'colorOnSurface', android.graphics.Color.BLACK);
    }

    /** tints the navigation icon, the actions and the overflow icon with the color of the content of the bar */
    applyTints() {
        const toolbar = this.nativeViewProtected as com.google.android.material.appbar.MaterialToolbar;
        if (!toolbar) {
            return;
        }
        const tint = this.getOnBarColor();
        toolbar.setNavigationIconTint(tint);
        const list = android.content.res.ColorStateList.valueOf(tint);
        const menu = toolbar.getMenu();
        for (let i = 0; i < menu.size(); i++) {
            androidx.core.view.MenuItemCompat.setIconTintList(menu.getItem(i), list);
        }
        const overflow = toolbar.getOverflowIcon();
        if (overflow) {
            const wrapped = androidx.core.graphics.drawable.DrawableCompat.wrap(overflow.mutate());
            androidx.core.graphics.drawable.DrawableCompat.setTint(wrapped, tint);
            toolbar.setOverflowIcon(wrapped);
        }
    }

    // the back arrow and the close icon of the core are the old holo ones: use the Material (appcompat) ones
    _updateNavigationButton() {
        // @ts-ignore
        super._updateNavigationButton();
        const nav = this.navigationButton;
        const toolbar = this.nativeViewProtected as androidx.appcompat.widget.Toolbar;
        const drawableName = nav?.visibility === 'visible' ? MATERIAL_NAVIGATION_ICONS[nav.android?.systemIcon] : undefined;
        if (drawableName) {
            const context = this._context;
            const id = context.getResources().getIdentifier(drawableName, 'drawable', context.getPackageName());
            if (id) {
                toolbar.setNavigationIcon(androidx.core.content.ContextCompat.getDrawable(context, id));
            }
        }
    }

    _addViewToNativeVisualTree(child: View, atIndex?: number): boolean {
        // the page places them (search field, floating toolbar), not the toolbar
        return child === this.searchField || child === this.bottomView || super._addViewToNativeVisualTree(child, atIndex);
    }

    _removeViewFromNativeVisualTree(child: View) {
        if (child === this.searchField || child === this.bottomView) {
            const nativeChild = child.nativeViewProtected;
            (nativeChild?.getParent() as android.view.ViewGroup)?.removeView(nativeChild);
            return;
        }
        super._removeViewFromNativeVisualTree(child);
    }

    onAppBarPropertyChanged() {
        super.onAppBarPropertyChanged();
        const page = this.page;
        if (page instanceof AppPage) {
            page.syncAppBar();
        }
    }

    // @ts-ignore
    _onTitlePropertyChanged() {
        // @ts-ignore
        super._onTitlePropertyChanged();
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

    /** the toolbar is hidden while the SearchBar hosts the actions: the menu opens under the SearchBar */
    getMenuAnchor(): View {
        const page = this.page;
        const searchBar = page instanceof AppPage ? page.hostingSearchBar : null;
        return searchBar ? ({ nativeViewProtected: searchBar } as any) : this;
    }

    closeSearch() {
        const page = this.page;
        return page instanceof AppPage ? page.closeInlineSearch() : false;
    }

    focusSearch() {
        const page = this.page;
        return page instanceof AppPage ? page.openInlineSearch() : false;
    }

    _addActionItems() {
        // @ts-ignore
        super._addActionItems();
        this.applyItemIcons();
        this.syncBadges();
        if (this.searchable && this.searchMode === 'collapsible') {
            this.addSearchItem();
        }
        this.applyTints();
    }

    /** core only loads string icons: an ImageSource or a FormattedString (font icon) is converted here */
    private applyItemIcons() {
        const menu = (this.nativeViewProtected as androidx.appcompat.widget.Toolbar).getMenu();
        const items = ((this.actionItems as any)?.getVisibleItems() ?? []) as AppBarItem[];
        items.forEach((item) => {
            const icon: unknown = item.icon;
            if (icon instanceof ImageSource || icon instanceof FormattedString) {
                const drawable = getNativeIcon(icon);
                if (drawable) {
                    menu.findItem((item as any)._getItemId())?.setIcon(drawable);
                }
            }
        });
    }

    private _badges: com.google.android.material.badge.BadgeDrawable[] = [];

    /** the badges of the actions (a number, a text or a dot): attached once the action views exist */
    private syncBadges() {
        const toolbar = this.nativeViewProtected as androidx.appcompat.widget.Toolbar;
        const items = ((this.actionItems as any)?.getVisibleItems() ?? []) as AppBarItem[];
        const wanted = items.filter((item) => item instanceof AppBarItem && item.badge !== undefined && item.badge !== null && (item.badge as any) !== false && (item.badge as any) !== '');
        attachBadges(
            toolbar,
            this._badges,
            wanted.map((item) => ({ id: (item as any)._getItemId(), badge: item.badge }))
        );
    }

    /** a collapsible SearchView as the first action */
    private addSearchItem() {
        const toolbar = this.nativeViewProtected as androidx.appcompat.widget.Toolbar;
        const menu = toolbar.getMenu();
        const item = menu.add(0, 0x7f0a5ea1, 0, this.searchHint || 'Search');
        const context = toolbar.getContext();
        const iconId = context.getResources().getIdentifier('abc_ic_search_api_material', 'drawable', context.getPackageName());
        item.setIcon(iconId ? androidx.core.content.ContextCompat.getDrawable(context, iconId) : null);
        const onBar = this.getOnBarColor();
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
        {
            // the SearchView follows the colors of the bar
            const getId = (name: string) => Utils.android.resources.getId(':id/' + name);
            const edit = searchView.findViewById(getId('search_src_text')) as android.widget.EditText;
            edit?.setTextColor(onBar);
            edit?.setHintTextColor(androidx.core.graphics.ColorUtils.setAlphaComponent(onBar, 150));
            for (const name of ['search_close_btn', 'search_mag_icon', 'search_button', 'search_go_btn', 'search_voice_btn']) {
                const icon = searchView.findViewById(getId(name)) as android.widget.ImageView;
                icon?.setColorFilter(onBar);
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
        } else if (value instanceof AppBarBase) {
            // core only matches the constructor name 'ActionBar' (@akylas/nativescript)
            this.actionBar = value;
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
        // The root of the page applies the insets (status bar aside, handled by the AppBarLayout): the NativeScript layouts inside would apply them again
        // (the overlay would be shifted by the height of the keyboard). The coordinator consumes them.
        androidx.core.view.ViewCompat.setOnApplyWindowInsetsListener(
            coordinator,
            new androidx.core.view.OnApplyWindowInsetsListener({
                onApplyWindowInsets: () => androidx.core.view.WindowInsetsCompat.CONSUMED
            })
        );
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
        scrim.setOutlineProvider(getNoShadowOutline());
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

    private _softInputMode: number;

    onUnloaded() {
        // the activity gets its soft input mode back
        const activity = Application.android.foregroundActivity || Application.android.startActivity;
        if (this._softInputMode !== undefined && activity) {
            activity.getWindow().setSoftInputMode(this._softInputMode);
        }
        this._softInputMode = undefined;
        Application.off(Application.systemAppearanceChangedEvent, this._appearanceListener);
        super.onUnloaded();
    }

    // the activity handles `uiMode` itself (no recreate): the theme resolves the new colors right away, but the views keep the ones they were created with
    private _appearanceListener = () => {
        const bar = this.hasActionBar ? this.actionBar : null;
        if (bar instanceof AppBar) {
            bar.update();
        } else {
            this.syncAppBar();
        }
        this.syncStatusBarIcons();
    };

    /** the icons of the status bar follow the luminance of the bar drawn under it: the style of the page is not applied again by a live dark / light switch */
    private syncStatusBarIcons() {
        const window = (Application.android.foregroundActivity || Application.android.startActivity)?.getWindow();
        if (!window) {
            return;
        }
        // without an AppBar (actionBarHidden) the status bar is over the background of the page
        const bar = this.hasActionBar ? this.actionBar : null;
        const color = bar instanceof AppBar ? bar.getBarColor() : (toNativeColor(this.backgroundColor) ?? getThemeColor(this.nativeViewProtected, 'colorSurface', android.graphics.Color.WHITE));
        const light = androidx.core.graphics.ColorUtils.calculateLuminance(color) > 0.5;
        androidx.core.view.WindowCompat.getInsetsController(window, window.getDecorView()).setAppearanceLightStatusBars(light);
    }

    onLoaded() {
        super.onLoaded();
        // The root of the page pads itself with the keyboard (edge to edge): when the window also resizes for the keyboard (adjustResize)
        // the page area is reduced twice: the bar, the content and the overlay get squeezed. The root handles the keyboard alone.
        const activity = Application.android.foregroundActivity || Application.android.startActivity;
        if (activity && this._softInputMode === undefined) {
            const window = activity.getWindow();
            this._softInputMode = window.getAttributes().softInputMode;
            window.setSoftInputMode(android.view.WindowManager.LayoutParams.SOFT_INPUT_ADJUST_NOTHING | (this._softInputMode & 0x0f));
        }
        Application.on(Application.systemAppearanceChangedEvent, this._appearanceListener);
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
        this._liftTarget = null;
        this._liftContentListener = null;
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
        const params = child.getLayoutParams();
        // `hide` with a scroll target: the bar follows the scroll of the list itself (see syncHide), the AppBarLayout does not scroll
        const scrollTargetView = appBar?.getScrollTarget();
        const scrollTargetNative = scrollTargetView?.nativeViewProtected as android.view.View;
        const customHide = behavior === 'hide' && !!scrollTargetNative;
        let flags = 0;
        if (behavior === 'hide' && !customHide) {
            // the whole bar leaves the screen (also the pinned toolbar of a medium / large bar) and comes back as soon as the content scrolls up.
            // The AppBarLayout consumes the scroll first: the list starts to scroll when the bar is completely shown / hidden
            flags = AppBarLayoutParams.SCROLL_FLAG_SCROLL | AppBarLayoutParams.SCROLL_FLAG_ENTER_ALWAYS | AppBarLayoutParams.SCROLL_FLAG_SNAP;
        } else if (behavior !== 'hide' && size !== 'small') {
            // the title collapses into the pinned toolbar
            flags = AppBarLayoutParams.SCROLL_FLAG_SCROLL | AppBarLayoutParams.SCROLL_FLAG_EXIT_UNTIL_COLLAPSED;
        }
        if (params.getScrollFlags() !== flags) {
            params.setScrollFlags(flags);
            child.setLayoutParams(params);
        }

        // 3. the surface of the bar: the AppBarLayout. The toolbar is transparent and flat, the collapsing area and the status bar area follow the same color
        toolbar.setBackground(null);
        toolbar.setElevation(0);
        toolbar.setStateListAnimator(null);
        const AlphaTranslucent = 160;
        let barColor = appBar ? appBar.getBarColor() : (toNativeColor(bar.backgroundColor) ?? getThemeColor(toolbar, 'colorSurface', android.graphics.Color.WHITE));
        const onBarColor = appBar ? appBar.getOnBarColor() : (toNativeColor(bar.color) ?? getThemeColor(toolbar, 'colorOnSurface', android.graphics.Color.BLACK));
        if (translucent) {
            // the content scrolls under the bar, which stays slightly see through
            barColor = androidx.core.graphics.ColorUtils.setAlphaComponent(barColor, AlphaTranslucent);
        }
        // lifted (content scrolls under the bar): the color of the bar with a little of the content color, the M3 surface container idea
        const liftedColor = androidx.core.graphics.ColorUtils.blendARGB(barColor, onBarColor, 0.1);
        const MaterialShapeDrawable = com.google.android.material.shape.MaterialShapeDrawable;
        let background = appBarLayout.getBackground() as any;
        if (!(background instanceof MaterialShapeDrawable)) {
            // the lift animation of the AppBarLayout works on a MaterialShapeDrawable
            background = new MaterialShapeDrawable();
            appBarLayout.setBackground(background);
        }
        background.setFillColor(android.content.res.ColorStateList.valueOf(barColor));
        (appBarLayout as any).setLiftOnScrollColor(android.content.res.ColorStateList.valueOf(liftedColor));
        appBarLayout.setLiftOnScroll(behavior === 'lift');
        this.syncLiftTarget(appBar, behavior);
        this.setStatusScrimColor(appBarLayout.isLifted() && behavior === 'lift' ? liftedColor : barColor);
        if (!this._liftListener) {
            // the status bar area follows the color of the bar while it lifts
            this._liftListener = new com.google.android.material.appbar.AppBarLayout.LiftOnScrollListener({
                onUpdate: (elevation: number, color: number) => this.setStatusScrimColor(color)
            });
            appBarLayout.addLiftOnScrollListener(this._liftListener);
        }
        if (this._collapsing) {
            // the scrim drawn once the bar is collapsed
            this._collapsing.setContentScrimColor(behavior === 'lift' ? liftedColor : barColor);
            this._collapsing.setStatusBarScrimColor(behavior === 'lift' ? liftedColor : barColor);
        }
        toolbar.setTitleTextColor(onBarColor);
        toolbar.setSubtitleTextColor(onBarColor);
        if (this._collapsing) {
            this._collapsing.setCollapsedTitleTextColor(onBarColor);
            this._collapsing.setExpandedTitleColor(onBarColor);
            // the subtitle API of the CollapsingToolbarLayout (Material 1.13+)
            const c: any = this._collapsing;
            c.setCollapsedSubtitleTextColor?.(onBarColor);
            c.setExpandedSubtitleColor?.(onBarColor);
        }
        appBar?.applyTints();

        // 4. translucent: the content goes under the bar. The behavior of the content places it below the bar: without it the content fills the page
        // (also `hide` with a scroll target: the content fills the page, the bar moves over it)
        const overlayContent = translucent || customHide;
        const contentParams = this._nativeContent.getLayoutParams();
        const hasBehavior = !!contentParams.getBehavior();
        if (overlayContent === hasBehavior) {
            const AppBarLayout = com.google.android.material.appbar.AppBarLayout as any;
            contentParams.setBehavior(overlayContent ? null : new AppBarLayout.ScrollingViewBehavior());
            this._nativeContent.setLayoutParams(contentParams);
            if (overlayContent) {
                appBarLayout.bringToFront();
            }
        }
        this.syncTranslucentInset(appBar, overlayContent);
        this.syncHide(customHide ? scrollTargetView : null);
        this.syncBottomBar(appBar, behavior);
        this.syncSearchBar(appBar);
    }

    private _hideTarget: android.view.View;
    private _hideView: View;
    private _hideDetach: () => void;
    /**
     * `hide`: the bar leaves the screen while the list scrolls down and comes back while it scrolls up, both at the same time as the list scrolls
     * (the nested scrolling of the AppBarLayout would let the bar consume the scroll first). The bar follows the scroll deltas of the list and settles when the scroll stops.
     */
    private syncHide(targetView: View) {
        const target = targetView?.nativeViewProtected as android.view.View;
        const appBarLayout = this._appBarLayout as com.google.android.material.appbar.AppBarLayout;
        if (this._hideDetach && this._hideTarget !== target) {
            this._hideDetach();
            this._hideDetach = null;
            this._hideTarget = null;
            appBarLayout.animate().cancel();
            appBarLayout.setTranslationY(0);
        }
        if (!target || this._hideDetach) {
            return;
        }
        this._hideTarget = target;
        this._hideView = targetView;
        let offset = 0;
        // the status bar area stays
        const range = () => Math.max(0, appBarLayout.getHeight() - appBarLayout.getPaddingTop());
        const apply = (value: number) => {
            appBarLayout.animate().cancel();
            offset = Math.max(-range(), Math.min(0, value));
            appBarLayout.setTranslationY(offset);
        };
        const settle = () => {
            const end = offset < -range() / 2 ? -range() : 0;
            if (end !== offset) {
                offset = end;
                appBarLayout.animate().translationY(end).setDuration(160).start();
            }
        };
        let last: number;
        let timer: any;
        const view = this._hideView;
        const listener = (args: any) => {
            const current: number = args.scrollOffset ?? args.scrollY ?? args.object?.verticalOffset;
            if (typeof current !== 'number' || isNaN(current)) {
                return;
            }
            const dy = last === undefined ? 0 : current - last;
            last = current;
            if (current <= 0) {
                apply(0);
            } else if (dy) {
                apply(offset - dy);
            }
            clearTimeout(timer);
            timer = setTimeout(settle, 150);
        };
        view.on('scroll', listener);
        this._hideDetach = () => {
            clearTimeout(timer);
            view.off('scroll', listener);
        };
    }

    private _liftTarget: android.view.View;
    private _liftContentListener: any;
    /** the first vertically scrolling view under `view`: the lift state must follow one view, else several nested scroll events disagree and the bar blinks */
    private findScrollingView(view: android.view.View): android.view.View {
        if (view instanceof androidx.recyclerview.widget.RecyclerView || view instanceof androidx.core.widget.NestedScrollView || view instanceof android.widget.ScrollView) {
            return view;
        }
        if (view instanceof android.view.ViewGroup) {
            for (let index = 0; index < view.getChildCount(); index++) {
                const found = this.findScrollingView(view.getChildAt(index));
                if (found) {
                    return found;
                }
            }
        }
        return null;
    }

    /** `lift` follows `scrollTarget` / `scrollTargetId`, by default the first scrolling view of the content (searched again when the content is laid out) */
    private syncLiftTarget(appBar: AppBar, behavior: AppBarScrollBehavior) {
        const content = this._nativeContent as android.view.View;
        if (behavior !== 'lift') {
            return;
        }
        const explicit: android.view.View = appBar?.getScrollTarget()?.nativeViewProtected;
        const target = explicit ?? this.findScrollingView(content);
        if (target && target !== this._liftTarget) {
            this._liftTarget = target;
            (this._appBarLayout as any).setLiftOnScrollTargetView(target);
        }
        if (!explicit && !this._liftContentListener) {
            this._liftContentListener = new android.view.View.OnLayoutChangeListener({
                onLayoutChange: () => {
                    if (!this._liftTarget || !this._liftTarget.isAttachedToWindow()) {
                        this._liftTarget = null;
                        const bar = this.hasActionBar ? this.actionBar : null;
                        this.syncLiftTarget(bar instanceof AppBar ? bar : null, behavior);
                    }
                }
            });
            content.addOnLayoutChangeListener(this._liftContentListener);
        }
    }

    private _liftListener: any;
    private setStatusScrimColor(color: number) {
        this._statusScrim?.setBackgroundColor(color);
    }

    private _statusScrim: android.view.View;
    private _searchBarSetup = false;
    /** the SearchBar when it hosts the navigation icon and the actions of the bar (the toolbar is hidden) */
    get hostingSearchBar() {
        const toolbar = this.actionBar?.nativeViewProtected as android.view.View;
        return this._searchBar?.getVisibility() === android.view.View.VISIBLE && toolbar?.getVisibility() === android.view.View.GONE ? this._searchBar : null;
    }
    /** `searchMode="bar"`: a Material 3 SearchBar under the toolbar that opens the full screen SearchView */
    private syncSearchBar(appBar: AppBar) {
        const appBarLayout = this._appBarLayout as com.google.android.material.appbar.AppBarLayout;
        const wanted = !!appBar?.searchable && (appBar.searchMode === 'bar' || appBar.searchMode === 'inline');
        if (!wanted) {
            if (this._searchBar) {
                this._searchBar.setVisibility(android.view.View.GONE);
                // the toolbar was hidden while the SearchBar hosted its content
                (appBar?.nativeViewProtected as android.view.View)?.setVisibility(android.view.View.VISIBLE);
            }
            this._inlineOpen = false;
            this._inlineField?.setVisibility(android.view.View.GONE);
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
        this.syncSearchBarHost(appBar, searchBar);
        this.syncSearchBarColors(searchBar);
        if (appBar.searchMode === 'inline') {
            this.syncInlineSearch(appBar, searchBar);
            return;
        }
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

    // the native view of a hosted view of the bar is created after the bar is added to the page
    private _syncOnLoaded = (args: EventData) => {
        args.object.off('loaded', this._syncOnLoaded);
        this.syncAppBar();
    };

    private syncWhenLoaded(view: View) {
        view.off('loaded', this._syncOnLoaded);
        view.on('loaded', this._syncOnLoaded);
    }

    private _inlineField: android.widget.LinearLayout;
    private _inlineEdit: android.widget.EditText;
    private _inlineBack: android.widget.ImageView;
    private _inlineClear: android.widget.ImageView;
    private _inlineOwner: WeakRef<AppBar>;
    private _inlineOpen = false;
    private _inlineTextField: TextField;
    private _inlineTextFieldDetach: () => void;

    private getAppCompatDrawable(name: string) {
        const context = this._context;
        const id = context.getResources().getIdentifier(name, 'drawable', context.getPackageName());
        return id ? androidx.core.content.ContextCompat.getDrawable(context, id) : null;
    }

    private createInlineButton(drawableName: string, onClick: () => void) {
        const density = Utils.layout.getDisplayDensity();
        const button = new android.widget.ImageView(this._context);
        button.setImageDrawable(this.getAppCompatDrawable(drawableName));
        button.setScaleType(android.widget.ImageView.ScaleType.CENTER);
        button.setLayoutParams(new android.widget.LinearLayout.LayoutParams(Math.round(48 * density), Math.round(48 * density)));
        button.setOnClickListener(new android.view.View.OnClickListener({ onClick }));
        return button;
    }

    private notifySearchChange(text: string) {
        const bar = this._inlineOwner?.get();
        if (bar && this._inlineOpen && bar.searchText !== text) {
            bar.searchText = text;
            bar.notify({ eventName: AppBarBase.searchChangeEvent, object: bar, text });
        }
    }

    private notifySearchSubmit(text: string) {
        const bar = this._inlineOwner?.get();
        bar?.notify({ eventName: AppBarBase.searchSubmitEvent, object: bar, text });
    }

    private getInlineText() {
        return this._inlineTextField ? (this._inlineTextField.text ?? '') : this._inlineEdit.getText().toString();
    }

    private clearInlineText() {
        if (this._inlineTextField) {
            this._inlineTextField.text = '';
        } else {
            this._inlineEdit.setText('');
        }
    }

    private dismissInlineKeyboard() {
        if (this._inlineTextField) {
            this._inlineTextField.dismissSoftInput();
        } else {
            Utils.dismissSoftInput(this._inlineEdit);
        }
    }

    /** the field of the search: the `searchField` of the bar when it holds a TextField, else the built-in EditText */
    private bindInlineTextField(appBar: AppBar) {
        const host = appBar.searchField;
        if (host && !host.nativeViewProtected) {
            this.syncWhenLoaded(host);
            return;
        }
        const textField = host instanceof TextField ? host : host instanceof ContentView && host.content instanceof TextField ? host.content : null;
        if (textField === this._inlineTextField) {
            return;
        }
        this._inlineTextFieldDetach?.();
        this._inlineTextFieldDetach = null;
        this._inlineTextField = textField;
        const field = this._inlineField;
        const input = textField ? host.nativeViewProtected : this._inlineEdit;
        (input.getParent() as android.view.ViewGroup)?.removeView(input);
        field.removeViewAt(1);
        field.addView(input, 1, new android.widget.LinearLayout.LayoutParams(0, WRAP_CONTENT, 1));
        if (textField) {
            const onTextChange = () => this.notifySearchChange(this.getInlineText());
            const onReturnPress = () => {
                this.notifySearchSubmit(this.getInlineText());
                textField.dismissSoftInput();
            };
            textField.on('textChange', onTextChange);
            textField.on('returnPress', onReturnPress);
            this._inlineTextFieldDetach = () => {
                textField.off('textChange', onTextChange);
                textField.off('returnPress', onReturnPress);
            };
        }
    }

    /** `searchMode="inline"`: the SearchBar turns into an editable field in place, the app filters its own content from `searchChange` */
    private syncInlineSearch(appBar: AppBar, searchBar: com.google.android.material.search.SearchBar) {
        this._inlineOwner = new WeakRef(appBar);
        searchBar.setOnClickListener(new android.view.View.OnClickListener({ onClick: () => this.openInlineSearch() }));
        if (!this._inlineField) {
            const context = this._context;
            const field = new android.widget.LinearLayout(context);
            field.setOrientation(android.widget.LinearLayout.HORIZONTAL);
            field.setGravity(android.view.Gravity.CENTER_VERTICAL);
            field.setBackground(searchBar.getBackground()?.getConstantState()?.newDrawable()?.mutate() ?? null);
            const edit = new android.widget.EditText(context);
            edit.setBackground(null);
            edit.setSingleLine(true);
            edit.setTextSize(16);
            edit.setPadding(0, 0, 0, 0);
            edit.setImeOptions(android.view.inputmethod.EditorInfo.IME_ACTION_SEARCH);
            edit.addTextChangedListener(
                new android.text.TextWatcher({
                    beforeTextChanged: () => null,
                    onTextChanged: () => null,
                    afterTextChanged: (editable: android.text.Editable) => this.notifySearchChange(editable.toString())
                })
            );
            edit.setOnEditorActionListener(
                new android.widget.TextView.OnEditorActionListener({
                    onEditorAction: () => {
                        this.notifySearchSubmit(edit.getText().toString());
                        Utils.dismissSoftInput(edit);
                        return true;
                    }
                })
            );
            this._inlineBack = this.createInlineButton('abc_ic_ab_back_material', () => this.closeInlineSearch());
            this._inlineClear = this.createInlineButton('abc_ic_clear_material', () => (this.getInlineText().length ? this.clearInlineText() : this.closeInlineSearch()));
            field.addView(this._inlineBack);
            field.addView(edit, new android.widget.LinearLayout.LayoutParams(0, WRAP_CONTENT, 1));
            field.addView(this._inlineClear);
            const appBarLayout = this._appBarLayout as com.google.android.material.appbar.AppBarLayout;
            field.setVisibility(android.view.View.GONE);
            appBarLayout.addView(field, searchBar.getLayoutParams());
            this._inlineField = field;
            this._inlineEdit = edit;
        }
        this.bindInlineTextField(appBar);
        this.syncInlineColors(appBar);
        this._inlineEdit.setHint(appBar.searchHint ?? null);
        searchBar.setVisibility(this._inlineOpen ? android.view.View.GONE : android.view.View.VISIBLE);
        this._inlineField.setVisibility(this._inlineOpen ? android.view.View.VISIBLE : android.view.View.GONE);
    }

    /** the colors of the theme are read again at each sync (dark / light switch): the field follows the bar */
    private syncInlineColors(appBar: AppBar) {
        const onBar = appBar.getOnBarColor();
        findShapeDrawable(this._inlineField.getBackground())?.setFillColor(android.content.res.ColorStateList.valueOf(this.getSearchBarColor()));
        this._inlineEdit.setTextColor(onBar);
        this._inlineEdit.setHintTextColor(androidx.core.graphics.ColorUtils.setAlphaComponent(onBar, 153));
        this._inlineBack.setColorFilter(onBar);
        this._inlineClear.setColorFilter(onBar);
    }

    private getSearchBarColor() {
        return getThemeColor(this._searchBar, 'colorSurfaceContainerHigh', getThemeColor(this._searchBar, 'colorSurface', android.graphics.Color.WHITE));
    }

    /** cross fades the search bar and the editable field (same size and position) */
    private morphSearch(from: android.view.View, to: android.view.View) {
        const fade = new android.transition.Fade();
        fade.setDuration(250);
        fade.setInterpolator(new android.view.animation.PathInterpolator(0.4, 0, 0.2, 1));
        android.transition.TransitionManager.beginDelayedTransition(this._appBarLayout as android.view.ViewGroup, fade);
        from.setVisibility(android.view.View.GONE);
        to.setVisibility(android.view.View.VISIBLE);
    }

    openInlineSearch() {
        if (this._inlineOpen || !this._inlineField) {
            return !!this._inlineOpen;
        }
        this._inlineOpen = true;
        const height = this._searchBar.getHeight();
        if (height > 0) {
            this._inlineField.setMinimumHeight(height);
        }
        this.morphSearch(this._searchBar, this._inlineField);
        if (this._inlineTextField) {
            this._inlineTextField.focus();
            Utils.android.showSoftInput(this._inlineTextField.nativeViewProtected);
        } else {
            this._inlineEdit.requestFocus();
            Utils.android.showSoftInput(this._inlineEdit);
        }
        return true;
    }

    /** returns true when an inline search was open */
    closeInlineSearch() {
        if (!this._inlineOpen) {
            return false;
        }
        this._inlineOpen = false;
        this.dismissInlineKeyboard();
        this.clearInlineText();
        this.morphSearch(this._inlineField, this._searchBar);
        const bar = this._inlineOwner?.get();
        if (bar) {
            bar.searchText = '';
            bar.notify({ eventName: AppBarBase.searchCancelEvent, object: bar, text: '' });
        }
        return true;
    }

    /** the SearchBar reads the colors of the theme when it is created: they are applied again at each sync */
    private syncSearchBarColors(searchBar: com.google.android.material.search.SearchBar) {
        findShapeDrawable(searchBar.getBackground())?.setFillColor(android.content.res.ColorStateList.valueOf(this.getSearchBarColor()));
        const onVariant = getThemeColor(searchBar, 'colorOnSurfaceVariant', android.graphics.Color.BLACK);
        searchBar.getTextView().setTextColor(onVariant);
        searchBar.getTextView().setHintTextColor(onVariant);
        searchBar.getNavigationIcon()?.mutate().setTint(onVariant);
    }

    private _defaultSearchBarIcon: android.graphics.drawable.Drawable;
    /** without a title the SearchBar is the whole bar (M3 "search app bar"): it takes the navigation icon and the actions of the toolbar */
    private syncSearchBarHost(appBar: AppBar, searchBar: com.google.android.material.search.SearchBar) {
        const toolbar = appBar.nativeViewProtected as com.google.android.material.appbar.MaterialToolbar;
        if (this._defaultSearchBarIcon === undefined) {
            this._defaultSearchBarIcon = searchBar.getNavigationIcon();
        }
        const hosted = !appBar.title && !appBar.subtitle && appBar.size === 'small';
        const menu = searchBar.getMenu();
        menu.clear();
        toolbar.setVisibility(hosted ? android.view.View.GONE : android.view.View.VISIBLE);
        if (!hosted) {
            searchBar.setNavigationIcon(this._defaultSearchBarIcon);
            return;
        }
        const owner = new WeakRef(appBar);
        searchBar.setNavigationIcon(toolbar.getNavigationIcon() ?? this._defaultSearchBarIcon);
        searchBar.setNavigationOnClickListener(
            new android.view.View.OnClickListener({
                onClick: () => owner.get()?.navigationButton?._raiseTap()
            })
        );
        const tint = android.content.res.ColorStateList.valueOf(appBar.getOnBarColor());
        const source = toolbar.getMenu();
        for (let index = 0; index < source.size(); index++) {
            const item = source.getItem(index);
            const copy = menu.add(item.getGroupId(), item.getItemId(), item.getOrder(), item.getTitle());
            copy.setIcon(item.getIcon());
            copy.setShowAsAction(android.view.MenuItem.SHOW_AS_ACTION_ALWAYS);
            androidx.core.view.MenuItemCompat.setIconTintList(copy, tint);
        }
        searchBar.setOnMenuItemClickListener(
            new androidx.appcompat.widget.Toolbar.OnMenuItemClickListener({
                onMenuItemClick: (menuItem) => {
                    const items = ((owner.get()?.actionItems as any)?.getVisibleItems() ?? []) as AppBarItem[];
                    (items.find((item) => (item as any)._getItemId() === menuItem.getItemId()) as any)?._raiseTap();
                    return true;
                }
            })
        );
    }

    private _bottomBadges: com.google.android.material.badge.BadgeDrawable[] = [];
    private _bottomBar: com.google.android.material.bottomappbar.BottomAppBar;
    private _bottomInsetListener: any;
    private _bottomInsetView: android.view.View;
    /** `bottomItems`: a Material BottomAppBar, over the content, below the overlay */
    private syncBottomBar(appBar: AppBar, behavior: AppBarScrollBehavior) {
        const items = (appBar?.bottomItems || []).filter((item) => !item.spacer && !item.search);
        const coordinator = this._coordinator as androidx.coordinatorlayout.widget.CoordinatorLayout;
        const floating = appBar?.bottomBarStyle !== 'bottomAppBar';
        // a bottomView only fits the floating toolbar: the BottomAppBar is a Toolbar with a menu
        if (floating && appBar?.bottomView && !appBar.bottomView.nativeViewProtected) {
            this.syncWhenLoaded(appBar.bottomView);
        }
        const hasContent = items.length > 0 || (floating && !!appBar?.bottomView?.nativeViewProtected);
        if (!hasContent || floating) {
            if (this._bottomBar) {
                this._bottomBar.setVisibility(android.view.View.GONE);
                if (!floating) {
                    this.syncBottomInset(appBar, false, this._bottomBar);
                }
            }
        }
        if (!hasContent || !floating) {
            if (this._floatingBar) {
                this._floatingBar.setVisibility(android.view.View.GONE);
                this.syncBottomInset(appBar, false, this._floatingBar);
            }
        }
        if (!hasContent) {
            return;
        }
        if (floating) {
            this.syncFloatingBar(appBar, items, behavior);
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
        const onBarList = android.content.res.ColorStateList.valueOf(appBar.getOnBarColor());
        items.forEach((item, index) => {
            const menuItem = menu.add(0, index, index, item.text || '');
            const icon = item.icon ? getNativeIcon(item.icon) : null;
            if (icon) {
                menuItem.setIcon(icon);
            }
            androidx.core.view.MenuItemCompat.setIconTintList(menuItem, onBarList);
            menuItem.setShowAsAction(android.view.MenuItem.SHOW_AS_ACTION_ALWAYS);
        });
        attachBadges(
            bar,
            this._bottomBadges,
            items
                .map((item, index) => ({ id: index, badge: item.badge }))
                .filter((entry) => entry.badge !== undefined && entry.badge !== null && (entry.badge as any) !== false && (entry.badge as any) !== '')
        );
        bar.setOnMenuItemClickListener(
            new androidx.appcompat.widget.Toolbar.OnMenuItemClickListener({
                onMenuItemClick: (menuItem: android.view.MenuItem) => {
                    const target = owner.get();
                    const item = items[menuItem.getItemId()];
                    if (target && item?.menu?.length) {
                        showMenu({ anchor: { nativeViewProtected: bar } as any, items: item.menu, placement: { horizontal: 'end', vertical: 'above' } });
                    } else if (target) {
                        notifyBottomItemTap(target, item);
                    }
                    return true;
                }
            })
        );
        this.syncBottomInset(appBar, true, bar);
    }

    private _floatingBar: android.widget.FrameLayout;
    private _floatingHolder: android.widget.LinearLayout;
    /** `bottomBarStyle="floating"`: a Material 3 Expressive FloatingToolbarLayout (a pill over the content, centered above the gesture bar) holding icon buttons, or the `bottomView` of the bar */
    private syncFloatingBar(appBar: AppBar, items: AppBarBottomItem[], behavior: AppBarScrollBehavior) {
        const coordinator = this._coordinator as androidx.coordinatorlayout.widget.CoordinatorLayout;
        const context = this._context;
        const density = Utils.layout.getDisplayDensity();
        const CoordinatorLayout = androidx.coordinatorlayout.widget.CoordinatorLayout as any;
        if (!this._floatingBar) {
            // the typings of the Material version of the plugin do not have the floating toolbar yet
            const FloatingToolbarLayout = (com.google.android.material as any).floatingtoolbar.FloatingToolbarLayout;
            const bar = new FloatingToolbarLayout(context) as android.widget.FrameLayout;
            const params = new CoordinatorLayout.LayoutParams(WRAP_CONTENT, WRAP_CONTENT);
            params.gravity = android.view.Gravity.BOTTOM | android.view.Gravity.CENTER_HORIZONTAL;
            const margin = Math.round(16 * density);
            params.setMargins(margin, margin, margin, margin);
            // below the overlay (a FAB, a panel)
            coordinator.addView(bar, coordinator.indexOfChild(this._nativeOverlay), params);
            const holder = new android.widget.LinearLayout(context);
            holder.setOrientation(android.widget.LinearLayout.HORIZONTAL);
            holder.setGravity(android.view.Gravity.CENTER_VERTICAL);
            bar.addView(holder, new android.widget.FrameLayout.LayoutParams(WRAP_CONTENT, WRAP_CONTENT));
            this._floatingBar = bar;
            this._floatingHolder = holder;
        }
        const bar = this._floatingBar;
        const holder = this._floatingHolder;
        const params = bar.getLayoutParams() as any;
        params.setBehavior(behavior === 'hide' ? new com.google.android.material.behavior.HideBottomViewOnScrollBehavior() : null);
        bar.setVisibility(android.view.View.VISIBLE);
        const background = bar.getBackground();
        if (background instanceof com.google.android.material.shape.MaterialShapeDrawable) {
            background.setFillColor(android.content.res.ColorStateList.valueOf(getThemeColor(bar, 'colorSurfaceContainer', getThemeColor(bar, 'colorSurface', android.graphics.Color.WHITE))));
        }
        holder.removeAllViews();
        const customView = appBar.bottomView?.nativeViewProtected as android.view.View;
        if (customView) {
            (customView.getParent() as android.view.ViewGroup)?.removeView(customView);
            holder.addView(customView, new android.widget.LinearLayout.LayoutParams(WRAP_CONTENT, WRAP_CONTENT));
            this.syncBottomInset(appBar, true, bar);
            return;
        }
        const owner = new WeakRef(appBar);
        const ripple = new android.util.TypedValue();
        context.getTheme().resolveAttribute(16843868 /* android.R.attr.selectableItemBackgroundBorderless */, ripple, true);
        const size = Math.round(48 * density);
        const onBarList = android.content.res.ColorStateList.valueOf(appBar.getOnBarColor());
        items.forEach((item) => {
            const button = new android.widget.ImageButton(context);
            const icon = item.icon ? getNativeIcon(item.icon) : null;
            if (icon) {
                button.setImageDrawable(icon);
            }
            button.setImageTintList(onBarList);
            button.setContentDescription(item.text || '');
            button.setBackground(androidx.core.content.ContextCompat.getDrawable(context, ripple.resourceId));
            button.setOnClickListener(
                new android.view.View.OnClickListener({
                    onClick: () => {
                        const target = owner.get();
                        if (target && item.menu?.length) {
                            showMenu({ anchor: { nativeViewProtected: button } as any, items: item.menu, placement: { horizontal: 'end', vertical: 'above' } });
                        } else if (target) {
                            notifyBottomItemTap(target, item);
                        }
                    }
                })
            );
            holder.addView(button, new android.widget.LinearLayout.LayoutParams(size, size));
        });
        this.syncBottomInset(appBar, true, bar);
    }

    /** the last items of the scrolling view must not stay under the bottom bar */
    private syncBottomInset(appBar: AppBar, visible: boolean, bar: android.view.View) {
        const target = (appBar?.getScrollTarget()?.nativeViewProtected as android.view.View) ?? this._liftTarget;
        if (this._bottomInsetListener) {
            this._bottomInsetView?.removeOnLayoutChangeListener(this._bottomInsetListener);
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
        // a floating bar also has margins around it
        const occupied = () => bar.getHeight() + ((bar.getLayoutParams() as android.view.ViewGroup.MarginLayoutParams)?.bottomMargin ?? 0);
        const apply = () => {
            if (target['__appBarBottomPadding'] === undefined) {
                target['__appBarBottomPadding'] = target.getPaddingBottom();
            }
            if (target instanceof android.view.ViewGroup) {
                target.setClipToPadding(false);
            }
            target.setPadding(target.getPaddingLeft(), target.getPaddingTop(), target.getPaddingRight(), occupied());
        };
        this._bottomInsetListener = new android.view.View.OnLayoutChangeListener({
            onLayoutChange: () => {
                if (target.getPaddingBottom() !== occupied() && this._bottomInsetListener) {
                    apply();
                }
            }
        });
        this._bottomInsetView = bar;
        bar.addOnLayoutChangeListener(this._bottomInsetListener);
        apply();
    }

    private _insetListener: any;
    /** translucent: the first items of the scrolling view must start below the bar: its top padding follows the height of the bar */
    private syncTranslucentInset(appBar: AppBar, translucent: boolean) {
        const appBarLayout = this._appBarLayout as com.google.android.material.appbar.AppBarLayout;
        const target = appBar?.getScrollTarget()?.nativeViewProtected as android.view.View;
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
