import { Application, IOSHelper, Screen, Trace, Utils, View } from '@nativescript/core';
import type { BottomSheetDetent } from './index-common';

const majorVersion = Utils.ios.MajorVersion;

/**
 * Finds the view controller from which a new sheet/dialog can be presented:
 * the top most presented controller, ignoring alert controllers.
 */
export function getPresentingController(parent: View, rootView: View = Application.getRootView()): UIViewController {
    if (rootView.parent) {
        rootView = rootView.parent as any;
    }
    const currentView = parent.modal || parent;
    let parentController = currentView.viewController;
    if (!parentController.presentedViewController && rootView.viewController.presentedViewController) {
        parentController = rootView.viewController.presentedViewController;
    }
    while (parentController.presentedViewController) {
        while (
            parentController.presentedViewController instanceof UIAlertController ||
            (parentController.presentedViewController['isAlertController'] && parentController.presentedViewController.presentedViewController)
        ) {
            parentController = parentController.presentedViewController;
        }
        if (parentController.presentedViewController instanceof UIAlertController || parentController.presentedViewController['isAlertController']) {
            break;
        } else {
            parentController = parentController.presentedViewController;
        }
    }
    return parentController;
}

function initLayoutGuide(controller: UIViewController) {
    const rootView = controller.view;
    const layoutGuide = UILayoutGuide.alloc().init();
    rootView.addLayoutGuide(layoutGuide);
    NSLayoutConstraint.activateConstraints([
        layoutGuide.topAnchor.constraintEqualToAnchor(controller.topLayoutGuide.bottomAnchor),
        layoutGuide.bottomAnchor.constraintEqualToAnchor(controller.bottomLayoutGuide.topAnchor),
        layoutGuide.leadingAnchor.constraintEqualToAnchor(rootView.leadingAnchor),
        layoutGuide.trailingAnchor.constraintEqualToAnchor(rootView.trailingAnchor)
    ] as any);

    return layoutGuide;
}
/**
 * The size of the window the sheet is presented in: smaller than the screen on Mac Catalyst and iPad windows
 */
function getWindowSizePixels(controller: UIViewController) {
    const window = controller.presentingViewController?.view?.window ?? controller.view?.window;
    if (!window) {
        return { width: Screen.mainScreen.widthPixels, height: Screen.mainScreen.heightPixels };
    }
    return { width: Utils.layout.toDevicePixels(window.bounds.size.width), height: Utils.layout.toDevicePixels(window.bounds.size.height) };
}
/**
 * Mac Catalyst: UIKit shows a sheet as a window modal one (no detents, no tap outside to close).
 * The sheet is then a card at the bottom of the window, `detents` are its heights.
 */
export interface CatalystCard {
    detents: BottomSheetDetent[];
    index: number;
    grabberArea?: UIView;
    /** px, set while the card is dragged: replaces the height of the detent */
    dragHeight?: number;
    /** px, known after the layout */
    maxHeight?: number;
    contentHeight?: number;
    /** px, the current height of the card */
    height?: number;
    /** the slide in was started */
    entered?: boolean;
    /** a detent animation runs */
    animating?: boolean;
}

/** px */
export function getCatalystDetentHeights(card: CatalystCard) {
    return card.detents.map((detent) => resolveCatalystDetentHeight(detent, card.maxHeight, card.contentHeight));
}

function resolveCatalystDetentHeight(detent: BottomSheetDetent, maxHeight: number, contentHeight: number) {
    let height: number;
    if (detent === 'large') {
        height = maxHeight;
    } else if (detent === 'medium') {
        height = maxHeight / 2;
    } else if (detent === 'content') {
        height = contentHeight;
    } else if (typeof detent === 'number') {
        height = Utils.layout.toDevicePixels(detent);
    } else {
        height = detent.fraction * maxHeight;
    }
    return Math.round(Math.min(height, maxHeight));
}

/**
 * The card is laid out at the height of its largest detent once: the other detents move it with a transform, no layout of the content
 * @param visibleHeight px
 */
export function setCatalystVisibleHeight(card: CatalystCard, nativeView: UIView, visibleHeight: number) {
    const offset = CGAffineTransformMakeTranslation(0, Utils.layout.toDeviceIndependentPixels(Math.max(0, card.height - visibleHeight)));
    nativeView.transform = offset;
    if (card.grabberArea) {
        card.grabberArea.transform = offset;
    }
}

function getCatalystVisibleHeight(card: CatalystCard) {
    return card.dragHeight ?? (getCatalystDetentHeights(card)[Math.min(card.index, card.detents.length - 1)] || card.height);
}

function layoutCatalystCard(controller: IMDLayoutViewController, owner: View) {
    const card = controller.catalystCard;
    const { size } = controller.view.bounds;
    const windowWidth = Utils.layout.toDevicePixels(size.width);
    const windowHeight = Utils.layout.toDevicePixels(size.height);
    const maxHeight = windowHeight - Utils.layout.toDevicePixels(controller.view.safeAreaInsets.top);
    const width = windowWidth;
    View.measureChild(null, owner, Utils.layout.makeMeasureSpec(width, Utils.layout.EXACTLY), Utils.layout.makeMeasureSpec(maxHeight, Utils.layout.AT_MOST));
    const contentHeight = owner.getMeasuredHeight();
    card.maxHeight = maxHeight;
    card.contentHeight = contentHeight;
    const height = Math.max(...getCatalystDetentHeights(card)) || contentHeight;
    if (height !== contentHeight) {
        View.measureChild(null, owner, Utils.layout.makeMeasureSpec(width, Utils.layout.EXACTLY), Utils.layout.makeMeasureSpec(height, Utils.layout.EXACTLY));
    }
    card.height = height;
    const top = windowHeight - height;
    View.layoutChild(null, owner, 0, top, width, top + height);
    const nativeView = owner.nativeViewProtected as UIView;
    if (card.grabberArea) {
        const area = card.grabberArea;
        area.center = CGPointMake(Utils.layout.toDeviceIndependentPixels(width) / 2, Utils.layout.toDeviceIndependentPixels(top) + area.bounds.size.height / 2);
    }
    if (!(nativeView instanceof UIView)) {
        return;
    }
    if (!card.entered) {
        // slide in from the bottom of the window
        card.entered = true;
        setCatalystVisibleHeight(card, nativeView, -40);
        UIView.animateWithDurationDelayOptionsAnimationsCompletion(0.3, 0, UIViewAnimationOptions.CurveEaseOut, () => setCatalystVisibleHeight(card, nativeView, getCatalystVisibleHeight(card)), null);
    } else if (!card.animating) {
        setCatalystVisibleHeight(card, nativeView, getCatalystVisibleHeight(card));
    }
}

function layoutView(controller: IMDLayoutViewController, owner: View): void {
    let layoutGuide = controller.view.safeAreaLayoutGuide;
    if (!layoutGuide) {
        Trace.write(`safeAreaLayoutGuide during layout of ${owner}. Creating fallback constraints, but layout might be wrong.`, Trace.categories.Layout, Trace.messageType.error);

        layoutGuide = initLayoutGuide(controller);
    }
    const safeArea = layoutGuide.layoutFrame;
    let position = IOSHelper.getPositionFromFrame(safeArea);
    const safeAreaSize = safeArea.size;

    const hasChildViewControllers = controller.childViewControllers.count > 0;
    if (hasChildViewControllers) {
        const fullscreen = controller.view.frame;
        position = IOSHelper.getPositionFromFrame(fullscreen);
    }

    const safeAreaWidth = Utils.layout.round(Utils.layout.toDevicePixels(safeAreaSize.width));
    const safeAreaHeight = Utils.layout.round(Utils.layout.toDevicePixels(safeAreaSize.height));

    const widthSpec = Utils.layout.makeMeasureSpec(safeAreaWidth, Utils.layout.EXACTLY);
    const windowSize = getWindowSizePixels(controller);
    const heightSpec = Utils.layout.makeMeasureSpec(windowSize.height, Utils.layout.AT_MOST);

    // reset _cachedFrame or it will wrongly move the view on subsequent layouts
    // (owner as any)._cachedFrame = null;
    View.measureChild(null, owner, widthSpec, heightSpec);
    const marginTop = owner.effectiveMarginTop;
    const marginBottom = owner.effectiveMarginBottom;
    const marginLeft = owner.effectiveMarginLeft + position.left;
    const marginRight = owner.effectiveMarginRight;
    const top = marginTop + position.top;
    const width = windowSize.width;
    const height = owner.getMeasuredHeight();
    View.layoutChild(null, owner, marginLeft, top, width - marginLeft - marginRight, position.top + height + marginBottom);

    const effectiveWidth = width;
    let effectiveHeight = height + top + marginBottom;
    if (controller.ignoreTopSafeArea || controller.ignoreBottomSafeArea) {
        const frame = CGRectMake(
            Utils.layout.toDeviceIndependentPixels(marginLeft),
            Utils.layout.toDeviceIndependentPixels(top),
            Utils.layout.toDeviceIndependentPixels(width),
            Utils.layout.toDeviceIndependentPixels(height)
        );
        const availableSpace = getAvailableSpaceFromParent(owner, frame);

        if (!availableSpace.fullscreen) {
            // can happen if we get there after the bottomsheet was removed...
            return;
        }

        const startPos = IOSHelper.getPositionFromFrame(frame);
        const fullscreenPosition = IOSHelper.getPositionFromFrame(availableSpace.fullscreen);
        const safeAreaPosition = IOSHelper.getPositionFromFrame(availableSpace.safeArea);

        const adjustedPosition = startPos;

        const orientation = UIDevice.currentDevice.orientation;
        const isLandscape = Application.orientation() === 'landscape';

        // there are still some issues in landscape Right but they seem to come from N

        owner.iosIgnoreSafeArea = true;
        if (controller.ignoreTopSafeArea) {
            const key = 'top';
            const oppositeKey = 'bottom';
            // if (orientation === UIDeviceOrientation.LandscapeLeft) {
            //     key = 'left';
            //     oppositeKey = 'right';
            // } else if (orientation === UIDeviceOrientation.LandscapeRight) {
            //     key = 'right';
            //     oppositeKey = 'left';
            // } else if (orientation === UIDeviceOrientation.PortraitUpsideDown) {
            //     key = 'bottom';
            //     oppositeKey = 'top';
            // }
            const delta = safeAreaPosition[key] - fullscreenPosition[key];
            effectiveHeight -= delta;
            adjustedPosition[oppositeKey] -= delta;
            adjustedPosition[key] -= delta;
        }
        if (controller.ignoreBottomSafeArea) {
            const key = 'bottom';
            // if (orientation === UIDeviceOrientation.LandscapeLeft) {
            //     key = 'right';
            // } else if (orientation === UIDeviceOrientation.LandscapeRight) {
            //     key = 'left';
            // } else if (orientation === UIDeviceOrientation.PortraitUpsideDown) {
            //     key = 'top';
            // }
            const delta = fullscreenPosition[key] - safeAreaPosition[key];
            effectiveHeight -= delta;
            adjustedPosition[key] += delta; // extend frame into bottom safe area so background covers home indicator
        }
        if (orientation === UIDeviceOrientation.LandscapeRight || orientation === UIDeviceOrientation.LandscapeLeft) {
            const key = 'left';
            const oppositeKey = 'right';
            const delta = fullscreenPosition[key] - safeAreaPosition[key];
            adjustedPosition[oppositeKey] += Utils.layout.toDevicePixels(delta);
            // adjustedPosition[key] += (delta);
            // adjustedPosition[oppositeKey] += Utils.layout.toDevicePixels(delta);
            // adjustedPosition[key] += Utils.layout.toDevicePixels(delta);
        }
        if (owner.nativeViewProtected) {
            owner.nativeViewProtected.frame = CGRectMake(
                Utils.layout.toDeviceIndependentPixels(adjustedPosition.left),
                Utils.layout.toDeviceIndependentPixels(adjustedPosition.top),
                Utils.layout.toDeviceIndependentPixels(adjustedPosition.right),
                Utils.layout.toDeviceIndependentPixels(adjustedPosition.bottom)
            );
        }
    }
    controller.preferredContentSize = CGSizeMake(Utils.layout.toDeviceIndependentPixels(effectiveWidth), Utils.layout.toDeviceIndependentPixels(effectiveHeight));

    if (owner.parent) {
        owner.parent._layoutParent();
    }
}
function getAvailableSpaceFromParent(view: View, frame: CGRect): { safeArea: CGRect; fullscreen: CGRect } {
    if (!view) {
        return null;
    }

    let scrollView = null;
    let viewControllerView = null;

    if (view.viewController) {
        viewControllerView = view.viewController.view;
    } else {
        let parent = view.parent as View;
        while (parent && !parent.viewController && !(parent.nativeViewProtected instanceof UIScrollView)) {
            parent = parent.parent as View;
        }
        if (parent) {
            if (parent.nativeViewProtected instanceof UIScrollView) {
                scrollView = parent.nativeViewProtected;
            } else if (parent.viewController) {
                viewControllerView = parent.viewController.view;
            }
        }
    }

    let fullscreen = null;
    let safeArea = null;

    if (viewControllerView) {
        safeArea = viewControllerView.safeAreaLayoutGuide.layoutFrame;
        fullscreen = viewControllerView.frame;
    } else if (scrollView) {
        const insets = scrollView.safeAreaInsets;
        safeArea = CGRectMake(insets.left, insets.top, scrollView.contentSize.width - insets.left - insets.right, scrollView.contentSize.height - insets.top - insets.bottom);
        fullscreen = CGRectMake(0, 0, scrollView.contentSize.width, scrollView.contentSize.height);
    }

    // const locationInWindow = view.getLocationInWindow();
    // let inWindowLeft = locationInWindow.x;
    // let inWindowTop = locationInWindow.y;

    // if (scrollView) {
    //     inWindowLeft += scrollView.contentOffset.x;
    //     inWindowTop += scrollView.contentOffset.y;
    // }

    // const inWindow = CGRectMake(inWindowLeft, inWindowTop, frame.size.width, frame.size.height);

    return { safeArea, fullscreen };
}

export declare class IMDLayoutViewController extends UIViewController {
    _trackingScrollView: UIScrollView;
    static new(): IMDLayoutViewController;
    static alloc(): IMDLayoutViewController;
    owner: WeakRef<View>;
    nsAnimated: boolean;
    ignoreBottomSafeArea: boolean;
    ignoreTopSafeArea: boolean;
    onLayoutCallback?: () => void;
    catalystCard?: CatalystCard;
}

@NativeClass
export class MDLayoutViewController extends UIViewController {
    owner: WeakRef<View>;
    ignoreBottomSafeArea: boolean;
    ignoreTopSafeArea: boolean;
    nsAnimated: boolean;
    _trackingScrollView: UIScrollView;
    catalystCard?: CatalystCard;
    /**
     * called after each layout pass, once preferredContentSize was updated
     */
    onLayoutCallback?: () => void;
    public static initWithOwner(owner: View) {
        const delegate = MDLayoutViewController.new() as MDLayoutViewController;
        delegate.owner = new WeakRef(owner);

        return delegate;
    }

    viewDidLoad(): void {
        super.viewDidLoad();
        const owner = this.owner?.get();
        if (!owner) {
            return;
        }
        if (!owner.isLoaded) {
            owner.callLoaded();
        }
        // Unify translucent and opaque bars layout
        this.edgesForExtendedLayout = UIRectEdge.All;
        this.extendedLayoutIncludesOpaqueBars = true;
    }

    viewWillLayoutSubviews(): void {
        super.viewWillLayoutSubviews();
        const owner = this.owner?.get();
        if (owner) {
            owner.iosOverflowSafeArea = true;
            IOSHelper.updateConstraints(this, owner);
        }
    }

    viewDidLayoutSubviews(): void {
        super.viewDidLayoutSubviews();
        const owner = this.owner?.get();
        if (owner) {
            if (this.catalystCard) {
                layoutCatalystCard(this, owner);
            } else {
                layoutView(this, owner);
            }
            this.onLayoutCallback?.();
        }
        // safeAreaInsetsDidChange inflates contentInset.bottom on this layout pass, floating
        // the sheet above the home indicator; reset it so the sheet stays at preferredSheetHeight
        const trackingScrollView = this._trackingScrollView;
        if (trackingScrollView) {
            const inset = trackingScrollView.contentInset;
            if (inset.bottom > 0) {
                //@ts-expect-error missing typing
                trackingScrollView.contentInset = UIEdgeInsetsMake(inset.top, inset.left, 0, inset.right);
            }
        }
    }

    viewWillAppear(animated: boolean): void {
        super.viewWillAppear(animated);
        const owner = this.owner?.get();
        if (!owner) {
            return;
        }

        IOSHelper.updateAutoAdjustScrollInsets(this, owner);

        // if (!owner.parent) {
        //     owner.callLoaded();
        // }
    }

    viewDidDisappear(animated: boolean): void {
        super.viewDidDisappear(animated);
        // let s not call callUnloaded here in case
        // another modal / sheet is shown on top
        // will be called on dismiss
    }

    // Mind implementation for other controllers
    traitCollectionDidChange(previousTraitCollection: UITraitCollection): void {
        super.traitCollectionDidChange(previousTraitCollection);

        if (majorVersion >= 13) {
            const owner = this.owner?.get();
            if (
                owner &&
                this.traitCollection.hasDifferentColorAppearanceComparedToTraitCollection &&
                this.traitCollection.hasDifferentColorAppearanceComparedToTraitCollection(previousTraitCollection)
            ) {
                owner.notify({ eventName: 'traitCollectionColorAppearanceChanged', object: owner });
            }
        }
    }
}

