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

    focus();
    blur();
    requestFocus();
    clearFocus();
    setSelection(start: number, stop?: number);
}

export function initTextInputEditText(); // android only
