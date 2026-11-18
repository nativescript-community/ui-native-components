import { TextField } from '@nativescript-community/ui-textfield';
import {
    ActionOptions,
    Application,
    Builder,
    CSSUtils,
    ConfirmOptions,
    DialogOptions,
    DialogStrings,
    LoginResult,
    PromptResult,
    Screen,
    StackLayout,
    Trace,
    Utils,
    View,
    capitalizationType,
    fromObject,
    getCurrentPage,
    inputType
} from '@nativescript/core';
import { LoginOptions, MDCAlertControlerOptions, PromptOptions } from './index';
import { isDialogOptions, showingDialogs } from './index-common';

export { capitalizationType, inputType };

/**
 * iOS: native UIAlertController (Liquid Glass on iOS 26+ for free).
 * Supported: title, message, buttons, prompt, login, action (action sheet), custom `view`/`messageView`/`stackViewHolder`,
 * `closeCallback`, `shouldResolveOnAction`, `AlertDialog.hide()`.
 * No-op: all the styling options (colors, fonts, cornerRadius, elevation, scrimColor, titleIcon...), `dismissOnBackgroundTap`
 * (UIKit alerts are not dismissed by a tap outside).
 *
 * UIAlertController has no public API to show a custom view: the view is hosted in a content view controller
 * set through the `contentViewController` key (widely used but not documented by Apple).
 * If UIKit refuses it the custom view is not shown and a warning is logged.
 */

const ALERT_WIDTH = 270; // width of a regular UIAlertController

@NativeClass
class UIViewAutoSize extends UIView {
    _view: View;
    contentHeightForWidth(width: number) {
        const view = this._view;
        if (!view) {
            return 0;
        }
        const widthSpec = Utils.layout.makeMeasureSpec(Utils.layout.toDevicePixels(width), Utils.layout.EXACTLY);
        const heightSpec = Utils.layout.makeMeasureSpec(Screen.mainScreen.heightPixels, Utils.layout.AT_MOST);
        const measuredSize = View.measureChild(null, view, widthSpec, heightSpec);
        return Utils.layout.toDeviceIndependentPixels(measuredSize.measuredHeight);
    }
    layoutSubviews() {
        const view = this._view;
        if (!view) {
            return;
        }
        const size = this.frame.size;
        const width = Utils.layout.toDevicePixels(size.width);
        const height = Utils.layout.toDevicePixels(size.height);
        // a layout needs a measure first: the content may have been invalidated since the last one
        View.measureChild(null, view, Utils.layout.makeMeasureSpec(width, Utils.layout.EXACTLY), Utils.layout.makeMeasureSpec(height, Utils.layout.EXACTLY));
        View.layoutChild(null, view, 0, 0, width, height);
    }
}

@NativeClass
class ContentViewController extends UIViewController {
    _container: UIViewAutoSize;
    static initWithView(view: View) {
        const controller = ContentViewController.new() as ContentViewController;
        view._setupAsRootView({});
        view.parent = Application.getRootView();
        view._isAddedToNativeVisualTree = true;
        const container = UIViewAutoSize.new() as UIViewAutoSize;
        container._view = view;
        container.addSubview(view.nativeViewProtected);
        (view.nativeViewProtected as UIView).autoresizingMask = UIViewAutoresizing.FlexibleWidth | UIViewAutoresizing.FlexibleHeight;
        controller._container = container;
        controller.view = container;
        // viewDidLoad is not called when the view is set manually: load the NativeScript view now
        if (!view.isLoaded) {
            view.callLoaded();
        }
        controller.preferredContentSize = CGSizeMake(ALERT_WIDTH, container.contentHeightForWidth(ALERT_WIDTH));
        return controller;
    }
    viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews();
        this.updatePreferredContentSize();
    }
    // iOS 27 (not checked on older versions): a full screen modal presented over the alert and then closed makes UIKit
    // show the alert again at the origin of its container, and nothing lays it out again: present it again.
    // It is hidden meanwhile, it would flash at the top left while the modal is closing.
    viewWillAppear(animated: boolean) {
        super.viewWillAppear(animated);
        const alertController = this.parentViewController as AlertController;
        if (alertController?._appeared && !alertController._representing) {
            alertController.view.alpha = 0;
        }
    }
    viewDidAppear(animated: boolean) {
        super.viewDidAppear(animated);
        const alertController = this.parentViewController as AlertController;
        const presenter = alertController?.presentingViewController;
        if (!presenter || alertController._representing) {
            return;
        }
        alertController._appeared = true;
        const frame = alertController.view.frame;
        if (frame.origin.x !== 0 || frame.origin.y !== 0 || frame.size.width >= presenter.view.bounds.size.width) {
            alertController.view.alpha = 1;
            return;
        }
        alertController._representing = true;
        presenter.dismissViewControllerAnimatedCompletion(false, () =>
            presenter.presentViewControllerAnimatedCompletion(alertController, false, () => {
                alertController._representing = false;
                alertController.view.alpha = 1;
                // the content was laid out for the previous position (safe area insets)
                this._container?._view?.requestLayout();
                this._container?.setNeedsLayout();
                // a dismiss requested meanwhile (hide()) was held back: presenting again right after it would show a closed alert
                const afterRepresent = alertController._afterRepresent;
                alertController._afterRepresent = null;
                afterRepresent?.();
            })
        );
    }
    updatePreferredContentSize() {
        const container = this._container;
        if (container) {
            const height = container.contentHeightForWidth(this.view.bounds.size.width || ALERT_WIDTH);
            if (height !== this.preferredContentSize.height) {
                this.preferredContentSize = CGSizeMake(this.preferredContentSize.width, height);
            }
        }
    }
}

interface AlertController extends UIAlertController {
    autoFocusTextField?: TextField;
    clear?: Function;
    _resolveFunction?: Function;
    _contentController?: ContentViewController;
    _onClear?: Function;
    _appeared?: boolean;
    _representing?: boolean;
    _afterRepresent?: Function;
}

function dismissAlertController(alertController: AlertController, animated: boolean, completion: () => void) {
    if (alertController._representing) {
        alertController._afterRepresent = () => alertController.dismissViewControllerAnimatedCompletion(animated, completion);
        return;
    }
    alertController.dismissViewControllerAnimatedCompletion(animated, completion);
}

function createAlertController(options: DialogOptions & MDCAlertControlerOptions, resolve?: Function, style = UIAlertControllerStyle.Alert) {
    const alertController = UIAlertController.alertControllerWithTitleMessagePreferredStyle(options.title || null, options.message || null, style) as AlertController;
    alertController['isAlertController'] = true;

    const clear = (alertController.clear = function clear() {
        const onClear = alertController._onClear;
        alertController._onClear = null;
        onClear?.();
        const index = showingDialogs.indexOf(alertController);
        if (index !== -1) {
            showingDialogs.splice(index, 1);
        }
        alertController._resolveFunction = null;
        const contentController = alertController._contentController;
        if (contentController && contentController._container) {
            const view = contentController._container._view;
            if (view) {
                view.callUnloaded();
                view._tearDownUI(true);
                view.parent = null;
                view._isAddedToNativeVisualTree = false;
            }
            contentController._container._view = null;
            alertController._contentController = null;
        }
    });

    if (options.view) {
        const view =
            options.view instanceof View
                ? options.view
                : Builder.createViewFromEntry({
                      moduleName: options.view as string
                  });
        if (view.parent) {
            view.parent._removeView(view);
        }
        view.cssClasses.add(CSSUtils.MODAL_ROOT_VIEW_CSS_CLASS);
        const modalRootViewCssClasses = CSSUtils.getSystemCssClasses();
        modalRootViewCssClasses.forEach((c) => view.cssClasses.add(c));

        alertController._resolveFunction = resolve;
        const context = options.context || {};
        context.closeCallback = function (originalArgs) {
            if (alertController._resolveFunction) {
                alertController._resolveFunction(originalArgs);
                alertController._resolveFunction = null;
            }
            dismissAlertController(alertController, true, () => {
                clear();
            });
        };
        view.bindingContext = fromObject(context);
        const contentController = ContentViewController.initWithView(view);
        try {
            // the only way to host a custom view in a UIAlertController
            alertController.setValueForKey(contentController, 'contentViewController');
            alertController._contentController = contentController;
            view.viewController = alertController; // needed to prevent a crash in layoutChild
        } catch (err) {
            Trace.write(`custom view could not be set on the UIAlertController: ${err}`, Trace.categories.Error, Trace.messageType.error);
            clear();
        }
    }
    return alertController;
}

function addButtonsToAlertController(alertController: AlertController, options: ConfirmOptions & MDCAlertControlerOptions, callback?: Function, validationArgs?: (r) => any): void {
    if (!options) {
        return;
    }
    let onDoneCalled = false;
    function raiseCallback(callback, result) {
        if (options && options.shouldResolveOnAction && !options.shouldResolveOnAction(validationArgs ? validationArgs(result) : result)) {
            // UIAlertController always dismisses on an action: show it again
            setTimeout(() => showUIAlertController(alertController, options));
            return;
        }
        if (onDoneCalled) {
            return;
        }
        onDoneCalled = true;
        if (Utils.isFunction(callback)) {
            callback(result);
        }
        alertController.clear();
    }

    function addButton(title: string, style: UIAlertActionStyle, result) {
        alertController.addAction(
            UIAlertAction.actionWithTitleStyleHandler(title, style, () => {
                raiseCallback(callback, result);
            })
        );
    }

    if (Utils.isString(options.neutralButtonText)) {
        addButton(options.neutralButtonText, UIAlertActionStyle.Default, undefined);
    }
    if (Utils.isString(options.okButtonText)) {
        addButton(options.okButtonText, UIAlertActionStyle.Default, true);
    }
    if (Utils.isString(options.cancelButtonText)) {
        // the cancel style is always displayed in the "cancel" position by UIKit
        addButton(options.cancelButtonText, UIAlertActionStyle.Cancel, false);
    }
}

export function alert(arg: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
        try {
            const defaultOptions = {
                okButtonText: DialogStrings.OK
            };
            const options = !isDialogOptions(arg) ? Object.assign(defaultOptions, { message: arg + '' }) : Object.assign(defaultOptions, arg);
            const alertController = createAlertController(options, resolve);

            addButtonsToAlertController(alertController, options, (result) => {
                resolve(result);
            });

            showUIAlertController(alertController, options);
        } catch (ex) {
            reject(ex);
        }
    });
}

export class AlertDialog {
    alertController: AlertController;
    presentingController: UIViewController;
    constructor(private options: any) {}

    show(onClosed?) {
        if (this.waitingFor) {
            // hide() was waiting for an alert on top: the dialog stays
            this.waitingFor._onClear = null;
            this.waitingFor = null;
            this.hiding = false;
        }
        if (!this.alertController) {
            this.alertController = createAlertController(this.options, onClosed);
            this.presentingController = showUIAlertController(this.alertController, this.options);
        }
    }
    hiding = false;
    waitingFor: AlertController;
    async hide(result?) {
        const alertController = this.alertController;
        if (!this.presentingController || this.hiding) {
            return;
        }
        this.hiding = true;
        const dismiss = () =>
            new Promise<void>((resolve) => {
                dismissAlertController(alertController, true, () => {
                    if (alertController._resolveFunction) {
                        alertController._resolveFunction(result);
                        alertController._resolveFunction = null;
                    }
                    resolve();
                    alertController.clear();
                    this.presentingController = null;
                    this.alertController = null;
                    this.waitingFor = null;
                    this.hiding = false;
                });
            });
        const onTop = alertController.presentedViewController;
        if (onTop && !onTop.beingDismissed && onTop['isAlertController']) {
            // dismissing a controller dismisses what is presented over it: wait for the alert on top to be closed
            this.waitingFor = onTop as AlertController;
            this.waitingFor._onClear = dismiss;
            return;
        }
        return dismiss();
    }
}

export function confirm(arg: any): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        try {
            const defaultOptions = {
                okButtonText: DialogStrings.OK,
                cancelButtonText: DialogStrings.CANCEL
            };
            const options = !isDialogOptions(arg)
                ? Object.assign(defaultOptions, {
                      message: arg + ''
                  })
                : Object.assign(defaultOptions, arg);
            const alertController = createAlertController(options, resolve);

            addButtonsToAlertController(alertController, options, (r) => {
                resolve(r);
            });

            showUIAlertController(alertController, options);
        } catch (ex) {
            reject(ex);
        }
    });
}

function createTextField() {
    const textField = new TextField();
    // native text fields inside an alert get the system rounded border
    textField.once('loaded', () => {
        const nativeView = textField.nativeViewProtected as UITextField;
        if (nativeView) {
            nativeView.borderStyle = UITextBorderStyle.RoundedRect;
        }
    });
    return textField;
}

export function prompt(...args): Promise<PromptResult> {
    let options: PromptOptions & MDCAlertControlerOptions;

    const defaultOptions = {
        okButtonText: DialogStrings.OK,
        cancelButtonText: DialogStrings.CANCEL,
        inputType: inputType.text
    };

    if (args.length === 1) {
        if (Utils.isString(args[0])) {
            options = defaultOptions;
            options.message = args[0];
        } else {
            options = Object.assign(defaultOptions, args[0]);
        }
    } else if (args.length === 2) {
        if (Utils.isString(args[0]) && Utils.isString(args[1])) {
            options = defaultOptions;
            options.message = args[0];
            options.defaultText = args[1];
        }
    }

    return new Promise<PromptResult>((resolve, reject) => {
        try {
            const stackLayout = options.stackViewHolder ?? new StackLayout();
            if (options.messageView instanceof View) {
                stackLayout.addChild(options.messageView);
            }
            const textField = createTextField();
            textField.hint = options.hintText;
            if (options.textFieldProperties) {
                Object.assign(textField, options.textFieldProperties);
            }
            if (options.defaultText) {
                textField.text = options.defaultText;
            }
            if (options.inputType === inputType.password) {
                textField.secure = true;
            } else if (options.inputType === inputType.email) {
                textField.keyboardType = 'email';
            } else if (options.inputType === inputType.number) {
                textField.keyboardType = 'number';
            } else if (options.inputType === inputType.phone) {
                textField.keyboardType = 'phone';
            }

            switch (options.capitalizationType) {
                case capitalizationType.all: {
                    textField.autocapitalizationType = 'allcharacters';
                    break;
                }
                case capitalizationType.sentences: {
                    textField.autocapitalizationType = 'sentences';
                    break;
                }
                case capitalizationType.words: {
                    textField.autocapitalizationType = 'words';
                    break;
                }
            }
            stackLayout.addChild(textField);
            if (options.view instanceof View) {
                stackLayout.addChild(options.view);
            }
            options.view = stackLayout;

            const alertController = createAlertController(options, resolve);
            addButtonsToAlertController(
                alertController,
                options,
                (r) => {
                    alertController._resolveFunction = null;
                    resolve({ result: r, text: textField.text });
                },
                (r) => ({ result: r, text: textField.text })
            );
            if (options.autoFocus) {
                alertController.autoFocusTextField = textField;
            }
            showUIAlertController(alertController, options);
        } catch (ex) {
            reject(ex);
        }
    });
}

export function login(...args): Promise<LoginResult> {
    let options: LoginOptions & MDCAlertControlerOptions;

    const defaultOptions = {
        okButtonText: DialogStrings.OK,
        cancelButtonText: DialogStrings.CANCEL
    };

    if (args.length === 1) {
        if (Utils.isString(args[0])) {
            options = defaultOptions;
            options.message = args[0];
        } else {
            options = Object.assign(defaultOptions, args[0]);
        }
    } else if (args.length === 2) {
        if (Utils.isString(args[0]) && Utils.isString(args[1])) {
            options = defaultOptions;
            options.message = args[0];
            options.userName = args[1];
        }
    } else if (args.length === 3) {
        if (Utils.isString(args[0]) && Utils.isString(args[1]) && Utils.isString(args[2])) {
            options = defaultOptions;
            options.message = args[0];
            options.userName = args[1];
            options.password = args[2];
        }
    }

    return new Promise<LoginResult>((resolve, reject) => {
        try {
            const stackLayout = options.stackViewHolder ?? new StackLayout();
            if (options.messageView instanceof View) {
                stackLayout.addChild(options.messageView);
            }
            const userNameTextField = createTextField();
            userNameTextField.marginBottom = 10;
            const passwordTextField = createTextField();
            userNameTextField.hint = options.userNameHint || 'Username';
            userNameTextField.text = options.userName;
            passwordTextField.hint = options.passwordHint || 'Password';
            passwordTextField.text = options.password;
            passwordTextField.secure = true;

            if (options.usernameTextFieldProperties) {
                Object.assign(userNameTextField, options.usernameTextFieldProperties);
            }
            if (options.passwordTextFieldProperties) {
                Object.assign(passwordTextField, options.passwordTextFieldProperties);
            }

            stackLayout.addChild(userNameTextField);
            stackLayout.addChild(passwordTextField);
            if (options.view instanceof View) {
                stackLayout.addChild(options.view);
            }
            options.view = stackLayout;
            const alertController = createAlertController(options, resolve);

            addButtonsToAlertController(
                alertController,
                options,
                (r) => {
                    resolve({
                        result: r,
                        userName: userNameTextField.text,
                        password: passwordTextField.text
                    });
                },
                (r) => ({ result: r, userName: userNameTextField.text, password: passwordTextField.text })
            );

            if (options.beforeShow) {
                options.beforeShow(options, userNameTextField, passwordTextField);
            }
            if (options.autoFocus) {
                alertController.autoFocusTextField = userNameTextField;
            }
            showUIAlertController(alertController, options);
        } catch (ex) {
            reject(ex);
        }
    });
}

function showUIAlertController(alertController: AlertController, options: DialogOptions & MDCAlertControlerOptions) {
    let rootView = Application.getRootView();
    if (rootView.parent) {
        rootView = rootView.parent as any;
    }
    let currentView = getCurrentPage() || rootView;
    if (currentView) {
        currentView = currentView.modal || currentView;
        let viewController = currentView.viewController;
        if (!viewController) {
            throw new Error('no_controller_to_show_dialog');
        }

        // we check root modal view if there is no currently presented one or if the current one is an alert dialog without a child presented view
        if (
            (!viewController.presentedViewController ||
                (viewController.presentedViewController && viewController.presentedViewController['isAlertController'] && !viewController.presentedViewController.presentedViewController)) &&
            rootView.viewController.presentedViewController &&
            !rootView.viewController.presentedViewController.beingDismissed
        ) {
            viewController = rootView.viewController.presentedViewController;
        }

        while (viewController.presentedViewController && !viewController.presentedViewController.beingDismissed) {
            while (
                viewController.presentedViewController instanceof UIAlertController ||
                (viewController.presentedViewController?.['isAlertController'] && viewController.presentedViewController.presentedViewController)
            ) {
                viewController = viewController.presentedViewController;
            }
            // the alert just reached has nothing presented on top: show on it
            if (!viewController.presentedViewController || viewController.presentedViewController instanceof UIAlertController || viewController.presentedViewController['isAlertController']) {
                break;
            } else {
                viewController = viewController.presentedViewController;
            }
        }
        if (showingDialogs.indexOf(alertController) === -1) {
            showingDialogs.push(alertController);
        }
        function block() {
            if (alertController.popoverPresentationController) {
                alertController.popoverPresentationController.sourceView = viewController.view;
                alertController.popoverPresentationController.sourceRect = CGRectMake(viewController.view.bounds.size.width / 2.0, viewController.view.bounds.size.height / 2.0, 1.0, 1.0);
                alertController.popoverPresentationController.permittedArrowDirections = 0 as any;
            }
            viewController.presentViewControllerAnimatedCompletion(alertController, true, () => {
                if (alertController.autoFocusTextField) {
                    alertController.autoFocusTextField.requestFocus();
                    alertController.autoFocusTextField = null;
                }
            });
        }
        if (viewController.presentedViewController) {
            if (viewController.presentedViewController.beingDismissed || options.iosForceClosePresentedViewController === true) {
                viewController.dismissViewControllerAnimatedCompletion(true, () => {
                    block();
                });
            } else {
                throw new Error('controller_already_presented');
            }
        } else {
            block();
        }
        return viewController;
    }
    throw new Error('no_controller_to_show_dialog');
}

export function action(...args): Promise<string> {
    let options: ActionOptions & MDCAlertControlerOptions;

    const defaultOptions = {
        cancelButtonText: DialogStrings.CANCEL
    };

    if (args.length === 1) {
        if (Utils.isString(args[0])) {
            options = defaultOptions;
            options.message = args[0];
        } else {
            options = Object.assign(defaultOptions, args[0]);
        }
    } else if (args.length === 2) {
        if (Utils.isString(args[0]) && Utils.isString(args[1])) {
            options = defaultOptions;
            options.message = args[0];
            options.cancelButtonText = args[1];
        }
    } else if (args.length === 3) {
        if (Utils.isString(args[0]) && Utils.isString(args[1]) && Utils.isDefined(args[2])) {
            options = defaultOptions;
            options.message = args[0];
            options.cancelButtonText = args[1];
            options.actions = args[2];
        }
    }

    return new Promise<string>((resolve, reject) => {
        try {
            // an action sheet is the native pattern to choose between actions
            const alertController = createAlertController(options, resolve, UIAlertControllerStyle.ActionSheet);

            if (options.actions) {
                for (const action of options.actions) {
                    if (Utils.isString(action)) {
                        alertController.addAction(
                            UIAlertAction.actionWithTitleStyleHandler(action, UIAlertActionStyle.Default, (arg: UIAlertAction) => {
                                alertController.clear();
                                resolve(arg.title);
                            })
                        );
                    }
                }
            }

            if (Utils.isString(options.cancelButtonText)) {
                alertController.addAction(
                    UIAlertAction.actionWithTitleStyleHandler(options.cancelButtonText, UIAlertActionStyle.Cancel, (arg: UIAlertAction) => {
                        alertController.clear();
                        resolve(arg.title);
                    })
                );
            }

            showUIAlertController(alertController, options);
        } catch (ex) {
            reject(ex);
        }
    });
}
