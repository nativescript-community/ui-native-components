import { Color } from '@nativescript/core';
import { DismissReasons, SnackBarAction, SnackBarBase, SnackBarOptions } from './index-common';
export { DismissReasons, SnackBarAction };

// Swift bridge in platforms/ios/src/NSCLiquidToast.swift
declare class NSCLiquidToast extends NSObject {
    static showWithMessageActionTextDurationTextColorBackgroundColorActionColorMaxLinesOnActionOnDismiss(
        message: string,
        actionText: string,
        duration: number,
        textColor: UIColor,
        backgroundColor: UIColor,
        actionColor: UIColor,
        maxLines: number,
        onAction: () => void,
        onDismiss: (reason: string) => void
    ): NSCLiquidToast;
    dismiss(): void;
}

function getReason(value: string) {
    switch (value) {
        case 'timeout':
            return DismissReasons.TIMEOUT;
        case 'swipe':
            return DismissReasons.SWIPE;
        case 'action':
            return DismissReasons.ACTION;
        case 'replaced':
            return DismissReasons.CONSECUTIVE;
        case 'manual':
        case 'tap':
        case 'dismissAll':
            return DismissReasons.MANUAL;
        default:
            return DismissReasons.UNKNOWN;
    }
}

function toUIColor(color?: string | Color) {
    return color ? (color instanceof Color ? color : new Color(color)).ios : null;
}

/**
 * iOS: toasts are drawn with liquid-toasts (https://github.com/SimplifyJobs/liquid-toasts, SwiftUI): Liquid Glass on iOS 26,
 * frosted material before. The Swift package is declared in this plugin `nativescript.config.ts` and bridged by `NSCLiquidToast`.
 * `maxLines` is applied; `isRTL`, `view` and `anchorView` are Android only.
 */
export class SnackBar extends SnackBarBase {
    private _toast: NSCLiquidToast;
    private _resolve: Function;

    show() {
        return new Promise<any>((resolve) => {
            this.initSnack(this._options, resolve);
        });
    }
    dismiss() {
        const toast = this._toast;
        if (!toast) {
            return Promise.resolve({ action: SnackBarAction.NONE, command: SnackBarAction.NONE, message: 'No snackbar to dismiss' });
        }
        return new Promise<any>((resolve) => {
            const previous = this._resolve;
            this._resolve = (result) => {
                previous?.(result);
                resolve(result);
            };
            toast.dismiss();
        });
    }
    initSnack(options: SnackBarOptions, resolve?: Function) {
        this._resolve = resolve;
        const hideDelay = options.hideDelay ?? 3000;
        this._toast = NSCLiquidToast.showWithMessageActionTextDurationTextColorBackgroundColorActionColorMaxLinesOnActionOnDismiss(
            options.message,
            options.actionText || null,
            hideDelay / 1000,
            toUIColor(options.textColor),
            toUIColor(options.backgroundColor),
            toUIColor(options.actionTextColor),
            options.maxLines || 0,
            null,
            (reason) => {
                this._toast = null;
                // the action handler runs after the dismissal: the reason is the only reliable signal
                const command = reason === 'action' ? SnackBarAction.ACTION : SnackBarAction.DISMISS;
                const result = { action: command, command, reason: getReason(reason) };
                this._resolve?.(result);
                this._resolve = null;
            }
        );
    }
}

export function showSnack(options: SnackBarOptions) {
    return new SnackBar().showSnack(options);
}
