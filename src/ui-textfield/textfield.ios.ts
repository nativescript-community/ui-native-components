import { digitsProperty } from '@nativescript-community/ui-core/textbase/cssproperties';
import { TextField as NTextField } from '@nativescript/core';
import { TextFieldBase } from './textfield.common';

/**
 * iOS: native UITextField (core TextField).
 * Functional additions are kept: `digits`, `secureWithoutAutofill`, `requestFocus()`/`clearFocus()`.
 * Material only visuals (variant, floating label, helper, error, counter, strokes...) are no-op:
 * they are not part of the iOS guidelines.
 */
export class TextField extends TextFieldBase {
    //TODO: remove as it needs to be added after TS 5.7 change https://github.com/microsoft/TypeScript/pull/59860
    [key: symbol]: (...args: any[]) => any | void;

    private nsdigits?: NSCharacterSet;

    public requestFocus() {
        this.focus();
    }
    public clearFocus() {
        this.nativeViewProtected?.resignFirstResponder();
    }

    textFieldShouldChangeCharactersInRangeReplacementString(textField: UITextField, range: NSRange, replacementString: string): boolean {
        // ignore if not in our allowed digits
        if (this.nsdigits && replacementString.length > 0 && NSString.stringWithString(replacementString).rangeOfCharacterFromSet(this.nsdigits).location === NSNotFound) {
            return false;
        }
        if (this.secureWithoutAutofill && !textField.secureTextEntry) {
            // Helps avoid iOS 12+ autofill strong password suggestion prompt
            // https://github.com/expo/expo/issues/2571#issuecomment-473347380
            textField.secureTextEntry = true;
        }
        // not part of the public typings of core TextField
        return (NTextField.prototype as any).textFieldShouldChangeCharactersInRangeReplacementString.call(this, textField, range, replacementString);
    }

    [digitsProperty.setNative](value: string) {
        this.nsdigits = value ? NSCharacterSet.characterSetWithCharactersInString(value) : null;
    }
}
