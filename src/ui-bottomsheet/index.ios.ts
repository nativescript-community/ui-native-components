import { Application, Page, Trace, Utils, View, fromObject } from '@nativescript/core';
import { applyMixins } from '@nativescript-community/ui-core';
import { BottomSheetOptions } from './index-common';
import { StateBottomSheet, ViewWithBottomSheetBase } from './index-common';
import { CatalystCard, IMDLayoutViewController, MDLayoutViewController, getCatalystDetentHeights, getPresentingController, setCatalystVisibleHeight } from './ios-layout';

export { ViewWithBottomSheetBase } from './index-common';

const majorVersion = Utils.ios.MajorVersion;
const CONTENT_DETENT = 'content';
const PEEK_DETENT = 'peek';
const LARGE_DETENT = 'large';
// UIKit shows a sheet as a window modal one on Mac Catalyst: the sheet is then a card at the bottom of the window
// isMacCatalystApp is not always in the runtime metadata: fall back to the KVC key
function detectCatalyst() {
    const info = NSProcessInfo.processInfo as NSProcessInfo & { isMacCatalystApp?: boolean };
    if (typeof info.isMacCatalystApp === 'boolean') {
        return info.isMacCatalystApp;
    }
    try {
        return !!info.valueForKey('macCatalystApp');
    } catch (error) {
        return false;
    }
}
// the build flag of the app, when it defines one
declare const __CATALYST__: boolean | undefined;
const isCatalyst = (typeof __CATALYST__ !== 'undefined' && !!__CATALYST__) || detectCatalyst();
const CATALYST_GRABBER_AREA = { width: 120, height: 24 };
const CATALYST_SCRIM_ALPHA = 0.32;

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
    static ObjCProtocols = [UIGestureRecognizerDelegate];
    _owner: WeakRef<ViewWithBottomSheet>;
    static initWithOwner(owner: ViewWithBottomSheet) {
        const target = OutsideTapTarget.new() as OutsideTapTarget;
        target._owner = new WeakRef(owner);
        return target;
    }
    outsideTapped() {
        this._owner.get()?._onOutsideTap();
    }
    gestureRecognizerShouldBeRequiredToFailByGestureRecognizer(recognizer: UIGestureRecognizer, other: UIGestureRecognizer) {
        // the taps of the content behind (undimmed sheet) must not swallow the tap that dismisses
        return other instanceof UITapGestureRecognizer;
    }
    static ObjCExposedMethods = {
        outsideTapped: { returns: interop.types.void, params: [] }
    };
}

/**
 * Catalyst card: a pan on the card moves it between its detents (like the scroll of its content, which is pinned while the card moves),
 * a tap on the grabber goes to the next detent
 */
@NativeClass
class CatalystCardTarget extends NSObject {
    static ObjCProtocols = [UIGestureRecognizerDelegate];
    _owner: WeakRef<ViewWithBottomSheet>;
    static initWithOwner(owner: ViewWithBottomSheet) {
        const target = CatalystCardTarget.new() as CatalystCardTarget;
        target._owner = new WeakRef(owner);
        return target;
    }
    cardPanned(recognizer: UIPanGestureRecognizer) {
        this._owner.get()?._onCatalystPan(recognizer);
    }
    cardScrolled(recognizer: UIPanGestureRecognizer) {
        this._owner.get()?._onCatalystScroll(recognizer);
    }
    grabberTapped() {
        this._owner.get()?._cycleCatalystDetent();
    }
    gestureRecognizerShouldBegin(recognizer: UIGestureRecognizer) {
        // the tap outside has this delegate too
        if (!(recognizer instanceof UIPanGestureRecognizer)) {
            return true;
        }
        return this._owner.get()?._shouldBeginCatalystPan(recognizer as UIPanGestureRecognizer) ?? false;
    }
    gestureRecognizerShouldReceiveTouch(recognizer: UIGestureRecognizer, touch: UITouch) {
        // the tap outside: not for the touches in the card
        return !(recognizer instanceof UITapGestureRecognizer) || !this._owner.get()?._isInCatalystCard(touch.view);
    }
    gestureRecognizerShouldRecognizeSimultaneouslyWithGestureRecognizer(recognizer: UIGestureRecognizer, other: UIGestureRecognizer) {
        // the scrolling of the content runs along, it is pinned while the card moves
        return other.view instanceof UIScrollView;
    }
    static ObjCExposedMethods = {
        cardPanned: { returns: interop.types.void, params: [interop.types.id] },
        cardScrolled: { returns: interop.types.void, params: [interop.types.id] },
        grabberTapped: { returns: interop.types.void, params: [] }
    };
}

/**
 * Catalyst card: the empty part of the window lets the touches through (the sheet is not modal)
 */
@NativeClass
class CatalystPassThroughView extends UIView {
    hitTestWithEvent(point: CGPoint, event: _UIEvent) {
        const hit = super.hitTestWithEvent(point, event);
        return hit === this ? null : hit;
    }
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
    _outsideTapShield: UIView;
    _windowStyle: { window: UIWindow; style: UIUserInterfaceStyle };
    _catalystTarget: CatalystCardTarget;
    _catalystOptions: BottomSheetOptions;
    _catalystPan: { startHeight: number; scrollView: UIScrollView; startOffsetY: number };

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
            if (isCatalyst && (options.canTouchBehind === true || options.disableDimBackground === true)) {
                controller.view = CatalystPassThroughView.alloc().initWithFrame(controller.view.frame);
            }
            if (nativeView instanceof UIView) {
                controller.view.addSubview(nativeView);
            }
            this.viewController = controller; // store the viewController so that safeArea overflow is applied correctly
        }

        this._raiseShowingBottomSheetEvent();
        this.bottomSheetController = controller;
        const catalystCard = isCatalyst;
        controller.modalPresentationStyle = catalystCard ? UIModalPresentationStyle.OverFullScreen : UIModalPresentationStyle.PageSheet;
        const window = options.userInterfaceStyle ? parentController?.view?.window : null;
        if (window) {
            // the glass of the sheet takes the appearance of the window, not the one of its controller
            this._windowStyle = { window, style: window.overrideUserInterfaceStyle };
            window.overrideUserInterfaceStyle = options.userInterfaceStyle === 'dark' ? UIUserInterfaceStyle.Dark : UIUserInterfaceStyle.Light;
        }
        if (catalystCard) {
            controller.modalTransitionStyle = UIModalTransitionStyle.CrossDissolve;
            this.configureCatalystCard(controller, options, parentController);
        } else {
            const sheet = controller.sheetPresentationController;
            if (sheet) {
                this.configureSheet(sheet, controller, options, parentController);
            }
        }
        controller.nsAnimated = true;
        parentController.presentViewControllerAnimatedCompletion(controller, true, null);
        if (catalystCard) {
            this.styleCatalystCard(controller, options);
        } else if (options.transparent === true) {
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

    private configureCatalystCard(controller: IMDLayoutViewController, options: BottomSheetOptions, parentController: UIViewController) {
        this._onDetentChange = options.onDetentChange;
        this._onWillDismiss = options.onWillDismiss;
        this._onDismissAttempt = options.onDismissAttempt;
        this._catalystOptions = options;
        let detents = options.detents;
        if (!detents?.length) {
            detents = options.peekHeight && options.skipCollapsedState !== true ? [options.peekHeight, CONTENT_DETENT] : [CONTENT_DETENT];
        }
        const card: CatalystCard = { detents, index: Math.min(options.initialDetentIndex || 0, detents.length - 1) };
        controller.catalystCard = card;
        this._catalystTarget = CatalystCardTarget.initWithOwner(this);
        const nativeView = this.nativeViewProtected as UIView;
        if (nativeView instanceof UIView) {
            const pan = UIPanGestureRecognizer.alloc().initWithTargetAction(this._catalystTarget, 'cardPanned');
            pan.delegate = this._catalystTarget;
            nativeView.addGestureRecognizer(pan);
            // the wheel and the trackpad: the card opens first, then the content scrolls. They never close it
            const scroll = UIPanGestureRecognizer.alloc().initWithTargetAction(this._catalystTarget, 'cardScrolled');
            scroll.delegate = this._catalystTarget;
            scroll.allowedTouchTypes = NSArray.arrayWithArray([]);
            scroll.allowedScrollTypesMask = UIScrollTypeMask.All;
            nativeView.addGestureRecognizer(scroll);
        }
        if (options.transparent !== true && options.grabber !== false) {
            const area = UIView.alloc().initWithFrame(CGRectMake(0, 0, CATALYST_GRABBER_AREA.width, CATALYST_GRABBER_AREA.height));
            const grabber = UIView.alloc().initWithFrame(CGRectMake((CATALYST_GRABBER_AREA.width - 36) / 2, 6, 36, 5));
            grabber.backgroundColor = UIColor.tertiaryLabelColor;
            grabber.layer.cornerRadius = 2.5;
            area.addSubview(grabber);
            area.addGestureRecognizer(UITapGestureRecognizer.alloc().initWithTargetAction(this._catalystTarget, 'grabberTapped'));
            controller.view.addSubview(area);
            card.grabberArea = area;
        }
        if (options.canTouchBehind === true || options.disableDimBackground === true) {
            if (options.canTouchBehind !== true && options.dismissOnBackgroundTap !== false) {
                // no scrim to tap: a recognizer on the content behind closes the sheet and keeps the touch from it
                const view = parentController?.view;
                if (view) {
                    this._outsideTapTarget = OutsideTapTarget.initWithOwner(this);
                    this._outsideTapRecognizer = UITapGestureRecognizer.alloc().initWithTargetAction(this._outsideTapTarget, 'outsideTapped');
                    this._outsideTapRecognizer.cancelsTouchesInView = true;
                    this._outsideTapRecognizer.delegate = this._outsideTapTarget;
                    view.addGestureRecognizer(this._outsideTapRecognizer);
                    this._outsideTapView = view;
                }
            }
        } else if (options.dismissOnBackgroundTap !== false) {
            this._outsideTapTarget = OutsideTapTarget.initWithOwner(this);
            this._outsideTapRecognizer = UITapGestureRecognizer.alloc().initWithTargetAction(this._outsideTapTarget, 'outsideTapped');
            this._outsideTapRecognizer.delegate = this._catalystTarget;
            controller.view.addGestureRecognizer(this._outsideTapRecognizer);
            this._outsideTapView = controller.view;
        }
    }

    private styleCatalystCard(controller: IMDLayoutViewController, options: BottomSheetOptions) {
        const dimmed = options.transparent !== true && options.canTouchBehind !== true && options.disableDimBackground !== true;
        controller.view.backgroundColor = dimmed ? UIColor.blackColor.colorWithAlphaComponent(CATALYST_SCRIM_ALPHA) : UIColor.clearColor;
        const nativeView = this.nativeViewProtected as UIView;
        if (options.transparent === true || !(nativeView instanceof UIView)) {
            return;
        }
        nativeView.backgroundColor = UIColor.systemBackgroundColor;
        if (options.backgroundOpacity) {
            nativeView.backgroundColor = nativeView.backgroundColor.colorWithAlphaComponent(options.backgroundOpacity);
        }
        nativeView.layer.cornerRadius = options.cornerRadius ?? 16;
        // top corners only
        nativeView.layer.maskedCorners = CACornerMask.kCALayerMinXMinYCorner | CACornerMask.kCALayerMaxXMinYCorner;
        nativeView.clipsToBounds = true;
    }

    _isInCatalystCard(view: UIView) {
        const card = (this.bottomSheetController as IMDLayoutViewController)?.catalystCard;
        const nativeView = this.nativeViewProtected as UIView;
        return !!view && ((nativeView instanceof UIView && view.isDescendantOfView(nativeView)) || (!!card?.grabberArea && view.isDescendantOfView(card.grabberArea)));
    }

    _shouldBeginCatalystPan(recognizer: UIPanGestureRecognizer) {
        const card = (this.bottomSheetController as IMDLayoutViewController)?.catalystCard;
        if (!card) {
            return false;
        }
        if (recognizer.allowedScrollTypesMask) {
            // the wheel: only to open the card
            return card.index < card.detents.length - 1;
        }
        const velocity = recognizer.velocityInView(recognizer.view);
        // the velocity is often still 0 here with a mouse: _onCatalystPan then leaves to the content what it must scroll
        return velocity.x === 0 && velocity.y === 0 ? true : Math.abs(velocity.y) > Math.abs(velocity.x);
    }

    private _findCatalystScrollView(recognizer: UIPanGestureRecognizer): UIScrollView {
        const cardView = recognizer.view;
        let view = cardView.hitTestWithEvent(recognizer.locationInView(cardView), null);
        while (view && view !== cardView) {
            if (view instanceof UIScrollView) {
                return view;
            }
            view = view.superview;
        }
        return null;
    }

    private _snapCatalystCard(card: CatalystCard, velocity: number) {
        const toDip = (value: number) => Utils.layout.toDeviceIndependentPixels(value);
        const heights = getCatalystDetentHeights(card).map(toDip);
        const lowest = Math.min(...heights);
        const projected = toDip(card.dragHeight ?? card.height) - velocity * 0.15;
        if (projected < lowest * 0.6 && this._dismissCatalystCard()) {
            return;
        }
        let index = 0;
        heights.forEach((height, heightIndex) => {
            if (Math.abs(height - projected) < Math.abs(heights[index] - projected)) {
                index = heightIndex;
            }
        });
        this._applyCatalystDetent(index, true);
    }

    /**
     * Moves the card to a visible `height` (dip), from closed to the largest detent, without any layout
     */
    private _dragCatalystCard(card: CatalystCard, height: number) {
        const toPx = (value: number) => Utils.layout.toDevicePixels(value);
        const clamped = Math.min(card.height, Math.max(0, toPx(height)));
        card.dragHeight = clamped;
        const nativeView = this.nativeViewProtected as UIView;
        if (nativeView instanceof UIView) {
            setCatalystVisibleHeight(card, nativeView, clamped);
        }
    }

    _onCatalystPan(recognizer: UIPanGestureRecognizer) {
        const card = (this.bottomSheetController as IMDLayoutViewController)?.catalystCard;
        if (!card) {
            return;
        }
        const toDip = (value: number) => Utils.layout.toDeviceIndependentPixels(value);
        if (recognizer.state === UIGestureRecognizerState.Began) {
            const scrollView = this._findCatalystScrollView(recognizer);
            this._catalystPan = { startHeight: toDip(card.dragHeight ?? this._visibleCatalystHeight(card)), scrollView, startOffsetY: scrollView ? scrollView.contentOffset.y : 0 };
            return;
        }
        const pan = this._catalystPan;
        if (!pan) {
            return;
        }
        if (recognizer.state === UIGestureRecognizerState.Changed) {
            const translation = recognizer.translationInView(recognizer.view).y;
            const scrollView = pan.scrollView;
            const maxHeight = toDip(card.height);
            const currentHeight = toDip(card.dragHeight ?? this._visibleCatalystHeight(card));
            const contentAtTop = !scrollView || scrollView.contentOffset.y <= -scrollView.adjustedContentInset.top + 1;
            if ((translation < 0 && currentHeight >= maxHeight - 0.5) || (translation > 0 && !contentAtTop)) {
                // the content scrolls: the card closes only once the content is back at its top
                pan.startHeight = currentHeight;
                recognizer.setTranslationInView(CGPointMake(0, 0), recognizer.view);
                return;
            }
            this._dragCatalystCard(card, pan.startHeight - translation);
            if (scrollView && toDip(card.dragHeight) < maxHeight) {
                scrollView.contentOffset = CGPointMake(scrollView.contentOffset.x, pan.startOffsetY);
            }
            return;
        }
        this._catalystPan = null;
        this._snapCatalystCard(card, recognizer.velocityInView(recognizer.view).y);
    }

    _onCatalystScroll(recognizer: UIPanGestureRecognizer) {
        const card = (this.bottomSheetController as IMDLayoutViewController)?.catalystCard;
        if (!card) {
            return;
        }
        const toDip = (value: number) => Utils.layout.toDeviceIndependentPixels(value);
        if (recognizer.state === UIGestureRecognizerState.Began) {
            this._catalystPan = { startHeight: 0, scrollView: this._findCatalystScrollView(recognizer), startOffsetY: 0 };
            this._catalystPan.startOffsetY = this._catalystPan.scrollView ? this._catalystPan.scrollView.contentOffset.y : 0;
            return;
        }
        const pan = this._catalystPan;
        if (!pan) {
            return;
        }
        if (recognizer.state === UIGestureRecognizerState.Changed) {
            const delta = recognizer.translationInView(recognizer.view).y;
            recognizer.setTranslationInView(CGPointMake(0, 0), recognizer.view);
            // content moving up = scrolling to its end: the card opens first
            if (delta < 0 && toDip(card.dragHeight ?? this._visibleCatalystHeight(card)) < toDip(card.height) - 0.5) {
                this._dragCatalystCard(card, toDip(card.dragHeight ?? this._visibleCatalystHeight(card)) - delta);
                if (pan.scrollView) {
                    pan.scrollView.contentOffset = CGPointMake(pan.scrollView.contentOffset.x, pan.startOffsetY);
                }
            }
            return;
        }
        this._catalystPan = null;
        if (card.dragHeight !== undefined) {
            this._snapCatalystCard(card, 0);
        }
    }

    private _visibleCatalystHeight(card: CatalystCard) {
        return getCatalystDetentHeights(card)[Math.min(card.index, card.detents.length - 1)] || card.height;
    }

    /**
     * @returns false when the card cannot be dismissed (it then goes back to a detent)
     */
    private _dismissCatalystCard() {
        if (this._catalystOptions?.dismissOnDraggingDownSheet === false) {
            return false;
        }
        if (this._onWillDismiss?.() === false) {
            this._onDismissAttempt?.();
            return false;
        }
        this.closeBottomSheet();
        return true;
    }

    private _applyCatalystDetent(index: number, animated: boolean) {
        const controller = this.bottomSheetController as IMDLayoutViewController;
        const card = controller?.catalystCard;
        if (!card) {
            return;
        }
        const changed = index !== card.index;
        card.index = index;
        card.dragHeight = undefined;
        const nativeView = this.nativeViewProtected as UIView;
        const apply = () => {
            if (nativeView instanceof UIView) {
                setCatalystVisibleHeight(card, nativeView, this._visibleCatalystHeight(card));
            }
        };
        if (animated) {
            // a layout during the animation must not set the final position before it
            card.animating = true;
            UIView.animateWithDurationDelayOptionsAnimationsCompletion(
                0.25,
                0,
                UIViewAnimationOptions.CurveEaseOut | UIViewAnimationOptions.BeginFromCurrentState,
                apply,
                () => {
                    card.animating = false;
                }
            );
        } else {
            apply();
        }
        if (changed) {
            this._onChangeStateBottomSheetCallback?.(index === 0 ? StateBottomSheet.COLLAPSED : StateBottomSheet.EXPANDED);
            this._onDetentChange?.(index);
        }
    }

    _cycleCatalystDetent() {
        const card = (this.bottomSheetController as IMDLayoutViewController)?.catalystCard;
        if (card && card.detents.length > 1) {
            this.setBottomSheetDetentIndex((card.index + 1) % card.detents.length);
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
                // tap outside dismisses: a transparent view over the content behind takes the touch, no gesture of the content can win over it
                const view = parentController?.view;
                if (view) {
                    const shield = UIView.alloc().initWithFrame(view.bounds);
                    shield.autoresizingMask = UIViewAutoresizing.FlexibleWidth | UIViewAutoresizing.FlexibleHeight;
                    this._outsideTapTarget = OutsideTapTarget.initWithOwner(this);
                    this._outsideTapRecognizer = UITapGestureRecognizer.alloc().initWithTargetAction(this._outsideTapTarget, 'outsideTapped');
                    shield.addGestureRecognizer(this._outsideTapRecognizer);
                    view.addSubview(shield);
                    this._outsideTapView = shield;
                    this._outsideTapShield = shield;
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
        const controller = this.bottomSheetController as IMDLayoutViewController;
        const card = controller?.catalystCard;
        if (card) {
            if (index >= 0 && index < card.detents.length) {
                this._applyCatalystDetent(index, animated);
            }
            return;
        }
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
        const card = (this.bottomSheetController as IMDLayoutViewController)?.catalystCard;
        if (card) {
            return card.index;
        }
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
            (this.bottomSheetController as IMDLayoutViewController).catalystCard = null;
            this.bottomSheetController = null;
        }
        this.bottomSheetDelegate = null;
        this._catalystTarget = null;
        this._catalystPan = null;
        this._catalystOptions = null;
        if (this._outsideTapRecognizer) {
            this._outsideTapView?.removeGestureRecognizer(this._outsideTapRecognizer);
            this._outsideTapShield?.removeFromSuperview();
            this._outsideTapShield = null;
            this._outsideTapRecognizer = null;
            this._outsideTapTarget = null;
            this._outsideTapView = null;
        }
        if (this._windowStyle) {
            this._windowStyle.window.overrideUserInterfaceStyle = this._windowStyle.style;
            this._windowStyle = null;
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
        const controller = this.bottomSheetController as IMDLayoutViewController;
        const nativeView = this.nativeViewProtected as UIView;
        const card = controller?.catalystCard;
        if (card && animated && nativeView instanceof UIView) {
            // slide out, the scrim fades along
            const offset = CGAffineTransformMakeTranslation(0, Utils.layout.toDeviceIndependentPixels(card.height + 40));
            // no layout may move the card back before it slides out
            card.animating = true;
            UIView.animateWithDurationDelayOptionsAnimationsCompletion(
                0.25,
                0,
                UIViewAnimationOptions.CurveEaseIn | UIViewAnimationOptions.BeginFromCurrentState,
                () => {
                    nativeView.transform = offset;
                    card.grabberArea && (card.grabberArea.transform = offset);
                    controller.view.backgroundColor = UIColor.clearColor;
                },
                () => parentController.dismissViewControllerAnimatedCompletion(false, whenClosedCallback)
            );
            return;
        }
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
