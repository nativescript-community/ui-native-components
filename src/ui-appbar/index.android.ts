import { ActionBar, Page, View } from '@nativescript/core';
import { AppBarScrollBehavior } from './index-common';
export { AppBarScrollBehavior };

const MATCH_PARENT = -1;
const WRAP_CONTENT = -2;

/**
 * Android: a Page whose content scrolls with a Material `AppBarLayout` (lift, hide, collapse...).
 *
 * The native tree is built INSIDE the root of the regular Page, so any library that replaces the Page root
 * (like gesturehandler `PageLayout`) keeps working:
 *
 *  root = super.createNativeView()          (GridLayout, or the gesturehandler PageLayout)
 *   `- CoordinatorLayout                    (row 1)
 *       |- AppBarLayout  <- the ActionBar Toolbar
 *       `- ContentLayout (ScrollingViewBehavior) <- the page content
 */
export class AppPage extends Page {
    private _coordinator: any;
    private _appBarLayout: any;
    private _nativeContent: any;
    private _scrollBehavior: AppBarScrollBehavior = 'none';

    get scrollBehavior() {
        return this._scrollBehavior;
    }
    set scrollBehavior(value: AppBarScrollBehavior) {
        this._scrollBehavior = value;
        this.updateScrollFlags();
    }

    createNativeView() {
        // the root can be replaced by another library (gesturehandler): never create it ourselves
        const root = super.createNativeView() as org.nativescript.widgets.GridLayout;
        const context = this._context;
        const CoordinatorLayout = androidx.coordinatorlayout.widget.CoordinatorLayout as any;
        const AppBarLayout = com.google.android.material.appbar.AppBarLayout as any;
        const coordinator = new CoordinatorLayout(context);
        const appBarLayout = new AppBarLayout(context);
        // a transparent background: the Toolbar draws its own
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

    disposeNativeView() {
        this._coordinator = null;
        this._appBarLayout = null;
        this._nativeContent = null;
        super.disposeNativeView();
    }

    private getScrollFlags() {
        const LayoutParams = com.google.android.material.appbar.AppBarLayout.LayoutParams as any;
        switch (this._scrollBehavior) {
            case 'hide':
                return LayoutParams.SCROLL_FLAG_SCROLL | LayoutParams.SCROLL_FLAG_ENTER_ALWAYS | LayoutParams.SCROLL_FLAG_SNAP;
            case 'collapse':
                return LayoutParams.SCROLL_FLAG_SCROLL | LayoutParams.SCROLL_FLAG_EXIT_UNTIL_COLLAPSED;
            default:
                return 0;
        }
    }

    private updateScrollFlags() {
        const appBarLayout = this._appBarLayout;
        if (!appBarLayout) {
            return;
        }
        appBarLayout.setLiftOnScroll(this._scrollBehavior === 'lift');
        const flags = this.getScrollFlags();
        for (let i = 0; i < appBarLayout.getChildCount(); i++) {
            const child = appBarLayout.getChildAt(i);
            const params = child.getLayoutParams();
            params.setScrollFlags(flags);
            child.setLayoutParams(params);
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
            this.updateScrollFlags();
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
