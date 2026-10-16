import { applyMixins } from '@nativescript-community/ui-core';
import { AndroidActivityBackPressedEventData, Application, Utils, View, fromObject } from '@nativescript/core';
import { BottomSheetDetent, BottomSheetOptions, StateBottomSheet, ViewWithBottomSheetBase } from './bottomsheet-common';

export { ViewWithBottomSheetBase } from './bottomsheet-common';

interface BottomSheetDataOptions {
    owner: View;
    options: BottomSheetOptions;
    shownCallback: () => void;
    dismissCallback: () => void;
}

function getId(id: string) {
    const context: android.content.Context = Application.android.context;
    return context.getResources().getIdentifier(id, 'id', context.getPackageName());
}

@NativeClass
class ChangeStateBottomSheet extends com.google.android.material.bottomsheet.BottomSheetBehavior.BottomSheetCallback {
    constructor(private owner: WeakRef<ViewWithBottomSheet>) {
        super();
        return global.__native(this);
    }

    onSlide(bottomSheet: android.view.View, slideOffset: number) {
        const owner = this.owner?.get();
        owner?.updateDimForSlide(slideOffset);
        if (owner && this.checkActiveCallback()) {
            owner._onChangeStateBottomSheetCallback(StateBottomSheet.DRAGGING, slideOffset);
        }
    }

    onStateChanged(bottomSheet: android.view.View, newState: number) {
        const owner = this.owner?.get();
        if (!owner) {
            return;
        }
        owner.updateDimForState(newState);
        if (this.checkActiveCallback()) {
            const status = this.getStateBottomSheetFromBottomSheetBehavior(newState);
            if (status !== undefined) {
                owner._onChangeStateBottomSheetCallback(status);
            }
        }
        if (owner._onDetentChange && owner._detentCount > 0 && newState !== com.google.android.material.bottomsheet.BottomSheetBehavior.STATE_DRAGGING && newState !== com.google.android.material.bottomsheet.BottomSheetBehavior.STATE_SETTLING) {
            const index = owner.getBottomSheetDetentIndex();
            if (index >= 0) {
                owner._onDetentChange(index);
            }
        }
    }

    private checkActiveCallback() {
        return this.owner?.get()?._onChangeStateBottomSheetCallback;
    }

    public getStateBottomSheetFromBottomSheetBehavior(state: number): StateBottomSheet | undefined {
        switch (state) {
            case com.google.android.material.bottomsheet.BottomSheetBehavior.STATE_HIDDEN:
                return StateBottomSheet.CLOSED;
            case com.google.android.material.bottomsheet.BottomSheetBehavior.STATE_EXPANDED:
                return StateBottomSheet.EXPANDED;
            case com.google.android.material.bottomsheet.BottomSheetBehavior.STATE_COLLAPSED:
                return StateBottomSheet.COLLAPSED;
            case com.google.android.material.bottomsheet.BottomSheetBehavior.STATE_DRAGGING:
                return StateBottomSheet.DRAGGING;
            default:
                // @ts-ignore
                return;
        }
    }
}

const DRAG_HANDLE_MARGIN = 28;

/**
 * Android: the detents are the stops of BottomSheetBehavior (collapsed, half expanded, expanded).
 */
export class ViewWithBottomSheet extends ViewWithBottomSheetBase {
    _bottomSheetFragment: com.nativescript.material.bottomsheet.BottomSheetDialogFragment;
    _bottomSheetOptions: BottomSheetOptions;
    _bottomSheetBehavior: com.google.android.material.bottomsheet.BottomSheetBehavior<android.view.View>;
    _detentCount = 0;
    _detentHeights: number[] = [];
    _baseDimAmount = 0.32;
    _undimmedIndex: number;
    _bottomSheetWindow: android.view.Window;
    _onDetentChange: (index: number) => void;

    /**
     * State of the behavior for the index of a detent: 1 detent = expanded, 2 = collapsed/expanded, 3 = collapsed/half expanded/expanded
     */
    /**
     * `largestUndimmedDetentIndex`: no dim at the undimmed detent and below it, the dim grows above it
     */
    updateDimForSlide(slideOffset: number) {
        const heights = this._detentHeights;
        if (this._undimmedIndex === undefined || !this._bottomSheetWindow || heights.length < 2 || slideOffset < 0) {
            return;
        }
        const min = heights[0];
        const max = heights[heights.length - 1];
        const undimmed = heights[Math.min(this._undimmedIndex, heights.length - 1)];
        const height = min + slideOffset * (max - min);
        const ratio = max > undimmed ? Math.min(1, Math.max(0, (height - undimmed) / (max - undimmed))) : 1;
        this._bottomSheetWindow.setDimAmount(this._baseDimAmount * ratio);
    }

    updateDimForState(state: number) {
        if (this._undimmedIndex === undefined || !this._bottomSheetWindow || this._detentCount === 0) {
            return;
        }
        const BSB = com.google.android.material.bottomsheet.BottomSheetBehavior;
        if (state === BSB.STATE_DRAGGING || state === BSB.STATE_SETTLING) {
            return;
        }
        const index = this.getBottomSheetDetentIndex();
        if (index >= 0) {
            this._bottomSheetWindow.setDimAmount(index <= this._undimmedIndex ? 0 : this._baseDimAmount);
        }
    }

    private stateForDetentIndex(index: number) {
        const BSB = com.google.android.material.bottomsheet.BottomSheetBehavior;
        const count = this._detentCount;
        if (count <= 1 || index >= count - 1) {
            return BSB.STATE_EXPANDED;
        }
        return index <= 0 ? BSB.STATE_COLLAPSED : BSB.STATE_HALF_EXPANDED;
    }

    setBottomSheetDetentIndex(index: number, animated = true) {
        const behavior = this._bottomSheetBehavior;
        if (!behavior || this._detentCount === 0) {
            return;
        }
        // setState animates
        behavior.setState(this.stateForDetentIndex(index));
    }

    getBottomSheetDetentIndex() {
        const behavior = this._bottomSheetBehavior;
        if (!behavior || this._detentCount === 0) {
            return -1;
        }
        const BSB = com.google.android.material.bottomsheet.BottomSheetBehavior;
        switch (behavior.getState()) {
            case BSB.STATE_COLLAPSED:
                return this._detentCount > 1 ? 0 : -1;
            case BSB.STATE_HALF_EXPANDED:
                return 1;
            case BSB.STATE_EXPANDED:
                return this._detentCount - 1;
            default:
                return -1;
        }
    }

    /**
     * Applies the `detents` option once the sheet is laid out (the available and the content heights are known)
     */
    applyDetents(sheet: android.view.View, behavior: com.google.android.material.bottomsheet.BottomSheetBehavior<android.view.View>, options: BottomSheetOptions) {
        const parentHeight = (sheet.getParent() as any as android.view.View).getHeight();
        const contentHeight = this.nativeViewProtected?.getHeight() || parentHeight;
        const resolve = (detent: BottomSheetDetent) => {
            let height: number;
            if (detent === 'large') {
                height = parentHeight;
            } else if (detent === 'medium') {
                height = parentHeight / 2;
            } else if (detent === 'content') {
                height = contentHeight;
            } else if (typeof detent === 'number') {
                height = Utils.layout.toDevicePixels(detent);
            } else {
                height = detent.fraction * parentHeight;
            }
            return Math.round(Math.min(height, parentHeight));
        };
        let detents = options.detents;
        if (detents.length > 3) {
            // collapsed, half expanded, expanded
            detents = [detents[0], detents[Math.floor(detents.length / 2)], detents[detents.length - 1]];
        }
        const heights = detents.map(resolve);
        const count = heights.length;
        const max = heights[count - 1];
        this._detentCount = count;
        this._detentHeights = heights;
        // the content can be smaller than the largest detent
        sheet.setMinimumHeight(max);
        behavior.setPeekHeight(heights[0]);
        if (count <= 2) {
            behavior.setFitToContents(true);
            behavior.setSkipCollapsed(count === 1);
        } else {
            behavior.setFitToContents(false);
            behavior.setExpandedOffset(parentHeight - max);
            behavior.setHalfExpandedRatio(Math.min(0.99, Math.max(0.01, heights[1] / parentHeight)));
            behavior.setSkipCollapsed(false);
        }
        behavior.setState(this.stateForDetentIndex(options.initialDetentIndex || 0));
        this.updateDimForState(behavior.getState());
    }

    /**
     * BottomSheetBehavior only follows a child which supports nested scrolling: RecyclerView (@nativescript-community/ui-collectionview) does,
     * the ScrollView and the ListView of NativeScript do not by default.
     * `trackingScrollView` is the id of the view to enable, else the scrollable views of the content are enabled.
     */
    enableNestedScrolling(sheet: android.view.View) {
        const trackingId = this._bottomSheetOptions?.trackingScrollView;
        const enable = (view: View) => {
            const native = view.nativeViewProtected;
            if (native instanceof android.view.View && (native instanceof android.widget.ScrollView || native instanceof android.widget.AbsListView || native instanceof android.webkit.WebView || (trackingId && view.id === trackingId))) {
                androidx.core.view.ViewCompat.setNestedScrollingEnabled(native, true);
            }
        };
        this.eachChildView(function visit(child: View) {
            enable(child);
            child.eachChildView(visit);
            return true;
        });
        enable(this);
        // the behavior finds its scrolling child when laid out
        sheet.requestLayout();
    }

    applyGrabber(fragment: com.nativescript.material.bottomsheet.BottomSheetDialogFragment, sheet: android.view.View) {
        const handle = new com.google.android.material.bottomsheet.BottomSheetDragHandleView(fragment.getActivity());
        (sheet as android.view.ViewGroup).addView(handle, new android.widget.FrameLayout.LayoutParams(android.view.ViewGroup.LayoutParams.MATCH_PARENT, android.view.ViewGroup.LayoutParams.WRAP_CONTENT, android.view.Gravity.TOP));
        // the content starts below the handle
        const content = this.nativeViewProtected;
        const params = content?.getLayoutParams();
        if (params instanceof android.view.ViewGroup.MarginLayoutParams) {
            params.topMargin = Utils.layout.toDevicePixels(DRAG_HANDLE_MARGIN);
            content.setLayoutParams(params);
        }
    }

    applyCornerRadius(sheet: android.view.View, radius: number) {
        const background = sheet.getBackground();
        if (background instanceof com.google.android.material.shape.MaterialShapeDrawable) {
            const size = Utils.layout.toDevicePixels(radius);
            background.setShapeAppearanceModel(background.getShapeAppearanceModel().toBuilder().setTopLeftCornerSize(size).setTopRightCornerSize(size).build());
        }
    }
    protected _hideNativeBottomSheet(parent: View, whenClosedCallback: () => void) {
        // call whenClosedCallback first because dismiss will call another one (without result)
        whenClosedCallback();
        const manager = this._bottomSheetFragment.getFragmentManager();
        if (manager) {
            this._bottomSheetFragment.dismissAllowingStateLoss();
        }

        this._bottomSheetFragment = null;
    }

    protected _showNativeBottomSheet(parent: View, options: BottomSheetOptions) {
        this._bottomSheetOptions = options;
        this._commonShowNativeBottomSheet(parent, options);
        const that = new WeakRef(this);
        const domId = this._domId;
        const bottomSheetOptions: BottomSheetDataOptions = {
            owner: this,
            options,
            shownCallback: () => {
                this.bindingContext = fromObject(options.context);
                this._raiseShownBottomSheetEvent();
            },
            dismissCallback: () => this._onDismissBottomSheetCallback?.()
        };
        const dfListener = new com.nativescript.material.bottomsheet.BottomSheetDialogFragment.BottomSheetDialogFragmentListener({
            onCreateDialog(fragment: com.nativescript.material.bottomsheet.BottomSheetDialogFragment, savedInstanceState: android.os.Bundle): android.app.Dialog {
                const theme = fragment.getTheme();
                const dialogListener = new com.nativescript.material.bottomsheet.BottomSheetDialog.BottomSheetDialogListener({
                    onDetachedFromWindow(dialog: com.nativescript.material.bottomsheet.BottomSheetDialog) {
                        (dialog as any).nListener = null;
                    },

                    onBackPressed(dialog: com.nativescript.material.bottomsheet.BottomSheetDialog) {
                        const sheetOptions = bottomSheetOptions.options;
                        if (sheetOptions?.dismissOnBackButton === false) {
                            sheetOptions.onDismissAttempt?.();
                            return true;
                        }
                        if (sheetOptions?.onWillDismiss && sheetOptions.onWillDismiss() === false) {
                            sheetOptions.onDismissAttempt?.();
                            return true;
                        }
                        const owner = that?.get();
                        if (!owner) {
                            return false;
                        }
                        const args = {
                            eventName: 'activityBackPressed',
                            object: owner,
                            activity: owner._context,
                            cancel: false
                        } as AndroidActivityBackPressedEventData;

                        // Fist fire application.android global event
                        Application.android.notify(args);
                        if (args.cancel) {
                            return true;
                        }

                        owner.notify(args);
                        if (!args.cancel) {
                            args.cancel = owner.onBackPressed();
                        }
                        return args.cancel;
                    }
                });
                const dialog = new com.nativescript.material.bottomsheet.BottomSheetDialog(fragment.getActivity(), theme);
                dialog.setListener(dialogListener);
                (dialog as any).nListener = dialogListener;
                if (bottomSheetOptions.options) {
                    const creationOptions = bottomSheetOptions.options;
                    if (creationOptions.dismissOnBackgroundTap !== undefined) {
                        dialog.setCanceledOnTouchOutside(creationOptions.dismissOnBackgroundTap);
                    }
                    if (creationOptions.disableDimBackground === true) {
                        dialog.getWindow().clearFlags(android.view.WindowManager.LayoutParams.FLAG_DIM_BEHIND);
                    }
                }
                return dialog;
            },

            onCreateView(
                fragment: com.nativescript.material.bottomsheet.BottomSheetDialogFragment,
                inflater: android.view.LayoutInflater,
                container: android.view.ViewGroup,
                savedInstanceState: android.os.Bundle
            ): android.view.View {
                const owner = that?.get();
                if (owner) {
                    owner._setupAsRootView(fragment.getActivity());
                    owner.parent = Application.getRootView();
                    owner._isAddedToNativeVisualTree = true;
                    const window = fragment.getDialog().getWindow();

                    if (bottomSheetOptions.options?.windowSoftInputMode !== undefined) {
                        window.setSoftInputMode(bottomSheetOptions.options?.windowSoftInputMode);
                    } else {
                        // the dialog seems to not follow the default activity softInputMode,
                        // thus set we set it here.
                        window.setSoftInputMode((owner._context as androidx.appcompat.app.AppCompatActivity).getWindow().getAttributes().softInputMode);
                    }
                    return owner.nativeViewProtected;
                }
                return null;
            },

            onStart(fragment: com.nativescript.material.bottomsheet.BottomSheetDialogFragment): void {
                const owner = that?.get();
                if (!owner) {
                    return;
                }
                const contentViewId = getId('design_bottom_sheet');
                const view = fragment.getDialog().findViewById(contentViewId);
                const transparent = bottomSheetOptions.options?.transparent === true;
                if (transparent) {
                    // we need delay it just a bit or it wont work
                    setTimeout(() => {
                        view.setBackground(null);
                    }, 0);
                } else if (bottomSheetOptions.options?.backgroundOpacity) {
                    // we need delay it just a bit or it wont work
                    setTimeout(() => {
                        const backgroundDrawable = view.getBackground();
                        backgroundDrawable.setAlpha(bottomSheetOptions.options?.backgroundOpacity * 255);
                        view.setBackground(backgroundDrawable);
                    }, 0);
                }

                const behavior = com.google.android.material.bottomsheet.BottomSheetBehavior.from(view);
                // prevent hiding the bottom sheet by
                const dismissOnDraggingDownSheet = bottomSheetOptions.options?.dismissOnDraggingDownSheet !== false;
                behavior.setHideable(dismissOnDraggingDownSheet);

                const peekHeight = bottomSheetOptions.options?.detents?.length ? undefined : bottomSheetOptions.options?.peekHeight;
                if (peekHeight) {
                    behavior.setState(com.google.android.material.bottomsheet.BottomSheetBehavior.STATE_COLLAPSED);
                    behavior.setPeekHeight(Utils.layout.toDevicePixels(peekHeight));
                }
                if (!dismissOnDraggingDownSheet) {
                    // directly expand the bottom sheet after start
                    behavior.setState(com.google.android.material.bottomsheet.BottomSheetBehavior.STATE_EXPANDED);
                    // set to maximum possible value to prevent dragging the sheet between peek and expanded height
                    behavior.setPeekHeight(java.lang.Integer.MAX_VALUE);
                }
                const skipCollapsedState = bottomSheetOptions.options?.skipCollapsedState === true && !bottomSheetOptions.options?.detents?.length;
                if (skipCollapsedState) {
                    // directly expand the bottom sheet after start
                    behavior.setState(com.google.android.material.bottomsheet.BottomSheetBehavior.STATE_EXPANDED);
                    // disable peek/collapsed state
                    behavior.setSkipCollapsed(true);
                }

                owner._bottomSheetBehavior = behavior;
                const window = fragment.getDialog().getWindow();
                owner._bottomSheetWindow = window;
                owner._baseDimAmount = window.getAttributes().dimAmount || 0.32;
                owner._undimmedIndex = bottomSheetOptions.options?.largestUndimmedDetentIndex;
                const sheetOptions = bottomSheetOptions.options;
                if (!sheetOptions?.canTouchBehind && (sheetOptions?.onWillDismiss || sheetOptions?.onDismissAttempt)) {
                    // the tap outside is handled here to call onWillDismiss/onDismissAttempt
                    const touchOutside = (view.getParent() as any as android.view.View).findViewById(getId('touch_outside'));
                    touchOutside?.setOnClickListener(
                        new android.view.View.OnClickListener({
                            onClick: () => {
                                if (sheetOptions.dismissOnBackgroundTap !== false && sheetOptions.onWillDismiss?.() !== false) {
                                    fragment.getDialog().cancel();
                                } else {
                                    sheetOptions.onDismissAttempt?.();
                                }
                            }
                        })
                    );
                }
                // the scrollable content (ScrollView, ListView, CollectionView...) must take part in the nested scrolling to be scrolled before the sheet
                owner.enableNestedScrolling(view);
                owner._onDetentChange = bottomSheetOptions.options?.onDetentChange;
                if (bottomSheetOptions.options?.detents?.length) {
                    // once laid out
                    view.post(
                        new java.lang.Runnable({
                            run: () => {
                                owner.applyDetents(view, behavior, bottomSheetOptions.options);
                            }
                        })
                    );
                }
                if (bottomSheetOptions.options?.grabber !== false) {
                    owner.applyGrabber(fragment, view);
                }
                if (bottomSheetOptions.options?.cornerRadius !== undefined) {
                    // the background is set after the start
                    setTimeout(() => owner.applyCornerRadius(view, bottomSheetOptions.options.cornerRadius), 0);
                }

                const onChangeState = bottomSheetOptions.options?.onChangeState;
                if (onChangeState || bottomSheetOptions.options?.onDetentChange || bottomSheetOptions.options?.largestUndimmedDetentIndex !== undefined) {
                    const changeStateBottomSheet = new ChangeStateBottomSheet(that);
                    behavior.addBottomSheetCallback(changeStateBottomSheet);
                    that?.get()?._onChangeStateBottomSheetCallback?.(changeStateBottomSheet.getStateBottomSheetFromBottomSheetBehavior(behavior.getState()));
                }

                if (owner && !owner.isLoaded) {
                    owner.callLoaded();
                }

                if (bottomSheetOptions.options.canTouchBehind) {
                    // necessary for smooth movement of the back page
                    fragment.getDialog().getWindow().setFlags(android.view.WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE, android.view.WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE);
                    const coordinator = view.getParent();
                    if (coordinator instanceof android.view.View) {
                        coordinator.findViewById(getId('touch_outside')).setOnTouchListener(
                            new android.view.View.OnTouchListener({
                                onTouch(view, event) {
                                    const forwardedEvent = android.view.MotionEvent.obtain(event);
                                    forwardedEvent.setLocation(event.getRawX(), event.getRawY());
                                    try {
                                        fragment.getActivity().dispatchTouchEvent(forwardedEvent);
                                    } finally {
                                        forwardedEvent.recycle();
                                    }
                                    return false;
                                }
                            })
                        );
                    }
                }

                bottomSheetOptions.shownCallback();
            },

            onDismiss(fragment: com.nativescript.material.bottomsheet.BottomSheetDialogFragment, dialog: android.content.DialogInterface): void {
                const owner = that?.get();
                if (owner) {
                    owner._bottomSheetCloseIgnore = true;
                }
                bottomSheetOptions.dismissCallback();
            },

            onDestroy(fragment: com.nativescript.material.bottomsheet.BottomSheetDialogFragment): void {
                (df as any).nListener = null;
                const owner = that?.get();
                if (owner) {
                    owner._bottomSheetCloseIgnore = false;
                    owner._bottomSheetClosed();
                }
            }
        });
        const df = new com.nativescript.material.bottomsheet.BottomSheetDialogFragment();
        df.setListener(dfListener);
        (df as any).nListener = dfListener;
        this._bottomSheetFragment = df;
        this._raiseShowingBottomSheetEvent();
        //@ts-ignore
        df.show(parent._getRootFragmentManager(), domId.toString());
    }
}

let mixinInstalled = false;
export function overrideBottomSheet() {
    applyMixins(View, [ViewWithBottomSheetBase, ViewWithBottomSheet]);
}
export function install() {
    if (!mixinInstalled) {
        mixinInstalled = true;
        // overridePage();
        overrideBottomSheet();
    }
}
