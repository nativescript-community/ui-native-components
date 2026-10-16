import { Color, colorProperty, fontInternalProperty, Font } from '@nativescript/core';
import { CheckBoxBase, checkedColorProperty, checkedProperty, indeterminateProperty, textProperty } from './checkbox-common';
export * from './checkbox-common';

// the typings of the Material classes do not have the checked states (Material 1.7+)
type NativeCheckBox = any;
const getMCB = (): any => com.google.android.material.checkbox.MaterialCheckBox;

export class CheckBox extends CheckBoxBase {
    nativeViewProtected: NativeCheckBox;

    public createNativeView() {
        return new com.google.android.material.checkbox.MaterialCheckBox(this._context);
    }

    public initNativeView(): void {
        super.initNativeView();
        const owner = new WeakRef(this);
        const listener = new (getMCB().OnCheckedStateChangedListener)({
            onCheckedStateChangedListener(checkBox, state) {
                const view = owner.get();
                if (!view) {
                    return;
                }
                const checked = state === getMCB().STATE_CHECKED;
                const indeterminate = state === getMCB().STATE_INDETERMINATE;
                if (view.indeterminate !== indeterminate) {
                    indeterminateProperty.nativeValueChange(view, indeterminate);
                }
                if (view.checked !== checked) {
                    checkedProperty.nativeValueChange(view, checked);
                }
            }
        });
        this.nativeViewProtected.addOnCheckedStateChangedListener(listener);
        this.nativeViewProtected.listener = listener;
    }

    public disposeNativeView() {
        if (this.nativeViewProtected?.listener) {
            this.nativeViewProtected.removeOnCheckedStateChangedListener(this.nativeViewProtected.listener);
            this.nativeViewProtected.listener = null;
        }
        super.disposeNativeView();
    }

    private updateState() {
        const MCB = getMCB();
        this.nativeViewProtected.setCheckedState(this.indeterminate ? MCB.STATE_INDETERMINATE : this.checked ? MCB.STATE_CHECKED : MCB.STATE_UNCHECKED);
    }

    [textProperty.setNative](value: string) {
        this.nativeViewProtected.setText(value || '');
    }
    [checkedProperty.setNative](value: boolean) {
        this.updateState();
    }
    [indeterminateProperty.setNative](value: boolean) {
        this.updateState();
    }
    [colorProperty.setNative](value: Color) {
        if (value) {
            this.nativeViewProtected.setTextColor(value.android);
        }
    }
    [fontInternalProperty.setNative](value: Font) {
        if (value?.fontSize) {
            this.nativeViewProtected.setTextSize(value.fontSize);
        }
        const typeface = value?.getAndroidTypeface?.();
        if (typeface) {
            this.nativeViewProtected.setTypeface(typeface);
        }
    }
    [checkedColorProperty.setNative](value: Color) {
        // box color: checked and indeterminate, the unchecked box keeps the theme color
        if (value) {
            const states = Array.create('[I', 3);
            states[0] = Array.create('int', 1);
            states[0][0] = android.R.attr.state_checked;
            states[1] = Array.create('int', 1);
            states[1][0] = com.google.android.material.R.attr.state_indeterminate;
            states[2] = Array.create('int', 0);
            const current = this.nativeViewProtected.getButtonTintList();
            const unchecked = current ? current.getDefaultColor() : android.graphics.Color.GRAY;
            const colors = Array.create('int', 3);
            colors[0] = value.android;
            colors[1] = value.android;
            colors[2] = unchecked;
            this.nativeViewProtected.setButtonTintList(new android.content.res.ColorStateList(states, colors));
        } else {
            this.nativeViewProtected.setButtonTintList(null);
        }
    }
}
