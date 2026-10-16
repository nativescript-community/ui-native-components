import { Application, Page, Trace, Utils, View, fromObject } from '@nativescript/core';
import { applyMixins } from '@nativescript-community/ui-core';
import { BottomSheetOptions } from './bottomsheet-common';
import { StateBottomSheet, ViewWithBottomSheetBase } from './bottomsheet-common';
import { IMDLayoutViewController, MDLayoutViewController, getPresentingController } from './ios-layout';

export { ViewWithBottomSheetBase } from './bottomsheet-common';

const majorVersion = Utils.ios.MajorVersion;
const CONTENT_DETENT = 'content';
const PEEK_DETENT = 'peek';
const LARGE_DETENT = 'large';

/**
 * iOS: native UISheetPresentationController (iOS 15+, custom detents for iOS 16+).
 * Supported: peekHeight, skipCollapsedState, dismissOnBackgroundTap/dismissOnDraggingDownSheet, canTouchBehind,
 * disableDimBackground, transparent, backgroundOpacity, ignoreTopSafeArea/ignoreBottomSafeArea, onChangeState (COLLAPSED/EXPANDED/CLOSED).
 * No-op: continuous DRAGGING state, ignoreKeyboardHeight, trackingScrollView (UIKit tracks the scrolling content by itself).
 * UIKit does not allow to dismiss on background tap and on dragging independently: if one is disabled, both are.
 */
@NativeClass
class SheetDelegateImpl extends NSObject {
    static ObjCProtocols = [UISheetPresentationControllerDelegate];
    _owner: WeakRef<ViewWithBottomSheet>;
    public static initWithOwner(owner: ViewWithBottomSheet) {
        const delegate = SheetDelegateImpl.new() as SheetDelegateImpl;
        delegate._owner = new WeakRef(owner);
        return delegate;
    }
    sheetPresentationControllerDidChangeSelectedDetentIdentifier(sheet: UISheetPresentationController) {
        const owner = this._owner.get();
        if (owner?._onChangeStateBottomSheetCallback) {
            owner._onChangeStateBottomSheetCallback(sheet.selectedDetentIdentifier === LARGE_DETENT || sheet.selectedDetentIdentifier === CONTENT_DETENT ? StateBottomSheet.EXPANDED : StateBottomSheet.COLLAPSED);
        }
        owner?._onDetentChange?.(owner.getBottomSheetDetentIndex());
    }
    presentationControllerShouldDismiss(presentationController: UIPresentationController) {
        const owner = this._owner.get();
        return owner?._onWillDismiss ? owner._onWillDismiss() !== false : true;
    }
    presentationControllerDidAttemptToDismiss(presentationController: UIPresentationController) {
        this._owner.get()?._onDismissAttempt?.();
    }
    presentationControllerDidDismiss(presentationController: UIPresentationController) {
        // called when dismissed by the user (dragging down or background tap)
        const owner = this._owner.get();
        if (owner) {
            owner._onChangeStateBottomSheetCallback?.(StateBottomSheet.CLOSED);
            owner._unloadBottomSheet();
        }
    }
}

/**
 * With an undimmed detent UIKit has no dimming view, so there is no tap outside to dismiss the sheet: this recognizer replaces it
 */
@NativeClass
class OutsideTapTarget extends NSObject {
    _owner: WeakRef<ViewWithBottomSheet>;
    static initWithOwner(owner: ViewWithBottomSheet) {
        const target = OutsideTapTarget.new() as OutsideTapTarget;
        target._owner = new WeakRef(owner);
        return target;
    }
    outsideTapped() {
        this._owner.get()?._onOutsideTap();
    }
    static ObjCExposedMethods = {
        outsideTapped: { returns: interop.types.void, params: [] }
    };
}

export class ViewWithBottomSheet extends ViewWithBottomSheetBase {
    bottomSheetDelegate: SheetDelegateImpl;
    _detentIds: string[] = [];
    _onDetentChange: (index: number) => void;
    _onWillDismiss: () => boolean | void;
    _onDismissAttempt: () => void;
    _outsideTapRecognizer: UITapGestureRecognizer;
    _outsideTapTarget: OutsideTapTarget;
    _outsideTapView: UIView;

    _onOutsideTap() {
        const sheet = this.bottomSheetController?.sheetPresentationController;
        const undimmedId = sheet?.largestUndimmedDetentIdentifier;
        // the system dimming view handles the taps at the larger detents
        if (undimmedId && sheet.selectedDetentIdentifier !== undimmedId && this._detentIds.indexOf(sheet.selectedDetentIdentifier) > this._detentIds.indexOf(undimmedId)) {
            return;
        }
        if (this._onWillDismiss?.() === false) {
            this._onDismissAttempt?.();
            return;
        }
        this.closeBottomSheet();
    }
    bottomSheetController: UIViewController;
    protected _showNativeBottomSheet(parent: View, options: BottomSheetOptions) {
        options.context = options.context || {};
        let rootView = Application.getRootView();
        if (rootView.parent) {
            rootView = rootView.parent as any;
        }
        let currentView = parent.page || rootView;
        currentView = currentView.modal || currentView;
        const parentController = getPresentingController(parent);

        if (!parentController.view || !parentController.view.window) {
            Trace.write('Parent page is not part of the window hierarchy.', Trace.categories.ViewHierarchy, Trace.messageType.error);
            return;
        }

        this.parent = Application.getRootView();

        // dirty trick for RADSideDrawer. as we set parent for css variables/classes, _setupAsRootView
        // will call _addViewToNativeVisualTree which breaks the bottomSheet with RADSiderDrawer
        // so we disable _addViewToNativeVisualTree for _setupAsRootView
        const oldAddViewToNativeVisualTree = this.parent._addViewToNativeVisualTree;
        this.parent._addViewToNativeVisualTree = () => false;
        this._setupAsRootView({});
        this.parent._addViewToNativeVisualTree = oldAddViewToNativeVisualTree;

        this._commonShowNativeBottomSheet(currentView, options);
        let controller: IMDLayoutViewController = this.viewController;
        if (!controller) {
            const nativeView = this.ios || this.nativeViewProtected;
            controller = MDLayoutViewController.initWithOwner(this);
            controller.ignoreBottomSafeArea = options.ignoreBottomSafeArea !== undefined ? options.ignoreBottomSafeArea : false;
            controller.ignoreTopSafeArea = options.ignoreTopSafeArea !== undefined ? options.ignoreTopSafeArea : true;
            if (nativeView instanceof UIView) {
                controller.view.addSubview(nativeView);
            }
            this.viewController = controller; // store the viewController so that safeArea overflow is applied correctly
        }

        this._raiseShowingBottomSheetEvent();
        this.bottomSheetController = controller;
        controller.modalPresentationStyle = UIModalPresentationStyle.PageSheet;
        const sheet = controller.sheetPresentationController;
        if (sheet) {
            this.configureSheet(sheet, controller, options, parentController);
        }
        controller.nsAnimated = true;
        parentController.presentViewControllerAnimatedCompletion(controller, true, null);
        if (options.transparent === true) {
            controller.view.backgroundColor = UIColor.clearColor;
        } else {
            if (!(this instanceof Page)) {
                controller.view.backgroundColor = UIColor.systemBackgroundColor;
            }
            if (options.backgroundOpacity && controller.view.backgroundColor) {
                controller.view.backgroundColor = controller.view.backgroundColor.colorWithAlphaComponent(options.backgroundOpacity);
            }
        }
        const transitionCoordinator = controller.transitionCoordinator;
        if (transitionCoordinator) {
            UIViewControllerTransitionCoordinator.prototype.animateAlongsideTransitionCompletion.call(transitionCoordinator, null, () => {
                this.bindingContext = fromObject(options.context);
                this._raiseShownBottomSheetEvent();
            });
        } else {
            this.bindingContext = fromObject(options.context);
            this._raiseShownBottomSheetEvent();
        }
    }

    private configureSheet(sheet: UISheetPresentationController, controller: IMDLayoutViewController, options: BottomSheetOptions, parentController: UIViewController) {
        const large = UISheetPresentationControllerDetent.largeDetent();
        const detentIds: string[] = [];
        this._onDetentChange = options.onDetentChange;
        this._onWillDismiss = options.onWillDismiss;
        this._onDismissAttempt = options.onDismissAttempt;
        if (majorVersion >= 16) {
            // the sheet follows the size of its content (measured in MDLayoutViewController)
            const contentHeight = () => controller.preferredContentSize.height || Utils.layout.toDeviceIndependentPixels(0);
            const detents: UISheetPresentationControllerDetent[] = [];
            const peekHeight = options.peekHeight;
            if (options.detents?.length) {
                options.detents.forEach((detent, index) => {
                    const id = `detent-${index}`;
                    detents.push(
                        UISheetPresentationControllerDetent.customDetentWithIdentifierResolver(id, (context) => {
                            const max = context.maximumDetentValue;
                            let height: number;
                            if (detent === 'large') {
                                height = max;
                            } else if (detent === 'medium') {
                                height = max / 2;
                            } else if (detent === 'content') {
                                height = contentHeight() || max;
                            } else if (typeof detent === 'number') {
                                height = detent;
                            } else {
                                height = detent.fraction * max;
                            }
                            return Math.min(height, max);
                        })
                    );
                    detentIds.push(id);
                });
            } else if (peekHeight && options.skipCollapsedState !== true) {
                detents.push(UISheetPresentationControllerDetent.customDetentWithIdentifierResolver(PEEK_DETENT, (context) => Math.min(peekHeight, context.maximumDetentValue)));
                detentIds.push(PEEK_DETENT);
            }
            if (!options.detents?.length) {
                detents.push(
                    UISheetPresentationControllerDetent.customDetentWithIdentifierResolver(CONTENT_DETENT, (context) => {
                        const height = contentHeight();
                        return height > 0 ? Math.min(height, context.maximumDetentValue) : context.maximumDetentValue;
                    })
                );
                detentIds.push(CONTENT_DETENT);
            }
            sheet.detents = NSArray.arrayWithArray(detents as any);
            if (options.detents?.length) {
                sheet.selectedDetentIdentifier = detentIds[Math.min(options.initialDetentIndex || 0, detentIds.length - 1)];
            }
            // update the detent once the content is measured
            controller.onLayoutCallback = () => {
                sheet.invalidateDetents();
            };
        } else {
            // iOS 15: only system detents
            sheet.detents = NSArray.arrayWithArray([options.skipCollapsedState || !options.peekHeight ? large : UISheetPresentationControllerDetent.mediumDetent(), large] as any);
            detentIds.push(LARGE_DETENT);
        }
        this._detentIds = detentIds;
        sheet.prefersGrabberVisible = options.grabber !== false;
        sheet.prefersScrollingExpandsWhenScrolledToEdge = options.scrollExpands !== false;
        sheet.prefersEdgeAttachedInCompactHeight = options.edgeAttachedInCompactHeight === true;
        sheet.widthFollowsPreferredContentSizeWhenEdgeAttached = true;
        if (options.cornerRadius !== undefined) {
            sheet.preferredCornerRadius = options.cornerRadius;
        }
        if (options.largestUndimmedDetentIndex !== undefined && detentIds[options.largestUndimmedDetentIndex]) {
            sheet.largestUndimmedDetentIdentifier = detentIds[options.largestUndimmedDetentIndex];
            if (options.canTouchBehind !== true && options.dismissOnBackgroundTap !== false) {
                // tap outside dismisses, the touch is not given to the content behind
                const view = parentController?.view;
                if (view) {
                    this._outsideTapTarget = OutsideTapTarget.initWithOwner(this);
                    this._outsideTapRecognizer = UITapGestureRecognizer.alloc().initWithTargetAction(this._outsideTapTarget, 'outsideTapped');
                    this._outsideTapRecognizer.cancelsTouchesInView = true;
                    view.addGestureRecognizer(this._outsideTapRecognizer);
                    this._outsideTapView = view;
                }
            }
        } else if (options.canTouchBehind === true || options.disableDimBackground === true) {
            // no dimming at the biggest detent => touches go through to the content behind
            sheet.largestUndimmedDetentIdentifier = detentIds[detentIds.length - 1];
        }
        if (options.dismissOnBackgroundTap === false || options.dismissOnDraggingDownSheet === false) {
            controller.modalInPresentation = true;
        }
        this.bottomSheetDelegate = SheetDelegateImpl.initWithOwner(this);
        sheet.delegate = this.bottomSheetDelegate;
    }

    setBottomSheetDetentIndex(index: number, animated = true) {
        const sheet = this.bottomSheetController?.sheetPresentationController;
        const id = this._detentIds[index];
        if (!sheet || !id) {
            return;
        }
        const apply = () => {
            sheet.selectedDetentIdentifier = id;
        };
        animated ? sheet.animateChanges(apply) : apply();
    }

    getBottomSheetDetentIndex() {
        const sheet = this.bottomSheetController?.sheetPresentationController;
        return sheet ? this._detentIds.indexOf(sheet.selectedDetentIdentifier) : -1;
    }

    _bottomSheetClosed() {
        // super already called we are just a mixin
        if (this.bottomSheetController) {
            const sheet = this.bottomSheetController.sheetPresentationController;
            if (sheet) {
                sheet.delegate = null;
            }
            (this.bottomSheetController as IMDLayoutViewController).onLayoutCallback = null;
            this.bottomSheetController = null;
        }
        this.bottomSheetDelegate = null;
        if (this._outsideTapRecognizer) {
            this._outsideTapView?.removeGestureRecognizer(this._outsideTapRecognizer);
            this._outsideTapRecognizer = null;
            this._outsideTapTarget = null;
            this._outsideTapView = null;
        }
        this._onDetentChange = null;
        this._onWillDismiss = null;
        this._onDismissAttempt = null;
        // it is very important to clear the viewController as N does not do it
        // and the destroy of the view from svelte could trigger a layout pass on the viewController
        this.viewController = null;
    }
    protected _hideNativeBottomSheet(parent: View, whenClosedCallback: () => void) {
        if (!this.viewController) {
            // when dismissed by the user there is nothing to dismiss
            whenClosedCallback?.();
            return;
        }
        const parentController = getPresentingController(parent);
        const animated = this.viewController.nsAnimated;
        parentController.dismissViewControllerAnimatedCompletion(animated, whenClosedCallback);
    }

    _unloadBottomSheet() {
        if (this.isLoaded) {
            this.callUnloaded();
        }
        this._onDismissBottomSheetCallback && this._onDismissBottomSheetCallback();
    }
}

let mixinInstalled = false;
export function overrideBottomSheet() {
    applyMixins(View, [ViewWithBottomSheetBase, ViewWithBottomSheet]);
}
export function install() {
    if (!mixinInstalled) {
        mixinInstalled = true;
        overrideBottomSheet();
    }
}
