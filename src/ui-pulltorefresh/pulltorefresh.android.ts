import { PullToRefreshBase, bottomEnabledProperty, bottomRefreshingProperty, indicatorColorProperty, indicatorFillColorProperty, refreshingProperty, topEnabledProperty } from './pulltorefresh-common';

export * from './pulltorefresh-common';

type NativeLayout = com.nativescript.material.pulltorefresh.PullToRefreshLayout & { refreshListener?: any; bottomListener?: any };

export class PullToRefresh extends PullToRefreshBase {
    nativeViewProtected: NativeLayout;

    public createNativeView() {
        return new com.nativescript.material.pulltorefresh.PullToRefreshLayout(this._context);
    }

    public initNativeView() {
        super.initNativeView();
        const owner = new WeakRef(this);
        const listener = new androidx.swiperefreshlayout.widget.SwipeRefreshLayout.OnRefreshListener({
            onRefresh: () => {
                const view = owner.get();
                if (view) {
                    view.refreshing = true;
                    view.notifyRefresh(false);
                }
            }
        });
        this.nativeViewProtected.setOnRefreshListener(listener);
        this.nativeViewProtected.refreshListener = listener;
        const bottomListener = new java.lang.Runnable({
            run: () => {
                const view = owner.get();
                if (view) {
                    view.bottomRefreshing = true;
                    view.notifyRefresh(true);
                }
            }
        });
        this.nativeViewProtected.setBottomRefreshListener(bottomListener);
        this.nativeViewProtected.bottomListener = bottomListener;
    }

    public disposeNativeView() {
        this.nativeViewProtected.refreshListener = null;
        this.nativeViewProtected.bottomListener = null;
        this.nativeViewProtected.setBottomRefreshListener(null);
        super.disposeNativeView();
    }

    [refreshingProperty.setNative](value: boolean) {
        this.nativeViewProtected.setRefreshing(!!value);
    }
    [bottomRefreshingProperty.setNative](value: boolean) {
        this.nativeViewProtected.setBottomRefreshing(!!value);
    }
    [topEnabledProperty.setNative](value: boolean) {
        this.nativeViewProtected.setTopEnabled(value !== false);
    }
    [bottomEnabledProperty.setNative](value: boolean) {
        this.nativeViewProtected.setBottomEnabled(!!value);
    }
    [indicatorColorProperty.setNative](value: any) {
        if (value) {
            this.nativeViewProtected.setIndicatorColor(value.android);
        }
    }
    [indicatorFillColorProperty.setNative](value: any) {
        if (value) {
            this.nativeViewProtected.setIndicatorBackgroundColor(value.android);
        }
    }
}
