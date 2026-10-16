import { TextViewBase } from './textview.common';

/**
 * iOS: native UITextView (core TextView).
 * `requestFocus()`/`clearFocus()` are kept. Material only visuals (variant, floating label, helper, error, counter, strokes...)
 * are no-op: they are not part of the iOS guidelines.
 */
export class TextView extends TextViewBase {
    public requestFocus() {
        this.focus();
    }
    public clearFocus() {
        this.nativeViewProtected?.resignFirstResponder();
    }
}
