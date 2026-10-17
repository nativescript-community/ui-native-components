import { Builder, CSSUtils, EventData, View, ViewBase } from '@nativescript/core';

export interface ShownBottomSheetData extends EventData {
    /**
     * The context (optional, may be undefined) passed to the view when shown modally.
     */
    context?: any;

    /**
     * A callback to call when you want to close the modally shown view.
     * Pass in any kind of arguments and you will receive when the callback parameter
     * of View.showModal is executed.
     */
    closeCallback?: Function;
}

export enum StateBottomSheet {
    CLOSED = -1,
    COLLAPSED = 0,
    EXPANDED = 1,
    DRAGGING = 2
}

export type onChangeStateBottomSheet = (stateBottomSheet: StateBottomSheet, slideOffset?: number) => void;

export const shownInBottomSheetEvent = 'shownInBottomSheet';
export const showingInBottomSheetEvent = 'showingInBottomSheet';
export const closedSheetEvent = 'closedBottomSheet';

/**
 * A height the sheet can rest at:
 * - `'content'`: the height of the content
 * - `'medium'`: half of the available height
 * - `'large'`: the full available height
 * - a number: a height in dip
 * - `{ fraction }`: a fraction of the available height (0-1)
 * The detents are given from the smallest to the largest, the indexes follow this order.
 * iOS supports any number of detents (UISheetPresentationController). Android (BottomSheetBehavior) supports up to 3 stops: collapsed, half expanded and expanded.
 */
export type BottomSheetDetent = 'content' | 'medium' | 'large' | number | { fraction: number };

export interface BottomSheetOptions {
    view: string | View; // View instance to be shown in bottom sheet. Or the name of the module to load starting from the application root.
    context?: any; // Any context you want to pass to the view shown in bottom sheet. This same context will be available in the arguments of the shownInBottomSheet event handler.
    animated?: boolean; // An optional parameter specifying whether to show the sheet view with animation.
    dismissOnBackgroundTap?: boolean; // An optional parameter specifying whether to dismiss the sheet when clicking on background.
    dismissOnDraggingDownSheet?: boolean; // An optional parameter specifying whether to disable dragging the sheet to dismiss.
    dismissOnBackButton?: boolean; // An optional parameter that specifies whether to close the sheet when pressing the back button.
    closeCallback?: Function; //  A function that will be called when the view is closed. Any arguments provided when calling shownInBottomSheet.closeCallback will be available here.
    trackingScrollView?: string; // optional id of the scroll view to track
    transparent?: boolean; // optional parameter to make the bottomsheet transparent
    backgroundOpacity?: number; // optional parameter to make the bottomsheet background semi transparent
    ignoreTopSafeArea?: boolean; // optional ios parameter to top safe area. Default is true
    ignoreBottomSafeArea?: boolean; // optional ios parameter to bottom safe area. Default is false
    disableDimBackground?: boolean; // optional parameter to remove the dim background
    skipCollapsedState?: boolean; // optional Android parameter to skip midway state when view is greater than 50%. Default is false
    peekHeight?: number; // optional parameter to set the collapsed sheet height. To work on iOS you need to set trackingScrollView.
    ignoreKeyboardHeight?: boolean; //(iOS only) A Boolean value that controls whether the height of the keyboard should affect the bottom sheet's frame when the keyboard shows on the screen. (Default: true)
    onChangeState?: onChangeStateBottomSheet; // One works to be called on the scroll of the sheet. Parameters: state (CLOSED, DRAGGING, DRAGGING, COLLAPSED) and slideOffset is the new offset of this bottom sheet within [-1,1] range. Offset increases as this bottom sheet is moving upward. From 0 to 1 the sheet is between collapsed and expanded states and from -1 to 0 it is between hidden and collapsed states.
    canTouchBehind?: boolean; //(Android only) allows to interact with the screen behind the sheet. For it to work properly need dismissOnBackgroundTap set to true
    windowSoftInputMode?: number; //(Android only) window softInputMode
    detents?: BottomSheetDetent[]; // the heights the sheet can rest at, from the smallest to the largest. Replaces peekHeight/skipCollapsedState
    initialDetentIndex?: number; // index in `detents` of the detent the sheet opens at. Default: the first one
    onDetentChange?: (index: number) => void; // called when the sheet rests at another detent
    largestUndimmedDetentIndex?: number; // index in `detents`: the background is not dimmed while the sheet rests at this detent or a smaller one. iOS also lets the touches go through to the content behind
    onWillDismiss?: () => boolean | void; // called when the user starts to dismiss the sheet (drag down on iOS, tap outside, back button on Android). Return false to prevent it. Android: the drag down can not be prevented, use dismissOnDraggingDownSheet: false
    onDismissAttempt?: () => void; // called when the user tried to dismiss the sheet but it was prevented (dismissOnXXX: false or onWillDismiss returning false). Android: not called for the drag down
    grabber?: boolean; // shows the drag handle. Default: true
    cornerRadius?: number; // corner radius of the sheet, in dip
    scrollExpands?: boolean; // (iOS only) scrolling the content to its edge expands/collapses the sheet. Default: true
    edgeAttachedInCompactHeight?: boolean; // (iOS only) in landscape the sheet is attached to the bottom edge instead of covering the full screen. Default: false
}

export abstract class ViewWithBottomSheetBase extends View {
    // used when triggering the closing of the bottomsheet
    protected _closeBottomSheetCallback: Function;

    // used when the bottomSheet is dismissed
    public _onDismissBottomSheetCallback: Function;

    // used when the bottomSheet change state
    public _onChangeStateBottomSheetCallback: onChangeStateBottomSheet;

    _bottomSheetFragment: any; // com.google.android.material.bottomsheet.BottomSheetDialogFragment
    protected abstract _hideNativeBottomSheet(parent, whenClosedCallback);

    protected _bottomSheetContext: any;

    _raiseShownBottomSheetEvent() {
        const args: ShownBottomSheetData = {
            eventName: shownInBottomSheetEvent,
            object: this,
            context: this._bottomSheetContext,
            closeCallback: this._closeBottomSheetCallback
        };

        this.notify(args);
    }

    _bottomSheetCloseIgnore = false;
    public _bottomSheetClosed(): void {
        if (this._bottomSheetCloseIgnore) {
            return;
        }
        const _rootModalViews = this._getRootModalViews();
        const modalIndex = _rootModalViews.indexOf(this);
        if (modalIndex !== -1) {
            _rootModalViews.splice(modalIndex, 1);
        }

        this._isAddedToNativeVisualTree = false;
        this._tearDownUI(true);
        this.parent = null;
        // if a frame _removeFromFrameStack will be called from _tearDownUI
        // if (this instanceof Frame) {
        //     this._removeFromFrameStack();
        // }
        // eachDescendant(this, (child: ViewWithBottomSheetBase) => {
        //     child._bottomSheetClosed();
        //     return true;
        // });
    }

    protected abstract _showNativeBottomSheet(parent: View, options: BottomSheetOptions);

    /**
     * Moves the shown sheet to a detent
     * @param index index in the `detents` option
     */
    public abstract setBottomSheetDetentIndex(index: number, animated?: boolean): void;

    /**
     * Index of the detent the sheet currently rests at
     */
    public abstract getBottomSheetDetentIndex(): number;

    protected _commonShowNativeBottomSheet(parent: View, options: BottomSheetOptions) {
        this._getRootModalViews().push(this);
        this.cssClasses.add(CSSUtils.MODAL_ROOT_VIEW_CSS_CLASS);
        const modalRootViewCssClasses = CSSUtils.getSystemCssClasses();
        modalRootViewCssClasses.forEach((c) => this.cssClasses.add(c));

        // (parent as any)._modal = this;
        options.context = options.context || {};
        this._bottomSheetContext = options.context;
        this._onDismissBottomSheetCallback = (...originalArgs) => {
            if (!this._onDismissBottomSheetCallback) {
                return;
            }
            this._raiseClosedBottomSheetEvent();
            this._onDismissBottomSheetCallback = null;
            this._bottomSheetClosed();
            if (this._bottomSheetContext.closeCallback) {
                this._bottomSheetContext.closeCallback();
                // only called if not already called by _closeBottomSheetCallback
                // if (typeof options.closeCallback === 'function') {
                //     options.closeCallback.apply(undefined, originalArgs);
                // }
            }
            this._closeBottomSheetCallback = null;
            this._bottomSheetContext = null;
        };
        this._closeBottomSheetCallback = (...originalArgs) => {
            if (!this._closeBottomSheetCallback) {
                return;
            }

            // const callback = this._closeBottomSheetCallback;
            this._closeBottomSheetCallback = null;
            if (this._bottomSheetContext) {
                this._bottomSheetContext.closeCallback = null;
            }
            const whenClosedCallback = () => {
                this._bottomSheetClosed();
                if (typeof options.closeCallback === 'function') {
                    options.closeCallback.apply(undefined, originalArgs);
                }
            };
            this._hideNativeBottomSheet(parent, whenClosedCallback);
        };

        if (options.onChangeState && typeof options.onChangeState === 'function') {
            this._onChangeStateBottomSheetCallback = (stateBottomSheet: StateBottomSheet, slideOffset: number) => {
                options.onChangeState(stateBottomSheet, slideOffset ?? stateBottomSheet);
            };
        }

        this._bottomSheetContext.closeCallback = this._closeBottomSheetCallback;
    }

    protected _raiseShowingBottomSheetEvent() {
        const args: ShownBottomSheetData = {
            eventName: showingInBottomSheetEvent,
            object: this,
            context: this._bottomSheetContext,
            closeCallback: this._closeBottomSheetCallback
        };
        this.notify(args);
    }

    _raiseClosedBottomSheetEvent() {
        const args = {
            eventName: closedSheetEvent,
            object: this,
            context: this._bottomSheetContext
        };
        this.notify(args);
    }

    public closeBottomSheet(...args) {
        const closeCallback = this._closeBottomSheetCallback;
        if (closeCallback) {
            closeCallback.apply(undefined, args);
        } else {
            const parent = this.parent as ViewWithBottomSheetBase;
            if (parent) {
                parent.closeBottomSheet(...args);
            }
        }
    }

    public showBottomSheet(options: BottomSheetOptions): View {
        if (arguments.length === 0) {
            throw new Error('showModal without parameters is deprecated. Please call showModal on a view instance instead.');
        } else {
            const view =
                options.view instanceof View
                    ? (options.view as any as ViewWithBottomSheetBase)
                    : (Builder.createViewFromEntry({
                          moduleName: options.view
                      }) as ViewWithBottomSheetBase);
            view._showNativeBottomSheet(this, options);
            return view;
        }
    }
}
