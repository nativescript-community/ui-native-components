/**
 * TextField component: core TextField augmented with helper/error/counter/floating label, strokes, `digits`...
 * Android uses Material TextInputLayout. iOS uses the native UITextField: Material only visuals are no-op,
 * functional additions (`digits`, `secureWithoutAutofill`, `requestFocus()`/`clearFocus()`) are kept.
 * @module @nativescript-community/ui-textfield
 */

import { Color, TextField as NTextField } from '@nativescript/core';
import { VerticalTextAlignment } from '@nativescript-community/text';

export type TextFieldProperties = Partial<Pick<TextField, keyof TextField>>;
export class TextField extends NTextField {
    /*
     * nativeView
     * @Android : com.google.android.material.textfield.TextInputLayout
     * @iOS : UITextField
     */
    nativeViewProtected: any;

    secureWithoutAutofill: boolean;
    closeOnReturn: boolean;

    helper: string;
    helperColor: Color;
    counterMaxLength: number;
    errorColor: Color;
    floating: boolean;
    placeholderColor: Color;
    variant: string;
    error: string;
    strokeColor: Color;
    strokeInactiveColor: Color;
    strokeDisabledColor: Color;
    floatingColor: Color;
    floatingInactiveColor: Color;
    buttonColor: Color;
    digits: string;
    verticalTextAlignment: VerticalTextAlignment;

    focus();
    blur();
    requestFocus();
    clearFocus();
    setSelection(start: number, stop?: number);
}

export function initTextInputEditText(); // android only
