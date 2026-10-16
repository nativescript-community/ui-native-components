/**
 * BottomSheet: adds `showBottomSheet()`/`closeBottomSheet()` to every View.
 * Android uses Material BottomSheetDialogFragment. iOS uses the native UISheetPresentationController.
 * @module @nativescript-community/ui-bottomsheet
 */

import { View, ViewBase } from '@nativescript/core';
import { BottomSheetDetent, BottomSheetOptions } from './bottomsheet-common';

export { BottomSheetDetent, BottomSheetOptions };

export declare abstract class ViewWithBottomSheetBase extends View {
    // used when triggering the closing of the bottomsheet
    /**
     * @hidden
     */
    protected _closeBottomSheetCallback: Function;

    // used when the bottomSheet is dismissed
    /**
     * @hidden
     */
    public _onDismissBottomSheetCallback: Function;

    /**
     * @hidden
     */
    _bottomSheetFragment: any; // com.google.android.material.bottomsheet.BottomSheetDialogFragment

    /**
     * @hidden
     */
    protected abstract _hideNativeBottomSheet(parent: any, whenClosedCallback: any): void;

    /**
     * @hidden
     */
    protected _bottomSheetContext: any;

    /**
     * @hidden
     */
    _raiseShownBottomSheetEvent(): void;

    /**
     * @hidden
     */
    public _bottomSheetClosed(): void;

    /**
     * @hidden
     */
    protected abstract _showNativeBottomSheet(parent: View, options: BottomSheetOptions): void;

    /**
     * @hidden
     */
    protected _commonShowNativeBottomSheet(parent: View, options: BottomSheetOptions): void;

    /**
     * @hidden
     */
    protected _raiseShowingBottomSheetEvent(): void;

    /**
     * closes the current BottomSheet
     *
     * @param args anything you want as a result of the `showBottomSheet` Promise
     */
    public closeBottomSheet(...args: any): void;

    /**
     *  shows a modal BottomSheet
     *
     * @param {BottomSheetOptions} options
     * @returns {View} view - the view shown in the BottomSheet
     */
    public showBottomSheet(options: BottomSheetOptions): ViewBase;

    /**
     * Moves the shown sheet to a detent
     * @param index index in the `detents` option
     */
    public setBottomSheetDetentIndex(index: number, animated?: boolean): void;

    /**
     * Index of the detent the sheet currently rests at
     */
    public getBottomSheetDetentIndex(): number;
}
export function install(): void;

declare module '@nativescript/core/ui/core/view' {
    interface View {
        closeBottomSheet(...args: any): void;
        showBottomSheet(options: BottomSheetOptions): ViewBase;
        setBottomSheetDetentIndex(index: number, animated?: boolean): void;
        getBottomSheetDetentIndex(): number;
    }
}
