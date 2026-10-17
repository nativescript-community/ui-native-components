import { Trace } from '@nativescript/core';
import { DismissReasons, SnackBarAction, SnackBarBase, SnackBarOptions } from './index-common';
export { DismissReasons, SnackBarAction };

/**
 * iOS: there is no snackbar in the Apple Human Interface Guidelines (they recommend passive status feedback near the content
 * and alerts for critical information). This component is Android only (Material): on iOS nothing is shown
 * and the promise resolves immediately.
 */
export class SnackBar extends SnackBarBase {
    show() {
        if (__DEV__) {
            Trace.write(`SnackBar is not available on iOS: "${this._options?.message}" was not shown`, Trace.categories.Debug, Trace.messageType.warn);
        }
        return Promise.resolve({ action: SnackBarAction.NONE, reason: DismissReasons.UNKNOWN });
    }
    dismiss() {
        return Promise.resolve({ action: SnackBarAction.NONE, reason: DismissReasons.MANUAL });
    }
    initSnack(options: SnackBarOptions, resolve?: Function) {}
}

export function showSnack(options: SnackBarOptions) {
    return new SnackBar().showSnack(options);
}
