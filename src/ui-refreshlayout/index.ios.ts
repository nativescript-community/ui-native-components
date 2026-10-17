import { Trace, Utils } from '@nativescript/core';
import { RefreshLayoutBase, bottomEnabledProperty, bottomRefreshingProperty, indicatorColorProperty, indicatorFillColorProperty, refreshingProperty, topEnabledProperty } from './index-common';

export * from './index-common';

const TRIGGER = 70;
const FOOTER_HEIGHT = 56;

@NativeClass
class RefreshHandler extends NSObject {
    _owner: WeakRef<RefreshLayout>;
    static initWithOwner(owner: RefreshLayout) {
        const handler = RefreshHandler.new() as RefreshHandler;
        handler._owner = new WeakRef(owner);
        return handler;
    }
    handleRefresh() {
        this._owner.get()?._onStartEdgeRefresh();
    }
    static ObjCExposedMethods = {
        handleRefresh: { returns: interop.types.void, params: [] }
    };
}

/**
 * Follows the drag of the user: a target of the pan gesture recognizer of the scroll view (the pull at the end of the content has no UIKit control)
 */
@NativeClass
class PanHandler extends NSObject {
    _owner: WeakRef<RefreshLayout>;
    static initWithOwner(owner: RefreshLayout) {
        const handler = PanHandler.new() as PanHandler;
        handler._owner = new WeakRef(owner);
        return handler;
    }
    handlePan(recognizer: UIPanGestureRecognizer) {
        this._owner?.get()?._onPan(recognizer.state);
    }
    static ObjCExposedMethods = {
        handlePan: { returns: interop.types.void, params: [UIPanGestureRecognizer] }
    };
}

const edgeInsets = (top: number, left: number, bottom: number, right: number) => ({ top, left, bottom, right }) as UIEdgeInsets;

function findScrollView(view: UIView): UIScrollView {
    if (view instanceof UIScrollView) {
        return view;
    }
    // WKWebView
    const webScrollView = (view as any).scrollView;
    if (webScrollView instanceof UIScrollView) {
        return webScrollView;
    }
    for (let i = 0; i < view.subviews.count; i++) {
        const found = findScrollView(view.subviews.objectAtIndex(i));
        if (found) {
            return found;
        }
    }
    return null;
}

/**
 * iOS: the scroll view has two edges: the start of its content (UIRefreshControl) and the end (a spinner under the last item, pulled by the user).
 * The visual top/bottom are mapped to them: with a reversed content (CollectionView `reverseLayout` rotates the scroll view) the top is the end.
 */
export class RefreshLayout extends RefreshLayoutBase {
    private mRefreshControl: UIRefreshControl;
    private mHandler: RefreshHandler;
    private mPanHandler: PanHandler;
    private mScrollView: UIScrollView;
    private mFooter: UIActivityIndicatorView;
    private mObserving = false;
    private mEndRefreshing = false;
    private mEndInset = 0;
    private mReversed = false;

    constructor() {
        super();
        this.mRefreshControl = UIRefreshControl.new();
        this.mHandler = RefreshHandler.initWithOwner(this);
        this.mRefreshControl.addTargetActionForControlEvents(this.mHandler, 'handleRefresh', UIControlEvents.ValueChanged);
        this.mPanHandler = PanHandler.initWithOwner(this);
    }

    get refreshControl() {
        return this.mRefreshControl;
    }

    onLoaded() {
        super.onLoaded();
        try {
            this.setup();
        } catch (error) {
            Trace.write(`RefreshLayout error: ${(error as any)?.stack || error}`, Trace.categories.Error, Trace.messageType.error);
            console.log('RefreshLayout error ' + ((error as any)?.stack || error));
        }
    }

    onUnloaded() {
        this.teardown();
        super.onUnloaded();
    }

    _onContentChanged(oldView: any, newView: any) {
        super['_onContentChanged']?.(oldView, newView);
        if (this.isLoaded) {
            this.teardown();
            this.setup();
        }
    }

    // ---- visual edges <-> scroll edges

    /** the visual edge at the start of the scrolling */
    private get startIsTop() {
        return !this.mReversed;
    }
    private get startEnabled() {
        return this.startIsTop ? this.topEnabled !== false : this.bottomEnabled === true;
    }
    private get endEnabled() {
        return this.startIsTop ? this.bottomEnabled === true : this.topEnabled !== false;
    }
    /** the pull at the start is the top refresh, else the bottom one */
    _onStartEdgeRefresh() {
        const bottom = !this.startIsTop;
        if (bottom) {
            this.bottomRefreshing = true;
        } else {
            this.refreshing = true;
        }
        this.notifyRefresh(bottom);
    }

    private setup() {
        const native = this.content?.nativeViewProtected as UIView;
        const scrollView = native ? findScrollView(native) : null;
        if (!scrollView) {
            return;
        }
        this.mScrollView = scrollView;
        this.mReversed = this.contentReversed;
        this.applyStartEdge();
        // the end edge
        this.mFooter = UIActivityIndicatorView.alloc().initWithActivityIndicatorStyle(UIActivityIndicatorViewStyle.Medium);
        this.mFooter.hidesWhenStopped = false;
        this.mFooter.alpha = 0;
        const color = (this.style as any).indicatorColor;
        if (color) {
            this.mFooter.color = color.ios;
        }
        // behind the scroll view, at the visual edge: revealed when the content is pulled away
        (this.nativeViewProtected as UIView).insertSubviewAtIndex(this.mFooter, 0);
        scrollView.panGestureRecognizer.addTargetAction(this.mPanHandler, 'handlePan');
        this.mObserving = true;
        this.layoutFooter();
        if (this.refreshing || this.bottomRefreshing) {
            this.syncRefreshingState();
        }
    }

    private teardown() {
        const scrollView = this.mScrollView;
        if (scrollView) {
            if (this.mObserving) {
                scrollView.panGestureRecognizer.removeTargetAction(this.mPanHandler, 'handlePan');
                        this.mObserving = false;
            }
            if (scrollView.refreshControl === this.mRefreshControl) {
                scrollView.refreshControl = null;
            }
            this.mFooter?.removeFromSuperview();
        }
        this.mFooter = null;
        this.mScrollView = null;
        this.mEndRefreshing = false;
        this.mEndInset = 0;
    }

    private applyStartEdge() {
        const scrollView = this.mScrollView;
        if (!scrollView) {
            return;
        }
        if (this.startEnabled) {
            if (scrollView.refreshControl !== this.mRefreshControl) {
                scrollView.refreshControl = this.mRefreshControl;
            }
        } else if (scrollView.refreshControl === this.mRefreshControl) {
            scrollView.refreshControl = null;
        }
    }

    private syncRefreshingState() {
        const startRefreshing = this.startIsTop ? this.refreshing : this.bottomRefreshing;
        const endRefreshing = this.startIsTop ? this.bottomRefreshing : this.refreshing;
        if (this.startEnabled) {
            this.setStartRefreshing(startRefreshing);
        }
        this.setEndRefreshing(endRefreshing && this.endEnabled);
    }

    private setStartRefreshing(value: boolean) {
        if (value) {
            if (!this.mRefreshControl.refreshing) {
                this.mRefreshControl.beginRefreshing();
                const scrollView = this.mScrollView;
                if (scrollView) {
                    scrollView.setContentOffsetAnimated(CGPointMake(0, -(scrollView.adjustedContentInset.top + this.mRefreshControl.frame.size.height)), true);
                }
            }
        } else if (this.mRefreshControl.refreshing) {
            this.mRefreshControl.endRefreshing();
        }
    }

    // ---- end of the content

    /** distance the user pulled beyond the end of the content */
    private get endOverscroll() {
        const scrollView = this.mScrollView;
        const inset = scrollView.adjustedContentInset;
        const endOffset = Math.max(scrollView.contentSize.height + inset.bottom - this.mEndInset - scrollView.bounds.size.height, -inset.top);
        return scrollView.contentOffset.y - endOffset;
    }

    /** the end of the scrolling is at the visual bottom, or at the visual top when the content is reversed */
    private layoutFooter() {
        const container = this.nativeViewProtected as UIView;
        if (!container || !this.mFooter) {
            return;
        }
        const { width, height } = container.bounds.size;
        this.mFooter.frame = CGRectMake(0, this.startIsTop ? height - FOOTER_HEIGHT : 0, width, FOOTER_HEIGHT);
    }

    onLayout(left: number, top: number, right: number, bottom: number) {
        super.onLayout(left, top, right, bottom);
        // after the frame of the container is set
        setTimeout(() => this.layoutFooter(), 0);
    }

    _onPan(state: UIGestureRecognizerState) {
        try {
            this.onPan(state);
        } catch (error) {
            console.log('RefreshLayout error ' + ((error as any)?.stack || error));
        }
    }

    private onPan(state: UIGestureRecognizerState) {
        const scrollView = this.mScrollView;
        if (!scrollView || !this.endEnabled || this.mEndRefreshing) {
            return;
        }
        const overscroll = this.endOverscroll;
        if (state === UIGestureRecognizerState.Began || state === UIGestureRecognizerState.Changed) {
            const progress = Math.max(0, Math.min(1, overscroll / TRIGGER));
            this.mFooter.alpha = progress;
            if (progress > 0 && !this.mFooter.animating) {
                this.mFooter.startAnimating();
            } else if (progress === 0 && this.mFooter.animating) {
                this.mFooter.stopAnimating();
            }
        } else if (state === UIGestureRecognizerState.Ended || state === UIGestureRecognizerState.Cancelled || state === UIGestureRecognizerState.Failed) {
            if (overscroll >= TRIGGER) {
                this.setEndRefreshing(true);
                const bottom = this.startIsTop;
                if (bottom) {
                    this.bottomRefreshing = true;
                } else {
                    this.refreshing = true;
                }
                this.notifyRefresh(bottom);
            } else {
                this.mFooter.alpha = 0;
                this.mFooter.stopAnimating();
            }
        }
    }

    private setEndRefreshing(value: boolean) {
        const scrollView = this.mScrollView;
        if (!scrollView || !this.mFooter || value === this.mEndRefreshing) {
            return;
        }
        this.mEndRefreshing = value;
        if (value) {
            this.mFooter.alpha = 1;
            this.mFooter.startAnimating();
            this.mEndInset = FOOTER_HEIGHT;
            const inset = scrollView.contentInset;
            UIView.animateWithDurationAnimations(0.25, () => {
                scrollView.contentInset = edgeInsets(inset.top, inset.left, inset.bottom + FOOTER_HEIGHT, inset.right);
            });
        } else {
            const inset = scrollView.contentInset;
            const extra = this.mEndInset;
            this.mEndInset = 0;
            UIView.animateWithDurationAnimationsCompletion(
                0.25,
                () => {
                    scrollView.contentInset = edgeInsets(inset.top, inset.left, Math.max(0, inset.bottom - extra), inset.right);
                    this.mFooter.alpha = 0;
                },
                () => this.mFooter?.stopAnimating()
            );
        }
        this.layoutFooter();
    }

    // ---- properties

    [refreshingProperty.setNative](value: boolean) {
        if (!this.mScrollView) {
            return;
        }
        if (this.startIsTop) {
            this.startEnabled && this.setStartRefreshing(!!value);
        } else {
            this.setEndRefreshing(!!value && this.endEnabled);
        }
    }
    [bottomRefreshingProperty.setNative](value: boolean) {
        if (!this.mScrollView) {
            return;
        }
        if (this.startIsTop) {
            this.setEndRefreshing(!!value && this.endEnabled);
        } else {
            this.startEnabled && this.setStartRefreshing(!!value);
        }
    }
    [topEnabledProperty.setNative](value: boolean) {
        this.applyStartEdge();
    }
    [bottomEnabledProperty.setNative](value: boolean) {
        this.applyStartEdge();
    }
    [indicatorColorProperty.getDefault](): UIColor {
        return this.mRefreshControl.tintColor;
    }
    [indicatorColorProperty.setNative](value: any) {
        const color = value ? value.ios : null;
        this.mRefreshControl.tintColor = color;
        if (this.mFooter) {
            this.mFooter.color = color;
        }
    }
    [indicatorFillColorProperty.getDefault](): UIColor {
        return this.mRefreshControl.backgroundColor;
    }
    [indicatorFillColorProperty.setNative](value: any) {
        this.mRefreshControl.backgroundColor = value ? value.ios : null;
    }
}
