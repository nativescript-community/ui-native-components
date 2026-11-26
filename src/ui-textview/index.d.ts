/**
 * TextView component: core TextView augmented with helper/error/counter/floating label and strokes.
 * Android uses Material TextInputLayout. iOS uses the native UITextView (Material only visuals are no-op).
 * @module @nativescript-community/ui-textview
 */

import { Color, EditableTextBase } from '@nativescript/core';

export type TextViewProperties = Partial<Pick<TextView, keyof TextView>>;
export class TextView extends EditableTextBase {
    /*
     * nativeView
     * @Android : com.google.android.material.textfield.TextInputLayout
     * @iOS : UITextView
     */
    nativeViewProtected: any;

    helper: string;
    helperColor: Color;
    counterMaxLength: number;
    errorColor: Color;
    floating: boolean;
    placeholderColor: Color;
    variant: string;
    error: string;

    /**
     * Android: when false, the text view ignores the touches: no scroll, no selection. Used by a parent which takes the touch (a sheet dragged from the text).
     * @platform android
     * @default true
     */
    isScrollEnabled: boolean;

    focus();
    /**
     * Removes the focus from the text and hides the keyboard.
     */
    blur();
    requestFocus();
    clearFocus();
    setSelection(start: number, stop?: number);
}

export function initTextInputEditText(); // android only
